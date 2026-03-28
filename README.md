# 🎬 CineMatch

Aplicação web de recomendação inteligente de filmes, séries, animes, doramas e documentários — construída com **React + Node.js + Gemini AI + TMDB**.

O usuário responde algumas perguntas rápidas via botões → a IA aprende com suas avaliações → recebe sugestões personalizadas com justificativa e informações de onde assistir.

---

## ✨ Funcionalidades

- 🎬 Suporte a **5 tipos de conteúdo**: Filme, Série, Anime, Dorama e Documentário
- 🎭 Seleção de até **5 gêneros** por tipo de conteúdo
- 😄 Filtro por **humor** (Leve, Tenso, Engraçado, Emocionante)
- 🤖 **Sondagem inteligente**: a IA apresenta 5 títulos para mapear seu gosto antes de recomendar
- ⭐ **Avaliação por estrelas** (1 a 5) dos títulos já assistidos
- 🎯 **Recomendação personalizada**: o Gemini aprende com suas avaliações e evita o que você não gostou
- ℹ️ **Modal de detalhes**: sinopse completa, gêneros, duração e onde assistir no Brasil
- 📋 **Lista completa**: mais sugestões baseadas no que você escolheu
- 🔁 **Retry automático** em caso de limite da API (429)

---

## 🖥️ Fluxo da aplicação

```
home → sondagem → results → final
                              ↓         ↓
                           detalhes   lista completa
```

1. **Home** — escolha tipo, gêneros (até 5) e humor
2. **Sondagem** — IA apresenta 5 títulos; marque o que já assistiu e avalie
3. **Recomendações** — 5 sugestões personalizadas com justificativa da IA
4. **Final** — título escolhido com opções de detalhes e lista expandida

---

## 📁 Estrutura do projeto

```
cinematch/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── gemini.js          # modelo, tokens, temperatura, safety
│   │   │   └── tmdb.js            # genreMaps por tipo, filtros, poster size
│   │   ├── controllers/
│   │   │   └── recommendController.js
│   │   ├── routes/
│   │   │   └── recommend.js
│   │   ├── services/
│   │   │   ├── geminiService.js   # prompts de sondagem e recomendação
│   │   │   └── tmdbService.js     # busca por tipo, detalhes, similares
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── DetailsModal.js    # modal com sinopse e streaming
        │   ├── DetailsModal.css
        │   ├── SelectionChip.js   # botão toggle de gênero/humor
        │   ├── SondagemCard.js    # card com "já assisti" + estrelas
        │   ├── SondagemCard.css
        │   ├── StarRating.js      # avaliação 1-5 estrelas
        │   └── StarRating.css
        ├── pages/
        │   ├── HomePage.js        # seleção de tipo, gêneros e humor
        │   ├── SondagemPage.js    # etapa de sondagem
        │   ├── ResultsPage.js     # recomendações finais
        │   ├── FinalPage.js       # tela de encerramento
        │   └── ListPage.js        # lista expandida de sugestões
        ├── services/
        │   └── api.js             # fetchSondagem, fetchRecommendations, fetchDetails, fetchSimilar
        ├── styles/
        │   └── global.css
        ├── App.js
        └── index.js
```

---

## 🔑 Pré-requisitos

- **Node.js** 18+
- Chave da API do **TMDB** → https://www.themoviedb.org/settings/api
- Chave da API do **Gemini** → https://aistudio.google.com/app/apikey

---

## ⚙️ Instalação e execução

### 1. Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
```

Edite o `.env` com suas chaves:

```env
PORT=3001
TMDB_API_KEY=sua_chave_tmdb_aqui
GEMINI_API_KEY=sua_chave_gemini_aqui
```

```bash
# Desenvolvimento (com hot-reload)
npm run dev

# Produção
npm start
```

Backend disponível em `http://localhost:3001`

---

### 2. Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar
npm start
```

Frontend disponível em `http://localhost:3000` — já configurado com proxy para o backend.

---

## 🔌 Endpoints da API

### `POST /api/sondagem`
Etapa 1 — busca candidatos no TMDB e a IA seleciona 5 para sondagem.

```json
// Body
{ "genres": ["ação", "fantasia"], "mood": "emocionante", "contentType": "anime" }

// Resposta
{ "sondagem": [...], "candidates": [...] }
```

### `POST /api/recommend`
Etapa 2 — IA gera 5 recomendações baseadas nas avaliações do usuário.

```json
// Body
{
  "genres": ["ação"], "mood": "emocionante", "contentType": "anime",
  "candidates": [...],
  "avaliacoes": [{ "title": "Naruto", "stars": 5 }]
}

// Resposta
{ "recommendations": [{ "title": "...", "justification": "...", "poster_path": "...", "rating": 8.1, "release_year": "2020" }] }
```

### `GET /api/details/:id?contentType=anime`
Retorna sinopse completa, gêneros, duração e serviços de streaming disponíveis no Brasil.

### `GET /api/similar/:id?contentType=anime`
Retorna até 10 títulos similares do TMDB para a lista expandida.

---

## 🎛️ Tipos de conteúdo e gêneros

| Tipo | Endpoint TMDB | Filtro especial |
|------|--------------|-----------------|
| 🎬 Filme | `discover/movie` | Exclui animação |
| 📺 Série | `discover/tv` | Exclui animação e anime |
| 🎌 Anime | `discover/tv` | `with_genres=16` + `origin_country=JP` |
| 🌸 Dorama | `discover/tv` | `origin_country=KR\|JP\|CN`, sem animação |
| 🎥 Documentário | `discover/movie` | `with_genres=99` forçado |

---

## 🤖 Papel da IA (Gemini 2.5 Flash)

A IA atua em **dois momentos** distintos por sessão:

**Sondagem** — seleciona 5 títulos variados e populares dos candidatos para mapear o gosto do usuário antes de recomendar.

**Recomendação** — analisa as avaliações (1-5 estrelas), aprende o perfil do usuário e retorna 5 sugestões com justificativas personalizadas, evitando títulos mal avaliados e priorizando similares aos bem avaliados.

Retry automático em caso de erro 429 (rate limit): aguarda o tempo sugerido pela API e tenta novamente até 3 vezes.

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18, CSS puro |
| Backend | Node.js 18+, Express |
| IA | Google Gemini 2.5 Flash |
| Banco de filmes | TMDB API v3 |
| HTTP | Axios |
| Hot-reload | Nodemon |

---

## 🗂️ Versões

| Versão | O que foi feito |
|--------|----------------|
| `v1.0.0` | MVP — recomendação simples com TMDB + Gemini |
| `v1.1.0` | Fluxo interativo: sondagem, estrelas, anime/dorama/doc, retry 429 |
| `v1.2.0` | Detalhes com streaming, lista expandida, limite de gêneros, fix anime |

---

## 📌 Observações

- Nenhum banco de dados — todo estado é mantido em memória durante a sessão
- Nenhum login ou autenticação
- O plano gratuito do Gemini permite **15 requisições/minuto** e **1.500/dia**
- O CineMatch realiza **2 chamadas por sessão** (sondagem + recomendação)
