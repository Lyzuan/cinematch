import React, { useEffect, useState } from 'react';
import { fetchDetails } from '../services/api';
import './DetailsModal.css';

/**
 * DetailsModal — Modal com sinopse completa e onde assistir
 * Abre sobre a FinalPage quando o usuário clica em "Mais detalhes"
 */
function DetailsModal({ item, contentType, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!item?.id) {
      setError('ID do item não disponível.');
      setLoading(false);
      return;
    }

    fetchDetails(item.id, contentType)
      .then((d) => setDetails(d))
      .catch(() => setError('Não foi possível carregar os detalhes.'))
      .finally(() => setLoading(false));
  }, [item, contentType]);

  // Fecha ao clicar fora do modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal">
        <button className="modal-close" onClick={onClose} aria-label="Fechar">✕</button>

        {loading && (
          <div className="modal-loading">
            <div className="spinner" />
            <p>Buscando detalhes...</p>
          </div>
        )}

        {error && <div className="error-box">{error}</div>}

        {details && !loading && (
          <>
            {/* Header com poster e info básica */}
            <div className="modal-header">
              {details.poster_path && (
                <img
                  className="modal-poster"
                  src={details.poster_path}
                  alt={details.title}
                />
              )}
              <div className="modal-header__info">
                <h2 className="modal-title">{details.title}</h2>
                {details.tagline && (
                  <p className="modal-tagline">"{details.tagline}"</p>
                )}
                <div className="modal-meta">
                  {details.release_year && <span>{details.release_year}</span>}
                  {details.rating && <span>★ {Number(details.rating).toFixed(1)}</span>}
                  {details.runtime && <span>⏱ {details.runtime} min</span>}
                </div>
                {details.genres?.length > 0 && (
                  <div className="modal-genres">
                    {details.genres.map((g) => (
                      <span key={g} className="modal-genre-tag">{g}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sinopse completa */}
            <div className="modal-section">
              <h3 className="modal-section__title">Sinopse</h3>
              <p className="modal-overview">{details.overview}</p>
            </div>

            {/* Onde assistir */}
            <div className="modal-section">
              <h3 className="modal-section__title">Onde assistir no Brasil</h3>
              {details.streaming?.length > 0 ? (
                <div className="modal-streaming">
                  {details.streaming.map((p) => (
                    <div key={p.name} className="streaming-provider">
                      <img src={p.logo} alt={p.name} title={p.name} />
                      <span>{p.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="modal-no-streaming">
                  Nenhum serviço de streaming disponível no Brasil no momento.
                  <a
                    href={details.tmdb_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modal-tmdb-link"
                  >
                    Ver no TMDB →
                  </a>
                </p>
              )}
            </div>

            {/* Link TMDB */}
            <div className="modal-footer">
              <a
                href={details.tmdb_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost modal-tmdb-btn"
              >
                Ver página completa no TMDB →
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DetailsModal;
