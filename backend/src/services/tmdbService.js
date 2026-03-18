const axios = require('axios');
const tmdbConfig = require('../config/tmdb');

/**
 * Busca filmes no TMDB por gêneros
 * Todas as configurações (filtros, idioma, tamanho do poster) vêm de config/tmdb.js
 */
const fetchMoviesByGenres = async (genres) => {
  if (!process.env.TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY não configurada no .env');
  }

  const genreIds = tmdbConfig.getGenreIds(genres);

  if (genreIds.length === 0) {
    throw new Error('Nenhum gênero válido encontrado. Verifique o genreMap em config/tmdb.js');
  }

  const response = await axios.get(`${tmdbConfig.baseUrl}/discover/movie`, {
    timeout: tmdbConfig.timeout,
    params: {
      api_key: process.env.TMDB_API_KEY,
      language: tmdbConfig.language,
      sort_by: tmdbConfig.filters.sortBy,
      'vote_average.gte': tmdbConfig.filters.minRating,
      'vote_count.gte': tmdbConfig.filters.minVoteCount,
      with_genres: genreIds.join(','),
      page: tmdbConfig.filters.page,
    },
  });

  const movies = response.data.results.slice(0, tmdbConfig.filters.maxCandidates);

  return movies.map((movie) => ({
    id: movie.id,
    title: movie.title,
    overview: movie.overview || 'Sem sinopse disponível',
    rating: movie.vote_average,
    release_year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
    poster_path: tmdbConfig.getPosterUrl(movie.poster_path),
  }));
};

module.exports = { fetchMoviesByGenres };
