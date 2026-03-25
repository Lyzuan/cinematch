import React, { useState } from 'react';
import SelectionChip from '../components/SelectionChip';
import { fetchSondagem } from '../services/api';
import './HomePage.css';

/**
 * Configuração dos tipos de conteúdo disponíveis.
 * Cada tipo tem emoji, label, gêneros próprios e um identificador
 * que é enviado ao backend para selecionar o endpoint e genreMap corretos.
 */
const CONTENT_TYPES = [
  { id: 'movie',         emoji: '🎬', label: 'Filme' },
  { id: 'tv',            emoji: '📺', label: 'Série / Streaming' },
  { id: 'anime',         emoji: '🎌', label: 'Anime' },
  { id: 'dorama',        emoji: '🌸', label: 'Dorama' },
  { id: 'documentary',   emoji: '🎥', label: 'Documentário' },
];

/**
 * Gêneros disponíveis por tipo de conteúdo.
 * O backend mapeia esses nomes para IDs do TMDB via genreMap específico.
 */
const GENRES_BY_TYPE = {
  movie: ['Ação', 'Comédia', 'Terror', 'Romance', 'Ficção Científica', 'Drama', 'Thriller', 'Aventura', 'Fantasia', 'Crime'],
  tv:    ['Ação', 'Comédia', 'Drama', 'Romance', 'Ficção Científica', 'Mistério', 'Thriller', 'Crime', 'Fantasia'],
  anime: ['Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Romance', 'Ficção Científica', 'Mistério'],
  dorama:['Romance', 'Drama', 'Comédia', 'Thriller', 'Histórico', 'Ação', 'Mistério'],
  documentary: ['Natureza', 'Crime', 'História', 'Ciência', 'Tecnologia', 'Sociedade', 'Esporte', 'Música'],
};

const MOODS = ['Leve', 'Tenso', 'Engraçado', 'Emocionante'];

/**
 * HomePage — Seleção de tipo de conteúdo, gêneros e humor
 */
function HomePage({ onNext }) {
  const [contentType, setContentType] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedMood, setSelectedMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Ao trocar o tipo de conteúdo, limpa os gêneros pois cada tipo tem sua lista
  const handleContentType = (type) => {
    setContentType(type);
    setSelectedGenres([]);
  };

  const MAX_GENRES = 5;

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genre)) return prev.filter((g) => g !== genre);
      if (prev.length >= MAX_GENRES) return prev; // limite de 5
      return [...prev, genre];
    });
  };

  const currentGenres = GENRES_BY_TYPE[contentType] || [];
  const selectedType = CONTENT_TYPES.find((t) => t.id === contentType);
  const canSubmit = contentType && selectedGenres.length > 0 && selectedMood && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError('');
    setLoading(true);

    try {
      const { sondagem, candidates } = await fetchSondagem(
        selectedGenres.map((g) => g.toLowerCase()),
        selectedMood.toLowerCase(),
        contentType
      );

      onNext({
        genres: selectedGenres.map((g) => g.toLowerCase()),
        mood: selectedMood.toLowerCase(),
        contentType,
        sondagem,
        candidates,
      });
    } catch (err) {
      const msg = err.response?.data?.error || '';
      if (msg.includes('Limite') || err.response?.status === 429) {
        setError('⏳ Limite da API atingido. Aguarde 1 minuto e tente novamente.');
      } else {
        setError(msg || 'Erro ao conectar. Verifique se o backend está rodando.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <div className="container">
        <header className="home-header">
          <div className="home-header__logo">🎬</div>
          <h1 className="home-header__title">CineMatch</h1>
          <p className="home-header__subtitle">
            Responda algumas perguntas e receba sugestões feitas para o seu momento.
          </p>
        </header>

        <main className="home-form">

          {/* Tipo de conteúdo */}
          <section className="selection-section">
            <p className="section-label">O que você quer assistir?</p>
            <div className="content-type-group">
              {CONTENT_TYPES.map((type) => (
                <button
                  key={type.id}
                  className={`content-type-btn ${contentType === type.id ? 'active' : ''}`}
                  onClick={() => handleContentType(type.id)}
                  type="button"
                >
                  <span className="content-type-btn__emoji">{type.emoji}</span>
                  <span className="content-type-btn__label">{type.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Gêneros — só aparece após selecionar o tipo */}
          {contentType && (
            <>
              <hr className="divider" />
              <section className="selection-section">
                <p className="section-label">
                  Que tipo de {selectedType?.label.toLowerCase()}?
                </p>
                <div className="chips-group">
                  {currentGenres.map((genre) => (
                    <SelectionChip
                      key={genre}
                      label={genre}
                      active={selectedGenres.includes(genre)}
                      disabled={!selectedGenres.includes(genre) && selectedGenres.length >= MAX_GENRES}
                      onClick={() => toggleGenre(genre)}
                    />
                  ))}
                </div>
                <p className="selection-hint">Selecione até {MAX_GENRES} gêneros ({selectedGenres.length}/{MAX_GENRES})</p>
              </section>
            </>
          )}

          {/* Humor — só aparece após selecionar gênero */}
          {selectedGenres.length > 0 && (
            <>
              <hr className="divider" />
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
            </>
          )}

          {/* Botão de envio — só aparece quando tudo está preenchido */}
          {selectedMood && (
            <>
              <hr className="divider" />
              {error && <div className="error-box" style={{ marginBottom: '24px' }}>{error}</div>}
              <div className="home-submit">
                {loading ? (
                  <div className="loading-state">
                    <div className="spinner" />
                    <p className="loading-text">Consultando a IA...</p>
                  </div>
                ) : (
                  <button className="btn-primary" onClick={handleSubmit} disabled={!canSubmit}>
                    Começar →
                  </button>
                )}
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
}

export default HomePage;
