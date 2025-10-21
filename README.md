# SomoAI MVP

A minimal web app to help you turn vague product ideas into a complete Product Requirements Document (PRD) using AI.

## Features
- Single-page chat interface (React)
- Step-by-step AI coaching to create a PRD
- Export PRD as a `.txt` file

## Tech Stack
- Frontend: React (Vite)
- Backend: Node.js + Express
- OpenAI API (GPT-4 or 3.5)

## Setup Instructions

### 1. Clone & Install
```bash
npm install
```

### 2. Set API Key
Create a `.env` file in `/server` with:
```
OPENAI_API_KEY=your-openai-api-key-here
```

### 3. Run in Development
```bash
npm run dev
```
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:3001](http://localhost:3001)

### 4. Build for Production
```bash
npm run build
npm start
```

---

## File Structure
```
SomoAI/
  client/      # React frontend
  server/      # Express backend
  README.md
  package.json
  .gitignore
```

---

## Deployment

### Deploy to Vercel

This project is configured for Vercel deployment. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick Deploy:**
1. Push your code to GitHub/GitLab/Bitbucket
2. Import the repository in [Vercel](https://vercel.com)
3. Add environment variables: `OPENAI_API_KEY`, `OPENAI_MODEL`
4. Deploy!

## Notes
- The OpenAI API key is **never exposed to the frontend**.
- "Export PRD" button is enabled only when the AI signals PRD is ready.
