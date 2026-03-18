import React, { useState } from 'react';
import MovieCard from '../components/MovieCard';
import { fetchRecommendations } from '../services/api';
import './ResultsPage.css';

/**
 * ResultsPage - Exibe as recomendações geradas pela IA
 * Permite feedback por filme e re-recomendação evitando os não-gostados
 */
function ResultsPage({ recommendations, selections, onBack }) {
  // Armazena feedback por título: { 'Titulo do Filme': 'like' | 'dislike' }
  const [feedbackMap, setFeedbackMap] = useState({});
  const [movies, setMovies] = useState(recommendations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFeedback = (title, type) => {
    setFeedbackMap((prev) => ({ ...prev, [title]: type }));
  };

  // Recarrega recomendações enviando os filmes não-gostados como feedback
  const handleRefresh = async () => {
    const dislikedTitles = Object.entries(feedbackMap)
      .filter(([, type]) => type === 'dislike')
      .map(([title]) => title);

    setError('');
    setLoading(true);
    setFeedbackMap({});

    try {
      const newRecs = await fetchRecommendations(
        selections.genres.map((g) => g.toLowerCase()),
        selections.mood.toLowerCase(),
        dislikedTitles
      );
      setMovies(newRecs);
    } catch (err) {
      const msg = err.response?.data?.error || 'Erro ao atualizar recomendações.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const hasDisliked = Object.values(feedbackMap).some((v) => v === 'dislike');

  return (
    <div className="results-page">
      <div className="container">

        {/* Header */}
        <header className="results-header">
          <button className="btn-ghost results-back" onClick={onBack}>
            ← Voltar
          </button>
          <div className="results-header__info">
            <h1 className="results-title">Suas recomendações</h1>
            <p className="results-subtitle">
              <span className="results-tag">{selections.mood}</span>
              {selections.genres.map((g) => (
                <span key={g} className="results-tag">{g}</span>
              ))}
            </p>
          </div>
        </header>

        {/* Erro */}
        {error && <div className="error-box" style={{ marginBottom: '24px' }}>{error}</div>}

        {/* Loading */}
        {loading ? (
          <div className="results-loading">
            <div className="spinner" />
            <p className="loading-text">Atualizando sugestões...</p>
          </div>
        ) : (
          <>
            {/* Lista de filmes */}
            <div className="movies-list">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.title}
                  movie={movie}
                  feedback={feedbackMap[movie.title] || null}
                  onLike={() => handleFeedback(movie.title, 'like')}
                  onDislike={() => handleFeedback(movie.title, 'dislike')}
                />
              ))}
            </div>

            {/* Ações pós-feedback */}
            {hasDisliked && (
              <div className="results-actions">
                <p className="results-actions__hint">
                  Você não gostou de alguns filmes. Quer novas sugestões?
                </p>
                <button className="btn-primary" onClick={handleRefresh}>
                  Atualizar recomendações
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default ResultsPage;
