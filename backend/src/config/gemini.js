/**
 * config/gemini.js
 * Configurações centralizadas da API do Gemini
 * Altere aqui para ajustar o comportamento do modelo sem tocar nos serviços
 */

const geminiConfig = {
  // Endpoint base da API
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',

  // Modelo utilizado
  // Opções disponíveis:
  //   gemini-2.5-flash        → mais rápido, ideal para produção
  //   gemini-2.5-pro          → mais inteligente, respostas mais elaboradas
  //   gemini-1.5-flash        → versão anterior, mais estável
  model: 'gemini-2.5-flash',

  // Ação do endpoint
  action: 'generateContent',

  // Parâmetros de geração do modelo
  generationConfig: {
    // Criatividade das respostas (0.0 = determinístico, 2.0 = muito criativo)
    // 0.7 é um bom equilíbrio para justificativas personalizadas
    temperature: 0.7,

    // Máximo de tokens na resposta
    // 4096 é suficiente para 5 filmes com justificativas curtas
    maxOutputTokens: 4096,

    // Top-P: controla diversidade de vocabulário (0.0 a 1.0)
    // Valores mais baixos = respostas mais focadas
    topP: 0.9,

    // Top-K: limita o número de tokens considerados por vez
    topK: 40,
  },

  // Configurações de segurança (blocos de conteúdo inapropriado)
  // BLOCK_NONE        → sem bloqueio
  // BLOCK_LOW_AND_ABOVE → bloqueia conteúdo potencialmente prejudicial
  // BLOCK_MEDIUM_AND_ABOVE → padrão recomendado
  // BLOCK_ONLY_HIGH   → bloqueia apenas conteúdo claramente prejudicial
  safetySettings: [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  ],

  // Timeout da requisição em milissegundos
  // Gemini pode demorar alguns segundos em horários de pico
  timeout: 30000,
};

// Retorna a URL completa do endpoint
geminiConfig.getEndpointUrl = () => {
  return `${geminiConfig.baseUrl}/${geminiConfig.model}:${geminiConfig.action}`;
};

module.exports = geminiConfig;
