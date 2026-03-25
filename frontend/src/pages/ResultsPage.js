import React from 'react';
import './ResultsPage.css';

const PLACEHOLDER = 'https://via.placeholder.com/80x120/222225/5a5856?text=Sem+Poster';

/**
 * ResultsPage — Etapa 3 do fluxo
 * Exibe as 5 recomendações personalizadas pela IA
 * O usuário pode escolher um item ou ver a lista completa
 */
function ResultsPage({ sessionData, onChoose, onBack, onViewList }) {
  const { recommendations, contentType } = sessionData;

  const CONTENT_LABEL = {
    movie: 'filmes', tv: 'séries', anime: 'animes',
    dorama: 'doramas', documentary: 'documentários',
  };
  const CONTENT_EMOJI = {
    movie: '🍿', tv: '📺', anime: '🎌', dorama: '🌸', documentary: '🎥',
  };

  const tipoPlural = CONTENT_LABEL[contentType] || 'itens';
  const emoji = CONTENT_EMOJI[contentType] || '🍿';

  return (
    <div className="results-page">
      <div className="container">

        <header className="results-header">
          <button className="btn-ghost results-back" onClick={onBack}>← Voltar</button>
          <div className="results-header__text">
            <h1 className="results-title">Recomendações para você</h1>
            <p className="results-subtitle">
              A IA selecionou esses {tipoPlural}. Escolha o que vai assistir ou explore mais opções.
            </p>
          </div>
        </header>

        {/* Lista de recomendações */}
        <div className="movies-list">
          {recommendations.map((item) => (
            <div key={item.title} className="result-card">

              <img
                className="result-card__poster"
                src={item.poster_path || PLACEHOLDER}
                alt={item.title}
                onError={(e) => { e.target.src = PLACEHOLDER; }}
              />

              <div className="result-card__info">
                <div className="result-card__meta">
                  {item.release_year && <span className="meta-year">{item.release_year}</span>}
                  {item.rating && (
                    <span className="meta-rating">★ {Number(item.rating).toFixed(1)}</span>
                  )}
                </div>

                <h3 className="result-card__title">{item.title}</h3>
                <p className="result-card__justification">{item.justification}</p>

                <button
                  className="btn-primary btn-choose"
                  onClick={() => onChoose(item)}
                >
                  {emoji} Vou assistir esse
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Botão Ver todos — navega para ListPage sem precisar escolher */}
        <div className="results-view-all">
          <p className="results-view-all__hint">Não encontrou o que queria?</p>
          <button className="btn-ghost results-view-all__btn" onClick={onViewList}>
            📋 Ver lista completa de sugestões
          </button>
        </div>

      </div>
    </div>
  );
}

export default ResultsPage;
