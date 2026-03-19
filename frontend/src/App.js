import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import SondagemPage from './pages/SondagemPage';
import ResultsPage from './pages/ResultsPage';
import FinalPage from './pages/FinalPage';

/**
 * App.js — Gerencia o fluxo entre as 4 etapas da aplicação:
 *
 * home → sondagem → results → final
 */
function App() {
  const [page, setPage] = useState('home');
  const [sessionData, setSessionData] = useState({
    genres: [],
    mood: '',
    contentType: 'movie', // 'movie' | 'tv'
    candidates: [],       // lista completa do TMDB (reutilizada na etapa 2)
    sondagem: [],         // 5 itens para avaliação
    avaliacoes: [],       // avaliações do usuário { title, stars }
    recommendations: [],  // recomendações finais da IA
    chosen: null,         // item escolhido pelo usuário no final
  });

  const goTo = (nextPage, data = {}) => {
    setSessionData((prev) => ({ ...prev, ...data }));
    setPage(nextPage);
  };

  const restart = () => {
    setSessionData({ genres: [], mood: '', contentType: 'movie', candidates: [], sondagem: [], avaliacoes: [], recommendations: [], chosen: null });
    setPage('home');
  };

  return (
    <>
      {page === 'home' && (
        <HomePage onNext={(data) => goTo('sondagem', data)} />
      )}
      {page === 'sondagem' && (
        <SondagemPage
          sessionData={sessionData}
          onNext={(data) => goTo('results', data)}
          onBack={() => goTo('home')}
        />
      )}
      {page === 'results' && (
        <ResultsPage
          sessionData={sessionData}
          onChoose={(chosen) => goTo('final', { chosen })}
          onBack={() => goTo('sondagem')}
        />
      )}
      {page === 'final' && (
        <FinalPage
          chosen={sessionData.chosen}
          contentType={sessionData.contentType}
          onRestart={restart}
        />
      )}
    </>
  );
}

export default App;
