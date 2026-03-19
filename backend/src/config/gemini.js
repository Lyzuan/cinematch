/**
 * config/gemini.js
 * Configurações centralizadas da API do Gemini
 */

const geminiConfig = {
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',

  // gemini-2.5-flash → rápido e eficiente
  // gemini-2.5-pro   → mais inteligente, respostas mais elaboradas
  model: 'gemini-2.5-flash',

  action: 'generateContent',

  generationConfig: {
    // 0.0 = determinístico | 1.0 = criativo
    // Baixamos para 0.3 para respostas mais previsíveis e JSON mais limpo
    temperature: 0.3,

    // 4096 garante espaço para 5 itens completos sem truncar
    maxOutputTokens: 4096,

    topP: 0.9,
    topK: 40,
  },

  safetySettings: [
    { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  ],

  timeout: 40000,
};

geminiConfig.getEndpointUrl = () => {
  return `${geminiConfig.baseUrl}/${geminiConfig.model}:${geminiConfig.action}`;
};

module.exports = geminiConfig;
