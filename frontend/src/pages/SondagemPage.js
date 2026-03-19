import React, { useState } from 'react';
import SondagemCard from '../components/SondagemCard';
import { fetchRecommendations } from '../services/api';
import './SondagemPage.css';

/**
 * SondagemPage — Etapa 2 do fluxo
 * Exibe 5 filmes/séries e pergunta o que o usuário já assistiu e como avaliou
 * Ao confirmar, envia avaliações para a IA gerar recomendações personalizadas
 */
function SondagemPage({ sessionData, onNext, onBack }) {
  const { sondagem, candidates, genres, mood, contentType } = sessionData;
  const tipo = contentType === 'tv' ? 'série' : 'filme';

  // Estado de cada item: { watched: bool, stars: number }
  const [interactions, setInteractions] = useState(
    () => Object.fromEntries(sondagem.map((item) => [item.title, { watched: false, stars: 0 }]))
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleWatched = (title) => {
    setInteractions((prev) => ({
      ...prev,
      [title]: { ...prev[title], watched: !prev[title].watched, stars: 0 },
    }));
  };

  const setStars = (title, stars) => {
    setInteractions((prev) => ({
      ...prev,
      [title]: { ...prev[title], stars },
    }));
  };

  // Verifica se todos os itens marcados como assistidos têm avaliação
  const watchedItems = sondagem.filter((item) => interactions[item.title]?.watched);
  const allRated = watchedItems.every((item) => interactions[item.title]?.stars > 0);
  const canProceed = !loading;

  const handleNext = async () => {
    // Monta array de avaliações: só itens assistidos com estrelas
    const avaliacoes = watchedItems
      .filter((item) => interactions[item.title]?.stars > 0)
      .map((item) => ({
        title: item.title,
        stars: interactions[item.title].stars,
      }));

    setError('');
    setLoading(true);

    try {
      const recommendations = await fetchRecommendations(
        genres,
        mood,
        contentType,
        candidates,
        avaliacoes
      );

      onNext({ avaliacoes, recommendations });
    } catch (err) {
      const msg = err.response?.data?.error || '';
      if (msg.includes('Limite') || err.response?.status === 429) {
        setError('⏳ Limite da API atingido. Aguarde 1 minuto e tente novamente.');
      } else {
        setError(msg || 'Erro ao gerar recomendações. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sondagem-page">
      <div className="container">

        <header className="sondagem-header">
          <button className="btn-ghost" onClick={onBack}>← Voltar</button>
          <h1 className="sondagem-title">Você já assistiu algum desses?</h1>
          <p className="sondagem-subtitle">
            Marque o que já viu e avalie para que a IA entenda seu gosto.
            Se não viu nenhum, pode pular direto.
          </p>
        </header>

        {/* Lista de sondagem */}
        <div className="sondagem-list">
          {sondagem.map((item) => (
            <SondagemCard
              key={item.title}
              item={item}
              watched={interactions[item.title]?.watched || false}
              stars={interactions[item.title]?.stars || 0}
              onWatched={() => toggleWatched(item.title)}
              onStars={(stars) => setStars(item.title, stars)}
            />
          ))}
        </div>

        {/* Aviso se marcou como assistido mas não avaliou */}
        {watchedItems.length > 0 && !allRated && (
          <p className="sondagem-hint">
            ⚠️ Avalie com estrelas os {tipo}s que você marcou como assistido para melhores recomendações
          </p>
        )}

        {error && <div className="error-box" style={{ margin: '24px 0' }}>{error}</div>}

        <div className="sondagem-actions">
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p className="loading-text">A IA está analisando suas preferências...</p>
            </div>
          ) : (
            <>
              <button className="btn-primary" onClick={handleNext} disabled={!canProceed}>
                {watchedItems.length === 0
                  ? 'Não vi nenhum — recomendar assim mesmo →'
                  : 'Ver recomendações →'}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default SondagemPage;
