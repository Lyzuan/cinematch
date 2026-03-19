import React from 'react';
import './ResultsPage.css';

const PLACEHOLDER = 'https://via.placeholder.com/80x120/222225/5a5856?text=Sem+Poster';

/**
 * ResultsPage — Etapa 3 do fluxo
 * Exibe as 5 recomendações personalizadas pela IA
 * O usuário escolhe uma para assistir e avança para a tela final
 */
function ResultsPage({ sessionData, onChoose, onBack }) {
  const { recommendations, contentType } = sessionData;
  const tipo = contentType === 'tv' ? 'série' : 'filme';

  return (
    <div className="results-page">
      <div className="container">

        <header className="results-header">
          <button className="btn-ghost results-back" onClick={onBack}>← Voltar</button>
          <div>
            <h1 className="results-title">Recomendações para você</h1>
            <p className="results-subtitle">
              A IA analisou seu gosto e selecionou esses {tipo}s. Escolha o que vai assistir:
            </p>
          </div>
        </header>

        <div className="movies-list">
          {recommendations.map((item) => (
            <div key={item.title} className="result-card">

              {/* Poster */}
              <img
                className="result-card__poster"
                src={item.poster_path || PLACEHOLDER}
                alt={item.title}
                onError={(e) => { e.target.src = PLACEHOLDER; }}
              />

              {/* Informações */}
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
                  {contentType === 'tv' ? '📺' : '🍿'} Vou assistir esse
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default ResultsPage;
