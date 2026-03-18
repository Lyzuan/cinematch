/**
 * config/tmdb.js
 * Configurações centralizadas da API do TMDB
 * Altere aqui para ajustar filtros e idioma sem tocar nos serviços
 */

const tmdbConfig = {
  // URL base da API v3
  baseUrl: 'https://api.themoviedb.org/3',

  // URL base para imagens dos posters
  // Tamanhos disponíveis: w92, w154, w185, w342, w500, w780, original
  imageBaseUrl: 'https://image.tmdb.org/t/p',
  posterSize: 'w500',

  // Idioma das respostas (títulos, sinopses)
  // Opções: 'pt-BR', 'en-US', 'es-ES', etc.
  language: 'pt-BR',

  // Filtros de qualidade para busca de filmes
  filters: {
    // Nota mínima no TMDB (0 a 10)
    minRating: 7.0,

    // Quantidade mínima de votos (evita filmes obscuros com nota inflada)
    minVoteCount: 500,

    // Critério de ordenação dos resultados
    // Opções: 'vote_average.desc', 'popularity.desc', 'release_date.desc'
    sortBy: 'vote_average.desc',

    // Quantidade máxima de filmes candidatos enviados ao Gemini
    // Mais candidatos = mais opções para a IA, mas prompt maior
    maxCandidates: 20,

    // Página de resultados (1 = filmes mais relevantes)
    page: 1,
  },

  // Mapeamento de gêneros em português → IDs do TMDB
  // Referência completa: GET /genre/movie/list
  genreMap: {
    'ação':              28,
    'comédia':           35,
    'terror':            27,
    'romance':           10749,
    'ficção científica': 878,
    'drama':             18,
    'animação':          16,
    'documentário':      99,
    'aventura':          12,
    'fantasia':          14,
    'mistério':          9648,
    'thriller':          53,
    'crime':             80,
    'família':           10751,
    'história':          36,
    'guerra':            10752,
    'musical':           10402,
    'faroeste':          37,
  },

  // Timeout da requisição em milissegundos
  timeout: 10000,
};

// Retorna a URL completa de um poster
tmdbConfig.getPosterUrl = (posterPath) => {
  if (!posterPath) return null;
  return `${tmdbConfig.imageBaseUrl}/${tmdbConfig.posterSize}${posterPath}`;
};

// Converte array de nomes de gênero para IDs do TMDB
tmdbConfig.getGenreIds = (genres) => {
  return genres
    .map((g) => tmdbConfig.genreMap[g.toLowerCase()])
    .filter(Boolean);
};

module.exports = tmdbConfig;
