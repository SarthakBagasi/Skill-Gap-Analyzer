# Full-Stack Deployment Guide

This guide details how to deploy the **AI-Based Skill Gap Analyzer** into production with **Vercel** hosting the Next.js frontend and a container service (**Render**, **Railway**, **Fly.io**, or **Hugging Face**) hosting the deterministic NLP/ML FastAPI backend.

---

## 1. System Architecture Overview

```
+-------------------------------------------------------+
|                 CLIENT BROWSER                        |
+-------------------------------------------------------+
                           |
            +--------------+--------------+
            |                             |
            v                             v
+-----------------------+     +-------------------------+
|     VERCEL HOST       |     |   CONTAINER HOST        |
| (Next.js 15 Frontend) |     |  (FastAPI + ML Backend) |
|                       |     |                         |
| - SSR / Static Pages  |     | - spaCy PhraseMatcher   |
| - Interactive UI      |     | - Sentence-BERT MiniLM  |
| - Dynamic Route Guard |     | - SQLite / SQLAlchemy   |
| - NEXT_PUBLIC_API_URL |     | - Auth & Audit History  |
+-----------------------+     +-------------------------+
            |                             ^
            +---- Client Fetch / Rewrite -+
```

### Why Decouple Frontend & Backend?
1. **Package Constraints**: Vercel Serverless Functions have an uncompressed bundle size limit of **250 MB**. PyTorch (`torch`), `transformers`, `sentence-transformers`, and `spacy` models together require **> 1.5 GB**.
2. **Cold-Start Performance**: Loading dense vector transformer weights into memory on cold serverless invocations causes latency spikes. A containerized backend (Docker) keeps models pre-loaded in memory for **< 15ms vector similarity queries**.
3. **Audit Persistence**: Vercel Serverless is stateless. A containerized backend preserves SQLite/PostgreSQL audit logs across candidate sessions.

---

## 2. Deploying the Frontend to Vercel

### Method A: Via Vercel Web Dashboard (Recommended)

1. **Push your code to GitHub**:
   Ensure your latest code is pushed to your GitHub repository (e.g. `https://github.com/SarthakBagasi/Skill-Gap-Analyzer`).

2. **Import Project on Vercel**:
   - Log into [Vercel](https://vercel.com) and click **"Add New..."** -> **"Project"**.
   - Select your repository: `SarthakBagasi/Skill-Gap-Analyzer`.

3. **Configure Project Settings**:
   - **Framework Preset**: `Next.js` (auto-detected).
   - **Root Directory**: Click **Edit** and choose `frontend`.
   - **Build Command**: `npm run build` (default).
   - **Output Directory**: `.next` (default).
   - **Install Command**: `npm install` (default).

4. **Add Environment Variables**:
   Under **Environment Variables**, add:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-backend.onrender.com` *(or your deployed backend URL from Section 3)*

5. **Deploy**:
   - Click **Deploy**. Vercel will build the frontend and issue a production URL (e.g. `https://skill-gap-analyzer-sarthak.vercel.app`).

---

### Method B: Via Vercel CLI

```bash
cd frontend
npx vercel
```
1. Set scope to your Vercel account.
2. Link to existing project or create new.
3. When prompted for environment variables, add `NEXT_PUBLIC_API_URL=<your-backend-url>`.
4. Deploy to production:
   ```bash
   npx vercel --prod
   ```

---

## 3. Deploying the Backend (FastAPI + Sentence-BERT)

### Option 1: Render.com (Free Tier / 1-Click Docker)

1. Sign in to [Render](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository `SarthakBagasi/Skill-Gap-Analyzer`.
4. Configure the Web Service:
   - **Name**: `skill-gap-analyzer-api`
   - **Region**: Oregon (US West) or Frankfurt (EU)
   - **Runtime**: **Docker**
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Docker Context Directory**: `./backend`
   - **Instance Type**: **Free** (or Starter for non-sleep instances)
5. Under **Environment Variables**:
   - `PORT`: `8000`
   - `DATABASE_URL`: `sqlite:///./skill_gap.db`
   - `ALLOWED_ORIGINS`: `https://*.vercel.app,*`
6. Click **Create Web Service**.
   - Render will build the Docker container. Our Dockerfile automatically downloads and bakes `all-MiniLM-L6-v2` and `en_core_web_sm` during the build step.
7. Once deployment shows **Live**, copy your URL:
   `https://skill-gap-analyzer-api.onrender.com`

---

### Option 2: Railway.app (Container)

1. Sign in to [Railway](https://railway.app).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select `SarthakBagasi/Skill-Gap-Analyzer`.
4. In **Settings**, set **Root Directory** to `/backend`.
5. Railway will automatically detect `./backend/Dockerfile`.
6. Under **Variables**, add:
   - `PORT`: `8000`
   - `ALLOWED_ORIGINS`: `https://*.vercel.app,*`
7. Generate a public domain under **Networking**.

---

### Option 3: Hugging Face Spaces (Free CPU with 16GB RAM)

1. Create a new Space on [Hugging Face](https://huggingface.co/spaces).
2. Select **Docker** space (Blank template).
3. Push the contents of the `backend/` directory to the Space repository.
4. Hugging Face builds and hosts the container on high-memory hardware with a free HTTPS endpoint.

---

## 4. Connecting Vercel Frontend to the Backend

1. In your **Vercel Dashboard**, select your frontend project.
2. Navigate to **Settings** -> **Environment Variables**.
3. Verify or update:
   ```env
   NEXT_PUBLIC_API_URL=https://skill-gap-analyzer-api.onrender.com
   ```
4. Navigate to **Deployments** -> select the latest deployment -> click **Redeploy**.

---

## 5. Built-in Production Safeguards

- **CORS Protection**: `backend/app/main.py` is configured with `allow_origin_regex=r"https://.*\.vercel\.app"`. Any Vercel preview or production deployment can communicate with the backend securely without cross-origin blocks.
- **Dynamic API Rewrites**: `frontend/next.config.js` dynamically proxies `/api/:path*` requests to `process.env.NEXT_PUBLIC_API_URL`.
- **Pre-baked ML Models**: The backend Dockerfile caches spaCy and Sentence-BERT models at image build time, preventing runtime download delays or HuggingFace rate limits.
