/**
 * config/tmdb.js
 * Configurações centralizadas da API do TMDB
 *
 * Tipos de conteúdo suportados:
 *   movie        → filmes (discover/movie)
 *   tv           → séries e streaming (discover/tv)
 *   anime        → animes (discover/tv com filtro de origem japonesa)
 *   dorama       → doramas (discover/tv com filtro de origem coreana/japonesa/chinesa)
 *   documentary  → documentários (discover/movie + discover/tv com gênero 99)
 */

const tmdbConfig = {
  baseUrl: 'https://api.themoviedb.org/3',
  imageBaseUrl: 'https://image.tmdb.org/t/p',
  posterSize: 'w500',
  language: 'pt-BR',

  filters: {
    minRating: 7.0,
    minVoteCount: 200,   // menor para animes/doramas que têm menos votos
    sortBy: 'vote_average.desc',
    maxCandidates: 20,
    page: 1,
  },

  // ── FILMES ──────────────────────────────────
  genreMap: {
    'ação': 28,
    'comédia': 35,
    'terror': 27,
    'romance': 10749,
    'ficção científica': 878,
    'drama': 18,
    'animação': 16,
    'documentário': 99,
    'aventura': 12,
    'fantasia': 14,
    'mistério': 9648,
    'thriller': 53,
    'crime': 80,
    'família': 10751,
    'história': 36,
    'guerra': 10752,
    'musical': 10402,
    'faroeste': 37,
  },

  // ── SÉRIES / STREAMING ───────────────────────
  tvGenreMap: {
    'ação': 10759,
    'comédia': 35,
    'drama': 18,
    'romance': 10749,
    'ficção científica': 10765,
    'mistério': 9648,
    'thriller': 80,
    'crime': 80,
    'fantasia': 10765,
    'animação': 16,
    'documentário': 99,
    'família': 10751,
    'guerra': 10768,
    'musical': 10402,
  },

  // ── ANIME ───────────────────────────────────
  // Animes no TMDB são séries (tv) com origin_country=JP e gênero animação (16)
  // Os gêneros aqui são usados como filtro adicional além de animação
  animeGenreMap: {
    'ação': 10759,
    'aventura': 10759,
    'comédia': 35,
    'drama': 18,
    'fantasia': 10765,
    'romance': 10749,
    'ficção científica': 10765,
    'mistério': 9648,
  },

  // ── DORAMA ──────────────────────────────────
  // Doramas são séries (tv) com origin_country KR, JP ou CN
  doramaGenreMap: {
    'romance': 10749,
    'drama': 18,
    'comédia': 35,
    'thriller': 80,
    'histórico': 36,
    'ação': 10759,
    'mistério': 9648,
    'fantasia': 10765,
  },

  // ── DOCUMENTÁRIO ────────────────────────────
  // Documentários podem ser filmes ou séries — usamos movie por padrão
  // O gênero 99 (Documentary) é sempre forçado no serviço
  documentaryGenreMap: {
    'natureza': 99,       // sem subgênero específico no TMDB — usa keyword
    'crime': 99,
    'história': 99,
    'ciência': 99,
    'tecnologia': 99,
    'sociedade': 99,
    'esporte': 99,
    'música': 99,
  },

  // Mapeamento de países de origem por tipo (usado como filtro TMDB)
  originCountry: {
    anime:  'JP',
    dorama: 'KR', // Coreia do Sul por padrão (mais popular)
  },
};

tmdbConfig.getPosterUrl = (posterPath) => {
  if (!posterPath) return null;
  return `${tmdbConfig.imageBaseUrl}/${tmdbConfig.posterSize}${posterPath}`;
};

/**
 * Retorna o genreMap correto para o tipo de conteúdo
 */
tmdbConfig.getGenreMap = (contentType) => {
  const maps = {
    movie:       tmdbConfig.genreMap,
    tv:          tmdbConfig.tvGenreMap,
    anime:       tmdbConfig.animeGenreMap,
    dorama:      tmdbConfig.doramaGenreMap,
    documentary: tmdbConfig.documentaryGenreMap,
  };
  return maps[contentType] || tmdbConfig.genreMap;
};

module.exports = tmdbConfig;
