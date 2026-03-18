import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';

/**
 * App.js - Componente raiz
 * Gerencia a navegação simples entre as duas páginas
 * usando estado local (sem react-router)
 */
function App() {
  // 'home' | 'results'
  const [currentPage, setCurrentPage] = useState('home');

  // Dados compartilhados entre páginas
  const [recommendations, setRecommendations] = useState([]);
  const [selections, setSelections] = useState({ genres: [], mood: '' });

  const handleRecommendationsReceived = (recs, sel) => {
    setRecommendations(recs);
    setSelections(sel);
    setCurrentPage('results');
  };

  const handleBack = () => {
    setCurrentPage('home');
    setRecommendations([]);
  };

  return (
    <div>
      {currentPage === 'home' && (
        <HomePage onRecommendations={handleRecommendationsReceived} />
      )}
      {currentPage === 'results' && (
        <ResultsPage
          recommendations={recommendations}
          selections={selections}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

export default App;
