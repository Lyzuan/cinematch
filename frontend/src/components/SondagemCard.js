import React from 'react';
import StarRating from './StarRating';
import './SondagemCard.css';

const PLACEHOLDER = 'https://via.placeholder.com/90x134/222225/5a5856?text=Sem+Poster';

/**
 * SondagemCard — Card da etapa de sondagem
 * Permite marcar "Já assisti" e avaliar com estrelas
 *
 * @param {object} item - Dados do filme/série
 * @param {boolean} watched - Se o usuário marcou como assistido
 * @param {number} stars - Avaliação de 1-5 (0 = sem avaliação)
 * @param {function} onWatched - Callback ao marcar como assistido
 * @param {function} onStars - Callback ao avaliar
 */
function SondagemCard({ item, watched, stars, onWatched, onStars }) {
  return (
    <div className={`sondagem-card ${watched ? 'watched' : ''}`}>
      <div className="sondagem-card__poster">
        <img
          src={item.poster_path || PLACEHOLDER}
          alt={item.title}
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />
      </div>

      <div className="sondagem-card__info">
        <div className="sondagem-card__meta">
          {item.release_year && <span className="meta-year">{item.release_year}</span>}
          {item.rating && <span className="meta-rating">★ {Number(item.rating).toFixed(1)}</span>}
        </div>

        <h3 className="sondagem-card__title">{item.title}</h3>

        <div className="sondagem-card__actions">
          {/* Botão "Já assisti" */}
          <button
            type="button"
            className={`btn-watched ${watched ? 'active' : ''}`}
            onClick={onWatched}
          >
            {watched ? '✓ Já assisti' : 'Já assisti'}
          </button>

          {/* Estrelas — só aparecem após marcar como assistido */}
          {watched && (
            <div className="sondagem-card__stars">
              <span className="stars-label">Avalie:</span>
              <StarRating value={stars} onChange={onStars} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SondagemCard;
