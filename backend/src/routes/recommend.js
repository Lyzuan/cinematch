const express = require('express');
const router = express.Router();
const { getSondagem, getRecommendations, getDetails, getSimilar } = require('../controllers/recommendController');

router.post('/sondagem', getSondagem);
router.post('/recommend', getRecommendations);
router.get('/details/:id', getDetails);
router.get('/similar/:id', getSimilar);

module.exports = router;
