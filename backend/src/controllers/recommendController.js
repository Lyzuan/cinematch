const tmdbService = require('../services/tmdbService');
const geminiService = require('../services/geminiService');

/**
 * Controller principal: orquestra TMDB + Gemini para gerar recomendações
 */
const getRecommendations = async (req, res) => {
  const { genres, mood, feedback } = req.body;

  // Validação básica de entrada
  if (!genres || genres.length === 0 || !mood) {
    return res.status(400).json({
      error: 'Campos obrigatórios: genres (array) e mood (string)',
    });
  }

  try {
    // 1. Busca filmes candidatos no TMDB com base nos gêneros
    const candidates = await tmdbService.fetchMoviesByGenres(genres);

    if (!candidates || candidates.length === 0) {
      return res.status(404).json({ error: 'Nenhum filme encontrado para os gêneros selecionados' });
    }

    // 2. Envia candidatos + contexto para o Gemini selecionar os melhores
    const recommendations = await geminiService.getRecommendations({
      genres,
      mood,
      feedback: feedback || [],
      candidates,
    });

    return res.json({ recommendations });
  } catch (error) {
    console.error('Erro ao gerar recomendações:', error.message);
    return res.status(500).json({ error: 'Falha ao gerar recomendações. Verifique as chaves de API.' });
  }
};

module.exports = { getRecommendations };
