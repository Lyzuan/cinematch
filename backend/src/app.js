const express = require('express');
const cors = require('cors');
const recommendRoutes = require('./routes/recommend');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api', recommendRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'CineMatch API online 🎬' });
});

// Handler de erros global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

module.exports = app;
