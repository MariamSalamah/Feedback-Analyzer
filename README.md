# FeedbackAnalyzer

FeedbackAnalyzer is a web app that turns customer feedback into a structured analysis report (sentiment, key themes, problems, and prioritized recommendations).

- **Frontend:** Angular
- **Backend:** Express + OpenAI Agents (tool-based)

---

## Demo (local)

1. Start the backend:

```bash
cd server
npm run start
```

Backend will listen on:
- `http://localhost:3000`

2. Start the frontend:

```bash
cd ..
npm run start
```

Frontend will be available at:
- `http://localhost:4200/`

---

## Architecture

### Frontend (Angular)
- UI collects:
  - **Product name**
  - **Feedback entries** (entered as text; separator supports `---` or blank lines)
  - **Analysis type** (`quick` / `detailed` — currently sent to the backend as part of the input model)
- The frontend calls the backend endpoint:
  - `POST http://localhost:3000/analyze`

Charts (via Chart.js) render:
- Sentiment breakdown (doughnut)
- Key themes (horizontal bar)
- Problems and recommendations cards

### Backend (Express)
- Express JSON API with endpoints:
  - `GET /health`
  - `POST /analyze`
- The backend uses a tool-driven agent that:
  1. Computes sentiment scores (positive/negative/neutral)
  2. Extracts recurring problems
  3. Generates prioritized recommendations
- The backend parses the agent output to return a JSON report.

---

## API

### `GET /health`

```http
GET http://localhost:3000/health
```

Response:

```json
{ "status": "ok" }
```

### `POST /analyze`

```http
POST http://localhost:3000/analyze
Content-Type: application/json
```

Request body:

```json
{
  "feedbacks": ["string", "string"],
  "productName": "My Product",
  "analysisType": "quick | detailed"
}
```

Response (`AnalysisResult`) example:

```json
{
  "productName": "My Product",
  "totalFeedbacks": 2,
  "overallSentiment": "mixed",
  "sentimentScore": { "positive": 40, "negative": 30, "neutral": 30 },
  "summary": "...",
  "keyThemes": ["..."],
  "problems": [
    {
      "title": "...",
      "description": "...",
      "frequency": "high|medium|low",
      "affectedArea": "..."
    }
  ],
  "recommendations": [
    {
      "title": "...",
      "description": "...",
      "priority": "critical|high|medium",
      "impact": "..."
    }
  ],
  "npsScore": 12,
  "analyzedAt": "2026-05-17T...Z"
}
```

---

## Environment variables

The backend loads environment variables from `server/.env` via `dotenv`.

You typically need an OpenAI credential for the agent to run (exact variable names depend on your OpenAI/agents setup).

> Note: this repository includes `server/.env` only as a visible file in your workspace; keep secrets out of version control.

---

## Development

### Frontend

```bash
npm run start
npm run build
npm test
```

### Backend

```bash
cd server
npm run start
npm run dev
```

---

## Project structure

- `src/app/components/feedback-form/` – feedback input UI
- `src/app/components/results-dashboard/` – results UI (charts + cards)
- `src/app/services/feedback-analysis.service.ts` – API client to `/analyze`
- `src/app/models/feedback.model.ts` – shared request/response typings
- `server/index.js` – Express server + agent tools + `/analyze` endpoint

---

## Troubleshooting

- **CORS / network errors:** ensure backend is running on `localhost:3000`.
- **Agent JSON parsing errors:** the backend expects the agent to return valid JSON; if you customize the agent prompt, keep the JSON-only instruction.
- **Port conflicts:**
  - Frontend: `4200`
  - Backend: `3000`

