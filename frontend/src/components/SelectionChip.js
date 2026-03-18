import React from 'react';

/**
 * SelectionChip - Botão toggle reutilizável
 * Usado para seleção de gêneros e humor
 */
function SelectionChip({ label, active, onClick }) {
  return (
    <button
      className={`chip ${active ? 'active' : ''}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

export default SelectionChip;
