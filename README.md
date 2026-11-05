# NEXORA — Complete Job Application Intelligence Platform

> **"Every application. Every update. One place."**

Nexora is a premium Job Application Intelligence Platform engineered to centralize application tracking, monitor recruitment correspondence, generate evidence-backed application timelines, manage candidate interviews, and deliver career-search analytics.

---

## 📸 Visual Design Language

Nexora faithfully recreates the provided SaaS product reference design:
- **Dark navy/purple persistent vertical sidebar** (`#1A1633`) with subtle mountain gradient silhouettes.
- **Light lavender-white main workspace** (`#F8F7FD`).
- **Soft violet accent palette**: Primary Violet (`#7652E8`), Light Violet (`#9B7AFB`), Deep Navy (`#211C3B`).
- **Rounded 24px cards** with soft multi-layer ambient shadows (`shadow-nexora`).
- **Interactive SVG mountain illustration** in the header displaying the user's Career Goal, milestone nodes, and summit flag.
- **Top Metric Cards** with color-coded containers, metrics, and percentage changes.
- **Kanban-style Application Pipeline preview** with company logos, status badges, and progress indicators.
- **Animated circular progress ring** showing weekly application targets (`60%`).
- **12-Day Streak tracker** with active weekday checkboxes.
- **Recent activity feed** with email icons and status badges.
- **Application Insights Donut Chart** (`Recharts`) centered with total applications and percentage legend.
- **Upcoming events card** with date tiles, interview times, and meeting links.

---

## 🛠️ Technology Stack

### Frontend (`client/`)
- **React.js 19** & **Standard JavaScript (ES6+ / JSX)**
- **Vite** with Tailwind CSS v4
- **Plus Jakarta Sans** & **Inter** typography
- **Lucide React** (icons)
- **Recharts** (interactive donut chart, conversion funnel, bar trends)
- **React Router v7** (modular nested layout routing)
- **Date-fns** (accurate date formatting and time calculations)
- **Canvas-Confetti** (achievement celebration triggers)

### Backend (`server/`)
- **Node.js** (v18+) & **Express.js** (modular controllers, services, routes, middleware)
- **MongoDB** & **Mongoose** (structured schemas with relational indexing)
- **JWT & HTTP-only cookies** for authentication
- **Bcrypt.js** (salted password hashing)
- **Google OAuth 2.0 & Gmail API** (`googleapis`)
- **BullMQ & Redis** with automatic fallback to high-performance in-memory task runner
- **Helmet, CORS, and Express Rate Limiting** for security
- **AES-256-GCM** encryption for token security at rest

---

## 🧭 Application Structure & Navigation

| Route | Page | Purpose |
|---|---|---|
| `/` | **Dashboard** | Priority design mirroring the visual reference (Mountain banner, 4 metrics, Kanban preview, Progress ring, Streak, Recent activity, Donut chart, Upcoming). |
| `/applications` | **Applications** | Full CRUD application workspace with table and grid views, multi-field search, status and source filters, and pagination. |
| `/applications/:id` | **Application Workspace** | Individual application details: Company overview, interactive timeline of historical events, recruiter contacts, and strategy notes. |
| `/pipeline` | **Pipeline (Kanban)** | Full interactive drag-and-drop Kanban across *Saved*, *Applied*, *Assessment*, *Interview*, *Offer*, *Rejected*. |
| `/activity` | **Activity** | Unified chronological activity feed linking every event, status shift, and email to its source application. |
| `/inbox` | **Inbox Intelligence** | Gmail recruitment scanning hub with category classification, match confidence scoring, and explicit Approve/Dismiss user verification. |
| `/insights` | **Analytics & Insights** | Evidence-backed analytics: response rate, interview conversion rate, offer conversion rate, and 6-month momentum bar charts. |
| `/calendar` | **Calendar & Reminders** | Interactive monthly calendar, daily agenda, add event modal, meeting links, and assessment deadlines. |
| `/companies` | **Companies** | Company profiles, tracked roles per company, recruiter directories, and company-specific notes. |
| `/achievements` | **Achievements** | Professional career milestones: application streaks, goal crusher badges, and celebratory confetti. |
| `/settings` | **Settings** | Career goal targets, weekly application goals, Gmail OAuth connection management, workspace cleanup, and privacy disclosures. |
| `/login` | **Authentication** | Sign in and registration with secure HTTP-only cookies and JWTs. |

---

## 🚀 Deployment Instructions

Nexora is configured for multiple deployment strategies. Choose the one that matches your infrastructure:

### Option A: Unified Full-Stack Deployment (Recommended)
*Deploy both frontend and backend as a single service on **Render**, **Railway**, **Fly.io**, or any VPS/Cloud VM.*

In production (`NODE_ENV=production`), the Express backend serves both the `/api/*` endpoints and the compiled React single-page application from `client/dist`.

1. **Build the client:**
   ```bash
   npm run build
   ```
2. **Set Environment Variables on your hosting provider:**
   ```env
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/nexora?retryWrites=true&w=majority
   JWT_SECRET=generate_a_random_64_character_hex_secret
   ENCRYPTION_KEY=generate_a_32_byte_hex_key_e.g._openssl_rand_-hex_32
   CLIENT_URL=https://your-domain.com
   ```
3. **Start Command:**
   ```bash
   npm start
   ```

---

### Option B: Docker Container Deployment
A production-ready `Dockerfile` and `.dockerignore` are included in the repository.

1. **Build the container image:**
   ```bash
   docker build -t nexora:latest .
   ```
2. **Run the container:**
   ```bash
   docker run -d \
     -p 5000:5000 \
     -e NODE_ENV=production \
     -e MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/nexora" \
     -e JWT_SECRET="your_secure_secret" \
     -e ENCRYPTION_KEY="your_32_byte_hex_key" \
     --name nexora-app \
     nexora:latest
   ```
3. Open `http://localhost:5000` in your browser.

---

### Option C: Decoupled Deployment (Vercel / Netlify Frontend + Cloud Backend)

#### 1. Backend (Render / Railway / Fly.io)
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Set `CLIENT_URL=https://your-frontend.vercel.app`

#### 2. Frontend (Vercel or Netlify)
- Root Directory: `client`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Set Environment Variable: `VITE_API_URL=https://your-backend-service.onrender.com`
*(Pre-configured `_redirects` and `vercel.json` are included to handle client-side routing on page refreshes).*

---

## 🔒 Production Security Checklist

- [x] **Password Protection:** Passwords hashed with 12-round salted bcrypt.
- [x] **Token Security:** JWTs issued with secure HTTP-only cookies and Bearer header fallback.
- [x] **Rate Limiting:** Protects `/api/*` endpoints against brute-force and DDoS attacks.
- [x] **Encryption at Rest:** OAuth tokens encrypted using AES-256-GCM authenticated cipher.
- [x] **Sanitization & Headers:** Helmet protection configured with disabled CSP for third-party OAuth flows.
- [x] **No Mock Data:** Workspace initializes clean, storing real candidate records directly in MongoDB.

---

## 📄 License
MIT © Nexora Engineering Team
