import React from 'react';
import './MovieCard.css';

/**
 * MovieCard - Exibe um filme recomendado com ações de feedback
 * @param {object} movie - Dados do filme (title, justification, poster_path, rating)
 * @param {function} onLike - Callback ao clicar em "gostei"
 * @param {function} onDislike - Callback ao clicar em "não gostei"
 * @param {string|null} feedback - 'like' | 'dislike' | null
 */
function MovieCard({ movie, onLike, onDislike, feedback }) {
  const POSTER_PLACEHOLDER = 'https://via.placeholder.com/200x300/222225/5a5856?text=Sem+Poster';

  return (
    <div className={`movie-card ${feedback ? `feedback-${feedback}` : ''}`}>
      {/* Poster */}
      <div className="movie-card__poster">
        <img
          src={movie.poster_path || POSTER_PLACEHOLDER}
          alt={`Poster de ${movie.title}`}
          onError={(e) => { e.target.src = POSTER_PLACEHOLDER; }}
        />
      </div>

      {/* Informações */}
      <div className="movie-card__info">
        <div className="movie-card__meta">
          {movie.release_year && (
            <span className="movie-card__year">{movie.release_year}</span>
          )}
          {movie.rating && (
            <span className="movie-card__rating">
              ★ {Number(movie.rating).toFixed(1)}
            </span>
          )}
        </div>

        <h3 className="movie-card__title">{movie.title}</h3>

        <p className="movie-card__justification">{movie.justification}</p>

        {/* Botões de feedback */}
        <div className="movie-card__actions">
          <button
            className={`feedback-btn like ${feedback === 'like' ? 'active' : ''}`}
            onClick={onLike}
            disabled={!!feedback}
            title="Gostei"
          >
            👍 Gostei
          </button>
          <button
            className={`feedback-btn dislike ${feedback === 'dislike' ? 'active' : ''}`}
            onClick={onDislike}
            disabled={!!feedback}
            title="Não gostei"
          >
            👎 Não gostei
          </button>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
