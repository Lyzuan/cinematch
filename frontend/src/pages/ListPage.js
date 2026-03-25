import React, { useEffect, useState } from 'react';
import { fetchSimilar } from '../services/api';
import DetailsModal from '../components/DetailsModal';
import './ListPage.css';

const PLACEHOLDER = 'https://via.placeholder.com/60x90/222225/5a5856?text=?';

/**
 * ListPage — Lista expandida de recomendações similares
 * Abre quando o usuário clica em "Ver lista completa" na FinalPage
 */
function ListPage({ chosen, recommendations, contentType, onBack, onChooseNew }) {
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailsItem, setDetailsItem] = useState(null);

  // Se não houver chosen, usa o primeiro item das recomendações como base para similares
  const baseItem = chosen?.id ? chosen : recommendations?.[0];

  useEffect(() => {
    if (!baseItem?.id) {
      setSimilar([]);
      setLoading(false);
      return;
    }

    fetchSimilar(baseItem.id, contentType)
      .then((data) => setSimilar(data))
      .catch(() => setError('Não foi possível carregar mais recomendações.'))
      .finally(() => setLoading(false));
  }, [chosen, contentType]);

  // Junta recomendações da IA + similares do TMDB, sem duplicatas
  const allItems = [
    ...recommendations,
    ...similar.filter(
      (s) => !recommendations.some((r) => r.title.toLowerCase() === s.title.toLowerCase())
    ),
  ].filter((item) => item.title.toLowerCase() !== chosen?.title?.toLowerCase());
  // Se veio da ResultsPage sem chosen, mostra tudo incluindo as recomendações

  return (
    <div className="list-page">
      <div className="container">

        <header className="list-header">
          <button className="btn-ghost" onClick={onBack}>← Voltar</button>
          <h1 className="list-title">Mais para você</h1>
          <p className="list-subtitle">
            {chosen
              ? <>Recomendações baseadas em <strong>{chosen.title}</strong></>
              : 'Todas as sugestões para você'}
          </p>
        </header>

        {error && <div className="error-box" style={{ marginBottom: '20px' }}>{error}</div>}

        {loading && (
          <div className="list-loading">
            <div className="spinner" />
            <p>Buscando mais opções...</p>
          </div>
        )}

        {!loading && (
          <div className="list-items">
            {allItems.map((item) => (
              <div key={item.title} className="list-item">

                <img
                  className="list-item__poster"
                  src={item.poster_path || PLACEHOLDER}
                  alt={item.title}
                  onError={(e) => { e.target.src = PLACEHOLDER; }}
                />

                <div className="list-item__info">
                  <div className="list-item__meta">
                    {item.release_year && <span>{item.release_year}</span>}
                    {item.rating && (
                      <span className="list-item__rating">★ {Number(item.rating).toFixed(1)}</span>
                    )}
                  </div>
                  <h3 className="list-item__title">{item.title}</h3>
                  {item.justification && (
                    <p className="list-item__just">{item.justification}</p>
                  )}
                </div>

                <div className="list-item__actions">
                  {item.id && (
                    <button
                      className="btn-ghost list-btn-detail"
                      onClick={() => setDetailsItem(item)}
                    >
                      ℹ Detalhes
                    </button>
                  )}
                  <button
                    className="btn-primary list-btn-choose"
                    onClick={() => onChooseNew(item)}
                  >
                    Assistir
                  </button>
                </div>

              </div>
            ))}

            {allItems.length === 0 && !loading && (
              <p className="list-empty">Nenhuma recomendação adicional encontrada.</p>
            )}
          </div>
        )}
      </div>

      {/* Modal de detalhes */}
      {detailsItem && (
        <DetailsModal
          item={detailsItem}
          contentType={contentType}
          onClose={() => setDetailsItem(null)}
        />
      )}
    </div>
  );
}

export default ListPage;
