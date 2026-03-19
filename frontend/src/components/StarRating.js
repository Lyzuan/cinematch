import React, { useState } from 'react';
import './StarRating.css';

/**
 * StarRating — Componente de avaliação de 1 a 5 estrelas
 * @param {number} value - Valor atual (0 = sem avaliação)
 * @param {function} onChange - Callback com o valor selecionado
 * @param {boolean} disabled - Desabilita interação
 */
function StarRating({ value, onChange, disabled }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="star-rating" aria-label="Avalie de 1 a 5 estrelas">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn ${star <= (hovered || value) ? 'filled' : ''}`}
          onClick={() => !disabled && onChange(star)}
          onMouseEnter={() => !disabled && setHovered(star)}
          onMouseLeave={() => !disabled && setHovered(0)}
          disabled={disabled}
          aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default StarRating;
