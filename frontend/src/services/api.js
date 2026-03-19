import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 40000,
});

/**
 * ETAPA 1 — Busca itens para sondagem
 */
export const fetchSondagem = async (genres, mood, contentType) => {
  const response = await api.post('/sondagem', { genres, mood, contentType });
  return response.data; // { sondagem, candidates }
};

/**
 * ETAPA 2 — Busca recomendações personalizadas
 */
export const fetchRecommendations = async (genres, mood, contentType, candidates, avaliacoes) => {
  const response = await api.post('/recommend', {
    genres,
    mood,
    contentType,
    candidates,
    avaliacoes,
  });
  return response.data.recommendations;
};
