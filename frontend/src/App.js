import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import SondagemPage from './pages/SondagemPage';
import ResultsPage from './pages/ResultsPage';
import FinalPage from './pages/FinalPage';
import ListPage from './pages/ListPage';

/**
 * App.js — Fluxo de 5 páginas:
 * home → sondagem → results → final → list (opcional)
 */
function App() {
  const [page, setPage] = useState('home');
  const [sessionData, setSessionData] = useState({
    genres: [],
    mood: '',
    contentType: 'movie',
    candidates: [],
    sondagem: [],
    avaliacoes: [],
    recommendations: [],
    chosen: null,
  });

  const goTo = (nextPage, data = {}) => {
    setSessionData((prev) => ({ ...prev, ...data }));
    setPage(nextPage);
  };

  const restart = () => {
    setSessionData({
      genres: [], mood: '', contentType: 'movie',
      candidates: [], sondagem: [], avaliacoes: [],
      recommendations: [], chosen: null,
    });
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
          onViewList={() => goTo('list')}
        />
      )}
      {page === 'final' && (
        <FinalPage
          chosen={sessionData.chosen}
          contentType={sessionData.contentType}
          onRestart={restart}
          onViewList={() => goTo('list')}
        />
      )}
      {page === 'list' && (
        <ListPage
          chosen={sessionData.chosen}
          recommendations={sessionData.recommendations}
          contentType={sessionData.contentType}
          onBack={() => goTo(sessionData.chosen ? 'final' : 'results')}
          onChooseNew={(newItem) => goTo('final', { chosen: newItem })}
        />
      )}
    </>
  );
}

export default App;
