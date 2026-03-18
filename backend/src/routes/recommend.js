const express = require('express');
const router = express.Router();
const recommendController = require('../controllers/recommendController');

// POST /api/recommend - Gera recomendações de filmes
router.post('/recommend', recommendController.getRecommendations);

module.exports = router;
