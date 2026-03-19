const axios = require('axios');
const tmdbConfig = require('../config/tmdb');

/**
 * Busca conteúdo no TMDB de acordo com o tipo selecionado pelo usuário.
 *
 * Tipos suportados:
 *   movie        → filmes normais
 *   tv           → séries e streaming
 *   anime        → séries animadas japonesas (origin_country=JP, gênero=animação)
 *   dorama       → séries coreanas/asiáticas (origin_country=KR)
 *   documentary  → documentários (gênero=99 forçado)
 *
 * @param {string[]} genres     - Gêneros selecionados (em português, minúsculo)
 * @param {string}   contentType - 'movie' | 'tv' | 'anime' | 'dorama' | 'documentary'
 */
const fetchByGenres = async (genres, contentType = 'movie') => {
  if (!process.env.TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY não configurada no .env');
  }

  // Parâmetros base da requisição
  const params = {
    api_key: process.env.TMDB_API_KEY,
    language: tmdbConfig.language,
    sort_by: tmdbConfig.filters.sortBy,
    'vote_average.gte': tmdbConfig.filters.minRating,
    'vote_count.gte': tmdbConfig.filters.minVoteCount,
    page: tmdbConfig.filters.page,
  };

  // Define endpoint e parâmetros específicos por tipo de conteúdo
  let endpoint;

  switch (contentType) {

    case 'movie': {
      endpoint = 'discover/movie';
      const ids = getGenreIds(genres, tmdbConfig.genreMap);
      if (ids.length) params.with_genres = ids.join(',');
      break;
    }

    case 'tv': {
      endpoint = 'discover/tv';
      const ids = getGenreIds(genres, tmdbConfig.tvGenreMap);
      if (ids.length) params.with_genres = ids.join(',');
      break;
    }

    case 'anime': {
      // Animes: séries de animação japonesas
      endpoint = 'discover/tv';
      params.with_genres = '16'; // gênero animação sempre forçado
      params.with_origin_country = 'JP';
      params['vote_count.gte'] = 100; // animes têm menos votos no TMDB
      // Gêneros extras além de animação (ex: ação, romance)
      const extraIds = getGenreIds(genres, tmdbConfig.animeGenreMap)
        .filter((id) => id !== 16); // evita duplicar animação
      if (extraIds.length) params.with_genres += `,${extraIds.join(',')}`;
      break;
    }

    case 'dorama': {
      // Doramas: séries coreanas (KR), também aceita JP e CN
      endpoint = 'discover/tv';
      params.with_origin_country = 'KR|JP|CN';
      params['vote_count.gte'] = 50;
      const ids = getGenreIds(genres, tmdbConfig.doramaGenreMap);
      if (ids.length) params.with_genres = ids.join(',');
      // Exclui animação para não misturar com anime
      params.without_genres = '16';
      break;
    }

    case 'documentary': {
      // Documentários: gênero 99 sempre forçado, filmes e séries
      endpoint = 'discover/movie';
      params.with_genres = '99';
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
    throw new Error(`Nenhum resultado encontrado no TMDB para o tipo "${contentType}" com os gêneros selecionados.`);
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
 * Converte nomes de gênero para IDs do TMDB usando o mapa fornecido
 */
const getGenreIds = (genres, genreMap) => {
  return [...new Set(
    genres
      .map((g) => genreMap[g.toLowerCase()])
      .filter(Boolean)
  )];
};

module.exports = { fetchByGenres };
