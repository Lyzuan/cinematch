const axios = require('axios');
const geminiConfig = require('../config/gemini');

// Label legível por tipo de conteúdo (usado nos prompts)
const CONTENT_TYPE_LABEL = {
  movie:       'filmes',
  tv:          'séries',
  anime:       'animes',
  dorama:      'doramas',
  documentary: 'documentários',
};

// ─────────────────────────────────────────────
// Utilitários
// ─────────────────────────────────────────────

/**
 * Faz parse seguro do JSON retornado pelo Gemini.
 * Lida com markdown, texto extra antes/depois e JSON truncado.
 */
const parseGeminiJson = (rawText) => {
  // Remove blocos de código markdown
  let clean = rawText
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/g, '')
    .trim();

  // Encontra o início do array JSON
  const startIndex = clean.indexOf('[');
  const endIndex = clean.lastIndexOf(']');

  if (startIndex === -1) {
    console.error('[Gemini] Texto sem array JSON:\n', rawText);
    throw new Error('Nenhum array JSON encontrado na resposta do Gemini');
  }

  // Se achou o fechamento do array, usa ele diretamente
  if (endIndex !== -1 && endIndex > startIndex) {
    try {
      return JSON.parse(clean.slice(startIndex, endIndex + 1));
    } catch {
      // continua para tentativa de reparo
    }
  }

  // Tenta parsear do início do array até o fim
  let jsonText = clean.slice(startIndex);
  try {
    return JSON.parse(jsonText);
  } catch {
    // JSON truncado: fecha na última entrada completa
    const lastComplete = jsonText.lastIndexOf('},');
    if (lastComplete !== -1) {
      const repaired = jsonText.slice(0, lastComplete + 1) + ']';
      try {
        const result = JSON.parse(repaired);
        console.warn(`[Gemini] JSON reparado — ${result.length} itens recuperados`);
        return result;
      } catch {
        // continua para erro final
      }
    }
    console.error('[Gemini] Texto bruto:\n', rawText);
    throw new Error('Falha ao parsear JSON do Gemini mesmo após tentativa de reparo');
  }
};

/**
 * Aguarda N milissegundos (usado no retry de 429)
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Chama o Gemini com retry automático em caso de erro 429 (rate limit).
 * Plano gratuito: 15 req/min — aguarda 65s antes de tentar novamente.
 *
 * @param {string} prompt    - Prompt a enviar
 * @param {number} maxRetries - Número máximo de tentativas (padrão: 3)
 */
const callGemini = async (prompt, maxRetries = 3) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY não configurada no .env');
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
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
      if (!rawText) throw new Error('Resposta vazia do Gemini');
      return rawText;

    } catch (err) {
      const is429 = err.response?.status === 429;
      const isLastAttempt = attempt === maxRetries;

      if (is429 && !isLastAttempt) {
        // Lê o retryDelay sugerido pelo Gemini, ou usa 65s como padrão
        const retryAfter = err.response?.data?.error?.details
          ?.find((d) => d['@type']?.includes('RetryInfo'))
          ?.retryDelay?.replace('s', '') || 65;

        const waitMs = (parseInt(retryAfter, 10) + 5) * 1000; // +5s de margem
        console.warn(`[Gemini] Rate limit (429) — tentativa ${attempt}/${maxRetries}. Aguardando ${waitMs / 1000}s...`);
        await sleep(waitMs);
        continue; // tenta novamente
      }

      // Outro erro ou última tentativa — lança o erro
      if (is429) {
        throw new Error('Limite de requisições do Gemini atingido. Tente novamente em alguns minutos.');
      }
      throw err;
    }
  }
};

/**
 * Busca o candidate correspondente ao título retornado pelo Gemini.
 * Usa correspondência exata primeiro, depois parcial como fallback.
 */
const findCandidate = (candidates, title) => {
  const normalizedTitle = title.toLowerCase().trim();

  // 1. Correspondência exata
  const exact = candidates.find(
    (c) => c.title.toLowerCase().trim() === normalizedTitle
  );
  if (exact) return exact;

  // 2. Correspondência parcial (o Gemini às vezes abrevia ou altera levemente o título)
  const partial = candidates.find(
    (c) =>
      c.title.toLowerCase().includes(normalizedTitle) ||
      normalizedTitle.includes(c.title.toLowerCase())
  );
  if (partial) {
    console.warn(`[Gemini] Título aproximado: "${title}" → "${partial.title}"`);
    return partial;
  }

  console.warn(`[Gemini] Candidate não encontrado para: "${title}"`);
  return null;
};

// ─────────────────────────────────────────────
// ETAPA 1 — Sondagem
// ─────────────────────────────────────────────

const buildSondagemPrompt = ({ genres, mood, contentType, candidates }) => {
  const tipo = CONTENT_TYPE_LABEL[contentType] || 'filmes';
  const genresList = genres.join(', ');

  // Envia apenas título, ano e nota — sem sinopse — para reduzir tokens
  const lista = candidates
    .map((m, i) => `${i + 1}. "${m.title}" (${m.release_year}) - Nota TMDB: ${m.rating.toFixed(1)}`)
    .join('\n');

  return `Você é um especialista em entretenimento. Selecione EXATAMENTE 5 ${tipo} da lista abaixo para sondar o gosto do usuário.

PREFERÊNCIAS DO USUÁRIO:
- Gêneros: ${genresList}
- Humor: ${mood}

LISTA DISPONÍVEL (${candidates.length} itens):
${lista}

REGRAS OBRIGATÓRIAS:
- Retorne EXATAMENTE 5 itens
- Use APENAS títulos da lista acima, copiados exatamente como aparecem
- Escolha títulos variados e populares, que o usuário provavelmente conhece
- NÃO invente títulos, NÃO adicione justificativa

RESPOSTA: apenas o array JSON abaixo, sem nenhum texto adicional:
[
  { "title": "Título exato da lista" },
  { "title": "Título exato da lista" },
  { "title": "Título exato da lista" },
  { "title": "Título exato da lista" },
  { "title": "Título exato da lista" }
]`;
};

/**
 * ETAPA 1: Retorna exatamente 5 itens para sondagem.
 * Se o Gemini retornar menos, completa com candidates restantes.
 */
const getSondagem = async ({ genres, mood, contentType, candidates }) => {
  const prompt = buildSondagemPrompt({ genres, mood, contentType, candidates });
  const rawText = await callGemini(prompt);
  const parsed = parseGeminiJson(rawText);

  // Enriquece com dados do TMDB
  const enriched = parsed
    .map((rec) => {
      const candidate = findCandidate(candidates, rec.title);
      if (!candidate) return null;
      return {
        title: candidate.title, // usa o título exato do TMDB
        poster_path: candidate.poster_path || null,
        rating: candidate.rating || null,
        release_year: candidate.release_year || null,
        content_type: contentType,
      };
    })
    .filter(Boolean); // remove nulos

  // Garante sempre 5 itens — completa com candidates não usados se necessário
  if (enriched.length < 5) {
    const usedTitles = new Set(enriched.map((e) => e.title.toLowerCase()));
    const extras = candidates
      .filter((c) => !usedTitles.has(c.title.toLowerCase()))
      .slice(0, 5 - enriched.length)
      .map((c) => ({
        title: c.title,
        poster_path: c.poster_path || null,
        rating: c.rating || null,
        release_year: c.release_year || null,
        content_type: contentType,
      }));

    console.warn(`[Sondagem] Gemini retornou ${enriched.length} itens — completando com ${extras.length} extras`);
    return [...enriched, ...extras];
  }

  return enriched.slice(0, 5); // garante máximo de 5
};

// ─────────────────────────────────────────────
// ETAPA 2 — Recomendação final
// ─────────────────────────────────────────────

const buildRecomendacaoPrompt = ({ genres, mood, contentType, candidates, avaliacoes }) => {
  const tipo = CONTENT_TYPE_LABEL[contentType] || 'filmes';
  const genresList = genres.join(', ');

  const avaliacoesStr = avaliacoes.length > 0
    ? avaliacoes.map((a) => `- "${a.title}": ${a.stars}/5 estrelas`).join('\n')
    : '- Usuário não avaliou nenhum item (recomendar pelos gêneros e humor)';

  const jaVistos = avaliacoes.map((a) => a.title.toLowerCase());

  // Filtra da lista candidatos já avaliados e envia apenas título + nota
  const lista = candidates
    .filter((c) => !jaVistos.includes(c.title.toLowerCase()))
    .map((m, i) => `${i + 1}. "${m.title}" (${m.release_year}) - Nota TMDB: ${m.rating.toFixed(1)}`)
    .join('\n');

  return `Você é um especialista em entretenimento. Recomende EXATAMENTE 5 ${tipo} baseado no perfil do usuário.

PREFERÊNCIAS DO USUÁRIO:
- Gêneros: ${genresList}
- Humor: ${mood}

AVALIAÇÕES DO USUÁRIO (o que já assistiu):
${avaliacoesStr}

ANÁLISE DAS AVALIAÇÕES:
- 4-5 estrelas = adorou → recomende similares em estilo e tom
- 3 estrelas = achou ok → similares com cautela
- 1-2 estrelas = não gostou → EVITE similares

LISTA DE ${tipo.toUpperCase()} DISPONÍVEIS (já excluídos os assistidos):
${lista}

REGRAS OBRIGATÓRIAS:
- Retorne EXATAMENTE 5 itens
- Use APENAS títulos da lista acima, copiados exatamente
- Cada justificativa: máximo 12 palavras
- NÃO repita itens já avaliados

RESPOSTA: apenas o array JSON abaixo, sem nenhum texto adicional:
[
  { "title": "Título exato da lista", "justification": "Justificativa curta" },
  { "title": "Título exato da lista", "justification": "Justificativa curta" },
  { "title": "Título exato da lista", "justification": "Justificativa curta" },
  { "title": "Título exato da lista", "justification": "Justificativa curta" },
  { "title": "Título exato da lista", "justification": "Justificativa curta" }
]`;
};

/**
 * ETAPA 2: Retorna exatamente 5 recomendações personalizadas.
 * Se o Gemini retornar menos, completa com candidates restantes.
 */
const getRecomendacoes = async ({ genres, mood, contentType, candidates, avaliacoes }) => {
  const prompt = buildRecomendacaoPrompt({ genres, mood, contentType, candidates, avaliacoes });
  const rawText = await callGemini(prompt);
  const parsed = parseGeminiJson(rawText);

  const jaVistos = new Set(avaliacoes.map((a) => a.title.toLowerCase()));

  // Enriquece com dados do TMDB
  const enriched = parsed
    .map((rec) => {
      const candidate = findCandidate(candidates, rec.title);
      if (!candidate) return null;
      return {
        title: candidate.title,
        justification: rec.justification || 'Recomendado com base no seu perfil.',
        poster_path: candidate.poster_path || null,
        rating: candidate.rating || null,
        release_year: candidate.release_year || null,
        content_type: contentType,
      };
    })
    .filter(Boolean);

  // Garante sempre 5 itens
  if (enriched.length < 5) {
    const usedTitles = new Set(enriched.map((e) => e.title.toLowerCase()));
    const extras = candidates
      .filter((c) => !usedTitles.has(c.title.toLowerCase()) && !jaVistos.has(c.title.toLowerCase()))
      .slice(0, 5 - enriched.length)
      .map((c) => ({
        title: c.title,
        justification: 'Recomendado com base nos seus gêneros favoritos.',
        poster_path: c.poster_path || null,
        rating: c.rating || null,
        release_year: c.release_year || null,
        content_type: contentType,
      }));

    console.warn(`[Recomendação] Gemini retornou ${enriched.length} itens — completando com ${extras.length} extras`);
    return [...enriched, ...extras];
  }

  return enriched.slice(0, 5);
};

module.exports = { getSondagem, getRecomendacoes };
