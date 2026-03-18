# 🎬 CineMatch

Aplicação de recomendação inteligente de filmes com **React + Node.js + Gemini + TMDB**.

O usuário seleciona gêneros e humor → o backend busca filmes no TMDB → o Gemini escolhe os 5 melhores com justificativas personalizadas.

---

## 📁 Estrutura do projeto

```
cinematch/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── recommend.js
│   │   ├── controllers/
│   │   │   └── recommendController.js
│   │   ├── services/
│   │   │   ├── tmdbService.js
│   │   │   └── geminiService.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── SelectionChip.js
    │   │   ├── MovieCard.js
    │   │   └── MovieCard.css
    │   ├── pages/
    │   │   ├── HomePage.js
    │   │   ├── HomePage.css
    │   │   ├── ResultsPage.js
    │   │   └── ResultsPage.css
    │   ├── services/
    │   │   └── api.js
    │   ├── styles/
    │   │   └── global.css
    │   ├── App.js
    │   └── index.js
    └── package.json
```

---

## 🔑 Pré-requisitos

- Node.js 18+
- Chave da API do **TMDB** → https://www.themoviedb.org/settings/api
- Chave da API do **Gemini** → https://aistudio.google.com/app/apikey

---

## ⚙️ Configuração e execução

### 1. Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env e adicione suas chaves:
# TMDB_API_KEY=sua_chave_aqui
# GEMINI_API_KEY=sua_chave_aqui

# Iniciar servidor de desenvolvimento
npm run dev
# ou produção:
npm start
```

O backend sobe em `http://localhost:3001`

---

### 2. Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar React
npm start
```

O frontend sobe em `http://localhost:3000` e já tem proxy configurado para o backend.

---

## 🔌 API

### `POST /api/recommend`

**Body:**
```json
{
  "genres": ["ação", "comédia"],
  "mood": "leve",
  "feedback": ["Título que não gostei"]
}
```

**Resposta:**
```json
{
  "recommendations": [
    {
      "title": "Nome do Filme",
      "justification": "Motivo personalizado da recomendação.",
      "poster_path": "https://image.tmdb.org/t/p/w500/...",
      "rating": 7.8,
      "release_year": "2021"
    }
  ]
}
```

---

## 🎛️ Gêneros suportados

| Interface | Enviado ao backend |
|-----------|-------------------|
| Ação | `ação` |
| Comédia | `comédia` |
| Terror | `terror` |
| Romance | `romance` |
| Ficção Científica | `ficção científica` |
| Drama | `drama` |

---

## 🤖 Fluxo interno

```
Usuário seleciona gêneros + humor
         ↓
Frontend → POST /api/recommend
         ↓
Backend → TMDB API (filmes por gênero, nota ≥ 7.0, até 20 candidatos)
         ↓
Backend → Gemini 2.5 Flash (seleciona 5, gera justificativas)
         ↓
Frontend exibe MovieCards com botões 👍 👎
         ↓
Usuário dá feedback → re-recomendação evitando os não-gostados
```

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18, CSS puro |
| Backend | Node.js, Express |
| IA | Google Gemini 2.5 Flash |
| Filmes | TMDB API v3 |
| HTTP | Axios |
