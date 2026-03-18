const axios = require('axios');
const geminiConfig = require('../config/gemini');

/**
 * Monta o prompt estruturado para o Gemini selecionar os melhores filmes
 */
const buildPrompt = ({ genres, mood, feedback, candidates }) => {
  const genresList = genres.join(', ');
  const feedbackSection =
    feedback.length > 0
      ? `\nFilmes que o usuário NÃO gostou (evite sugerir): ${feedback.join(', ')}`
      : '\nNenhum feedback anterior.';

  const moviesList = candidates
    .map(
      (m, i) =>
        `${i + 1}. "${m.title}" (${m.release_year}) - Nota: ${m.rating.toFixed(1)}\n   Sinopse: ${m.overview}`
    )
    .join('\n\n');

  return `Você é um especialista em cinema. Sua tarefa é recomendar os 5 melhores filmes para um usuário com base no contexto abaixo.

CONTEXTO DO USUÁRIO:
- Gêneros preferidos: ${genresList}
- Humor atual: ${mood}${feedbackSection}

FILMES CANDIDATOS:
${moviesList}

INSTRUÇÕES:
1. Selecione exatamente 5 filmes da lista acima
2. Priorize filmes que combinem com o humor "${mood}" do usuário
3. Evite filmes que o usuário não gostou
4. Para cada filme, escreva UMA frase curta (máximo 20 palavras) explicando por que é uma boa escolha para o usuário

RESPONDA APENAS com um array JSON válido, sem texto adicional, sem markdown, sem blocos de código. Formato exato:
[
  {
    "title": "Nome exato do filme",
    "justification": "Justificativa personalizada aqui"
  }
]`;
};

/**
 * Chama a API do Gemini usando as configurações centralizadas de config/gemini.js
 */
const getRecommendations = async ({ genres, mood, feedback, candidates }) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY não configurada no .env');
  }

  const prompt = buildPrompt({ genres, mood, feedback, candidates });

  const response = await axios.post(
    `${geminiConfig.getEndpointUrl()}?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: geminiConfig.generationConfig,
      safetySettings: geminiConfig.safetySettings,
    },
    { timeout: geminiConfig.timeout }
  );

  const rawText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('Resposta vazia do Gemini');
  }

  // Remove possíveis marcações markdown caso o modelo as inclua
  // Remove markdown e tenta extrair apenas o array JSON da resposta
  const cleanText = rawText
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  // Extrai o array JSON mesmo que venha com texto extra antes/depois
  // Tenta extrair o array JSON, mesmo que esteja incompleto
  let jsonText = cleanText;
  const startIndex = cleanText.indexOf('[');
  if (startIndex !== -1) {
    jsonText = cleanText.slice(startIndex);
  }

  // Tenta parsear; se falhar, tenta reparar o JSON truncado fechando o array
  try {
    recommendations = JSON.parse(jsonText);
  } catch {
    // Tenta fechar o JSON truncado: remove a última entrada incompleta e fecha o array
    const lastComplete = jsonText.lastIndexOf('},');
    if (lastComplete !== -1) {
      jsonText = jsonText.slice(0, lastComplete + 1) + ']';
      recommendations = JSON.parse(jsonText);
    } else {
      console.error('Texto bruto do Gemini:', rawText);
      throw new Error('Falha ao parsear resposta JSON do Gemini');
    }
  }

  // Enriquece as recomendações com poster e dados do TMDB
  return recommendations.map((rec) => {
    const candidate = candidates.find(
      (c) => c.title.toLowerCase() === rec.title.toLowerCase()
    );
    return {
      title: rec.title,
      justification: rec.justification,
      poster_path: candidate?.poster_path || null,
      rating: candidate?.rating || null,
      release_year: candidate?.release_year || null,
    };
  });
};

module.exports = { getRecommendations };
