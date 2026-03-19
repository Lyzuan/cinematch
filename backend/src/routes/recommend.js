const express = require('express');
const router = express.Router();
const { getSondagem, getRecommendations } = require('../controllers/recommendController');

// ETAPA 1: busca 5 itens para sondagem do gosto do usuário
router.post('/sondagem', getSondagem);

// ETAPA 2: gera recomendações personalizadas baseadas nas avaliações
router.post('/recommend', getRecommendations);

module.exports = router;
