import axios from 'axios';

// Base URL do backend (usa proxy do CRA em dev, ou variável de ambiente em prod)
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 30000, // 30s — Gemini pode demorar um pouco
});

/**
 * Envia as preferências do usuário e retorna as recomendações da IA
 * @param {string[]} genres - Gêneros selecionados
 * @param {string} mood - Humor selecionado
 * @param {string[]} feedback - Títulos de filmes que o usuário não gostou
 * @returns {Promise<Array>} Lista de recomendações
 */
export const fetchRecommendations = async (genres, mood, feedback = []) => {
  const response = await api.post('/recommend', { genres, mood, feedback });
  return response.data.recommendations;
};
