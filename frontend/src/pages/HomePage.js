import React, { useState } from 'react';
import SelectionChip from '../components/SelectionChip';
import { fetchRecommendations } from '../services/api';
import './HomePage.css';

// Opções disponíveis para o usuário
const GENRES = ['Ação', 'Comédia', 'Terror', 'Romance', 'Ficção Científica', 'Drama'];
const MOODS = ['Leve', 'Tenso', 'Engraçado', 'Emocionante'];

/**
 * HomePage - Página de seleção de preferências
 * O usuário escolhe gêneros (multi) e humor (único), depois clica em Recomendar
 */
function HomePage({ onRecommendations }) {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedMood, setSelectedMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Toggle de gênero: adiciona ou remove da lista
  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const canSubmit = selectedGenres.length > 0 && selectedMood && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError('');
    setLoading(true);

    try {
      // Envia em minúsculo para o backend mapear para IDs do TMDB
      const recs = await fetchRecommendations(
        selectedGenres.map((g) => g.toLowerCase()),
        selectedMood.toLowerCase()
      );
      onRecommendations(recs, { genres: selectedGenres, mood: selectedMood });
    } catch (err) {
      const msg = err.response?.data?.error || 'Erro ao buscar recomendações. Tente novamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <div className="container">

        {/* Header */}
        <header className="home-header">
          <div className="home-header__logo">🎬</div>
          <h1 className="home-header__title">CineMatch</h1>
          <p className="home-header__subtitle">
            Diga como você está e receba filmes feitos para o seu momento.
          </p>
        </header>

        {/* Formulário de seleção */}
        <main className="home-form">

          {/* Gêneros */}
          <section className="selection-section">
            <p className="section-label">Que tipo de filme?</p>
            <div className="chips-group">
              {GENRES.map((genre) => (
                <SelectionChip
                  key={genre}
                  label={genre}
                  active={selectedGenres.includes(genre)}
                  onClick={() => toggleGenre(genre)}
                />
              ))}
            </div>
            <p className="selection-hint">Selecione um ou mais gêneros</p>
          </section>

          <hr className="divider" />

          {/* Humor */}
          <section className="selection-section">
            <p className="section-label">Como você está se sentindo?</p>
            <div className="chips-group">
              {MOODS.map((mood) => (
                <SelectionChip
                  key={mood}
                  label={mood}
                  active={selectedMood === mood}
                  onClick={() => setSelectedMood(mood)}
                />
              ))}
            </div>
            <p className="selection-hint">Escolha seu humor atual</p>
          </section>

          <hr className="divider" />

          {/* Erro */}
          {error && <div className="error-box" style={{ marginBottom: '24px' }}>{error}</div>}

          {/* Botão principal */}
          <div className="home-submit">
            {loading ? (
              <div className="loading-state">
                <div className="spinner" />
                <p className="loading-text">Consultando a IA... pode demorar alguns segundos</p>
              </div>
            ) : (
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={!canSubmit}
              >
                Recomendar filmes
              </button>
            )}
            {!canSubmit && !loading && (
              <p className="submit-hint">Selecione pelo menos um gênero e um humor</p>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}

export default HomePage;
