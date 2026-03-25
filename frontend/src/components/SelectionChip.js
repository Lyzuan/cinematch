import React from 'react';

/**
 * SelectionChip — Botão toggle reutilizável
 * @param {string}   label    - Texto do chip
 * @param {boolean}  active   - Se está selecionado
 * @param {boolean}  disabled - Desabilita quando limite de gêneros atingido
 * @param {function} onClick  - Callback ao clicar
 */
function SelectionChip({ label, active, disabled, onClick }) {
  return (
    <button
      className={`chip ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
      title={disabled ? 'Limite de 5 gêneros atingido' : ''}
    >
      {label}
    </button>
  );
}

export default SelectionChip;
