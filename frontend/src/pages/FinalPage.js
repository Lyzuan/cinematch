import React from 'react';
import './FinalPage.css';

const PLACEHOLDER = 'https://via.placeholder.com/120x180/222225/5a5856?text=Sem+Poster';

// Mensagem e emoji por tipo de conteúdo
const FINAL_CONFIG = {
  movie:       { emoji: '🍿', message: 'Bom filme 🍿, te vejo em breve!' },
  tv:          { emoji: '📺', message: 'Boa série 📺, te vejo em breve!' },
  anime:       { emoji: '🎌', message: 'Bom anime 🎌, te vejo em breve!' },
  dorama:      { emoji: '🌸', message: 'Bom dorama 🌸, te vejo em breve!' },
  documentary: { emoji: '🎥', message: 'Bom documentário 🎥, te vejo em breve!' },
};

/**
 * FinalPage — Tela de encerramento após o usuário escolher o que vai assistir
 */
function FinalPage({ chosen, contentType, onRestart }) {
  const config = FINAL_CONFIG[contentType] || FINAL_CONFIG.movie;

  return (
    <div className="final-page">
      <div className="container final-container">

        {chosen?.poster_path && (
          <img
            className="final-poster"
            src={chosen.poster_path || PLACEHOLDER}
            alt={chosen.title}
            onError={(e) => { e.target.src = PLACEHOLDER; }}
          />
        )}

        <div className="final-emoji">{config.emoji}</div>
        <h1 className="final-message">{config.message}</h1>

        <p className="final-chosen">
          Você escolheu:{' '}
          <strong className="final-chosen__title">{chosen?.title}</strong>
        </p>

        {chosen?.rating && (
          <p className="final-rating">★ {Number(chosen.rating).toFixed(1)} no TMDB</p>
        )}

        <button className="btn-ghost final-restart" onClick={onRestart}>
          ↩ Buscar outra sugestão
        </button>

      </div>
    </div>
  );
}

export default FinalPage;
