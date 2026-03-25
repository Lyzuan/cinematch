const tmdbService = require('../services/tmdbService');
const geminiService = require('../services/geminiService');

/** ETAPA 1 — POST /api/sondagem */
const getSondagem = async (req, res) => {
  const { genres, mood, contentType } = req.body;
  if (!genres || genres.length === 0 || !mood || !contentType) {
    return res.status(400).json({ error: 'Campos obrigatórios: genres, mood, contentType' });
  }
  try {
    const candidates = await tmdbService.fetchByGenres(genres, contentType);
    if (!candidates || candidates.length === 0) {
      return res.status(404).json({ error: 'Nenhum conteúdo encontrado para os gêneros selecionados' });
    }
    const sondagem = await geminiService.getSondagem({ genres, mood, contentType, candidates });
    return res.json({ sondagem, candidates });
  } catch (error) {
    console.error('Erro na sondagem:', error.message);
    return res.status(500).json({ error: error.message || 'Falha na sondagem.' });
  }
};

/** ETAPA 2 — POST /api/recommend */
const getRecommendations = async (req, res) => {
  const { genres, mood, contentType, candidates, avaliacoes } = req.body;
  if (!genres || !mood || !contentType || !candidates || !avaliacoes) {
    return res.status(400).json({ error: 'Campos obrigatórios: genres, mood, contentType, candidates, avaliacoes' });
  }
  try {
    const recommendations = await geminiService.getRecomendacoes({ genres, mood, contentType, candidates, avaliacoes });
    return res.json({ recommendations });
  } catch (error) {
    console.error('Erro ao gerar recomendações:', error.message);
    return res.status(500).json({ error: error.message || 'Falha ao gerar recomendações.' });
  }
};

/**
 * GET /api/details/:id?contentType=movie
 * Retorna detalhes completos + streaming de um item
 */
const getDetails = async (req, res) => {
  const { id } = req.params;
  const { contentType } = req.query;
  if (!id || !contentType) {
    return res.status(400).json({ error: 'Parâmetros obrigatórios: id e contentType' });
  }
  try {
    const details = await tmdbService.fetchDetails(Number(id), contentType);
    return res.json({ details });
  } catch (error) {
    console.error('Erro ao buscar detalhes:', error.message);
    return res.status(500).json({ error: 'Falha ao buscar detalhes.' });
  }
};

/**
 * GET /api/similar/:id?contentType=movie
 * Retorna itens similares para a lista expandida
 */
const getSimilar = async (req, res) => {
  const { id } = req.params;
  const { contentType } = req.query;
  if (!id || !contentType) {
    return res.status(400).json({ error: 'Parâmetros obrigatórios: id e contentType' });
  }
  try {
    const similar = await tmdbService.fetchSimilar(Number(id), contentType);
    return res.json({ similar });
  } catch (error) {
    console.error('Erro ao buscar similares:', error.message);
    return res.status(500).json({ error: 'Falha ao buscar similares.' });
  }
};

module.exports = { getSondagem, getRecommendations, getDetails, getSimilar };
