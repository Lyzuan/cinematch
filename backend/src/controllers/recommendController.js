const tmdbService = require('../services/tmdbService');
const geminiService = require('../services/geminiService');

/**
 * ETAPA 1 — POST /api/sondagem
 * Recebe gêneros, humor e tipo de conteúdo
 * Retorna 5 itens para o usuário dizer o que já assistiu
 */
const getSondagem = async (req, res) => {
  const { genres, mood, contentType } = req.body;

  if (!genres || genres.length === 0 || !mood || !contentType) {
    return res.status(400).json({
      error: 'Campos obrigatórios: genres (array), mood (string), contentType ("movie" | "tv")',
    });
  }

  try {
    const candidates = await tmdbService.fetchByGenres(genres, contentType);

    if (!candidates || candidates.length === 0) {
      return res.status(404).json({ error: 'Nenhum conteúdo encontrado para os gêneros selecionados' });
    }

    const sondagem = await geminiService.getSondagem({ genres, mood, contentType, candidates });

    // Retorna também os candidates para reusar na etapa 2 sem nova chamada ao TMDB
    return res.json({ sondagem, candidates });
  } catch (error) {
    console.error('Erro na sondagem:', error.message);
    return res.status(500).json({ error: 'Falha na sondagem. Verifique as chaves de API.' });
  }
};

/**
 * ETAPA 2 — POST /api/recommend
 * Recebe gêneros, humor, tipo, candidates (da etapa 1) e avaliações do usuário
 * Retorna 5 recomendações personalizadas com justificativa
 */
const getRecommendations = async (req, res) => {
  const { genres, mood, contentType, candidates, avaliacoes } = req.body;

  if (!genres || !mood || !contentType || !candidates || !avaliacoes) {
    return res.status(400).json({
      error: 'Campos obrigatórios: genres, mood, contentType, candidates, avaliacoes',
    });
  }

  try {
    const recommendations = await geminiService.getRecomendacoes({
      genres,
      mood,
      contentType,
      candidates,
      avaliacoes,
    });

    return res.json({ recommendations });
  } catch (error) {
    console.error('Erro ao gerar recomendações:', error.message);
    return res.status(500).json({ error: 'Falha ao gerar recomendações.' });
  }
};

module.exports = { getSondagem, getRecommendations };
