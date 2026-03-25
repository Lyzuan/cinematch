const axios = require('axios');
const tmdbConfig = require('../config/tmdb');

/**
 * Busca conteúdo no TMDB de acordo com o tipo selecionado.
 * @param {string[]} genres
 * @param {string}   contentType - 'movie' | 'tv' | 'anime' | 'dorama' | 'documentary'
 */
const fetchByGenres = async (genres, contentType = 'movie') => {
  if (!process.env.TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY não configurada no .env');
  }

  const params = {
    api_key: process.env.TMDB_API_KEY,
    language: tmdbConfig.language,
    sort_by: tmdbConfig.filters.sortBy,
    'vote_average.gte': tmdbConfig.filters.minRating,
    'vote_count.gte': tmdbConfig.filters.minVoteCount,
    page: tmdbConfig.filters.page,
  };

  let endpoint;

  switch (contentType) {
    case 'movie': {
      endpoint = 'discover/movie';
      // Filmes: exclui animação (16) para não misturar com anime
      const ids = getGenreIds(genres, tmdbConfig.genreMap);
      if (ids.length) params.with_genres = ids.join(',');
      params.without_genres = '16';
      break;
    }

    case 'tv': {
      endpoint = 'discover/tv';
      const ids = getGenreIds(genres, tmdbConfig.tvGenreMap);
      if (ids.length) params.with_genres = ids.join(',');
      // Séries: exclui animação e restringe a países não-asiáticos
      params.without_genres = '16';
      params.without_keywords = '210024'; // keyword "anime" no TMDB
      break;
    }

    case 'anime': {
      // Animes: SOMENTE séries de animação japonesas
      endpoint = 'discover/tv';
      params.with_genres = '16';               // animação obrigatório
      params.with_origin_country = 'JP';        // origem japonesa
      params['vote_count.gte'] = 100;
      // Gêneros extras (ação, romance, etc.) como filtro adicional
      const extraIds = getGenreIds(genres, tmdbConfig.animeGenreMap)
        .filter((id) => id !== 16);
      if (extraIds.length) params.with_genres += `|${extraIds.join('|')}`; // OR para não restringir demais
      break;
    }

    case 'dorama': {
      endpoint = 'discover/tv';
      params.with_origin_country = 'KR|JP|CN';
      params['vote_count.gte'] = 50;
      const ids = getGenreIds(genres, tmdbConfig.doramaGenreMap);
      if (ids.length) params.with_genres = ids.join(',');
      params.without_genres = '16'; // exclui animação
      params.without_keywords = '210024'; // exclui anime
      break;
    }

    case 'documentary': {
      endpoint = 'discover/movie';
      params.with_genres = '99'; // documentário sempre forçado
      params['vote_count.gte'] = 100;
      break;
    }

    default:
      endpoint = 'discover/movie';
  }

  const response = await axios.get(`${tmdbConfig.baseUrl}/${endpoint}`, {
    timeout: tmdbConfig.timeout,
    params,
  });

  const items = response.data.results.slice(0, tmdbConfig.filters.maxCandidates);

  if (items.length === 0) {
    throw new Error(`Nenhum resultado encontrado para "${contentType}" com os gêneros selecionados.`);
  }

  return items.map((item) => ({
    id: item.id,
    title: item.title || item.name,
    overview: item.overview || 'Sem sinopse disponível',
    rating: item.vote_average,
    release_year: (item.release_date || item.first_air_date || '').split('-')[0] || 'N/A',
    poster_path: tmdbConfig.getPosterUrl(item.poster_path),
    content_type: contentType,
  }));
};

/**
 * Busca detalhes completos de um item pelo ID no TMDB.
 * Retorna sinopse completa, provedores de streaming e mais.
 * @param {number} tmdbId
 * @param {string} contentType - 'movie' | 'tv' | 'anime' | 'dorama' | 'documentary'
 */
const fetchDetails = async (tmdbId, contentType) => {
  if (!process.env.TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY não configurada no .env');
  }

  const isTV = ['tv', 'anime', 'dorama'].includes(contentType);
  const endpoint = isTV ? `tv/${tmdbId}` : `movie/${tmdbId}`;

  // Busca detalhes + provedores de streaming em paralelo
  const [detailsRes, providersRes] = await Promise.all([
    axios.get(`${tmdbConfig.baseUrl}/${endpoint}`, {
      timeout: tmdbConfig.timeout,
      params: { api_key: process.env.TMDB_API_KEY, language: tmdbConfig.language },
    }),
    axios.get(`${tmdbConfig.baseUrl}/${endpoint}/watch/providers`, {
      timeout: tmdbConfig.timeout,
      params: { api_key: process.env.TMDB_API_KEY },
    }),
  ]);

  const d = detailsRes.data;
  const providersBR = providersRes.data?.results?.BR || {};

  // Monta lista de provedores disponíveis no Brasil
  const streaming = [
    ...(providersBR.flatrate || []),  // assinatura (Netflix, Prime, etc.)
    ...(providersBR.free || []),       // gratuito
    ...(providersBR.ads || []),        // com anúncios
  ].map((p) => ({
    name: p.provider_name,
    logo: `https://image.tmdb.org/t/p/w45${p.logo_path}`,
  }));

  // Remove duplicatas por nome
  const uniqueStreaming = streaming.filter(
    (p, i, arr) => arr.findIndex((x) => x.name === p.name) === i
  );

  return {
    id: d.id,
    title: d.title || d.name,
    overview: d.overview || 'Sem sinopse disponível',
    tagline: d.tagline || null,
    rating: d.vote_average,
    release_year: (d.release_date || d.first_air_date || '').split('-')[0] || 'N/A',
    runtime: d.runtime || d.episode_run_time?.[0] || null,
    genres: (d.genres || []).map((g) => g.name),
    poster_path: tmdbConfig.getPosterUrl(d.poster_path),
    streaming: uniqueStreaming,
    tmdb_url: `https://www.themoviedb.org/${isTV ? 'tv' : 'movie'}/${d.id}`,
  };
};

/**
 * Busca mais recomendações do TMDB baseadas em um item específico.
 * Usado na lista expandida de recomendações.
 * @param {number} tmdbId
 * @param {string} contentType
 */
const fetchSimilar = async (tmdbId, contentType) => {
  if (!process.env.TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY não configurada no .env');
  }

  const isTV = ['tv', 'anime', 'dorama'].includes(contentType);
  const endpoint = isTV ? `tv/${tmdbId}/similar` : `movie/${tmdbId}/similar`;

  const response = await axios.get(`${tmdbConfig.baseUrl}/${endpoint}`, {
    timeout: tmdbConfig.timeout,
    params: {
      api_key: process.env.TMDB_API_KEY,
      language: tmdbConfig.language,
      page: 1,
    },
  });

  return response.data.results.slice(0, 10).map((item) => ({
    id: item.id,
    title: item.title || item.name,
    overview: item.overview || 'Sem sinopse disponível',
    rating: item.vote_average,
    release_year: (item.release_date || item.first_air_date || '').split('-')[0] || 'N/A',
    poster_path: tmdbConfig.getPosterUrl(item.poster_path),
    content_type: contentType,
  }));
};

const getGenreIds = (genres, genreMap) => {
  return [...new Set(genres.map((g) => genreMap[g.toLowerCase()]).filter(Boolean))];
};

module.exports = { fetchByGenres, fetchDetails, fetchSimilar };
