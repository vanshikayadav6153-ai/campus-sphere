# CampusSphere 🎓🤝
**A Hyper-Gated Student Marketplace & Cashless Skill-Barter Network**  
*Alpha Coders · Campus Infrastructure*

CampusSphere transforms a college campus into a trusted internal exchange. Students can buy, sell, and rent hostel gear (irons, cookers, books, lab coats) and trade their time and skills using cashless Campus Credits with escrow protection and verified physical handovers at designated campus safe zones.

---

## 🚀 Core Features (MVP)

1. **Domain-Gated Authentication**:
   - Google OAuth 2.0 with Passport.js and JWT session stored in secure, `httpOnly` cookies.
   - Strict server-side verification: only emails ending with `@ALLOWED_DOMAIN` (e.g. `@college.ac.in`) are permitted.
   - Automatic 10 starting campus credits allocated to new students on signup with an audit ledger entry.

2. **Campus Marketplace (Gear & Utilities)**:
   - Full CRUD for buy/sell and daily rentals (irons, electric kettles, books, calculators, drafters, lab coats).
   - Status tracking (`available`, `reserved`, `sold`). Sold items are filtered out of public browse views.
   - Every listing is assigned to a designated campus safe zone.

3. **Cashless Skill Barter**:
   - Post skills you **Offer** or skills you **Want to Learn** (programming, design, academics, languages, etc.).
   - Transparent rates (1–20 credits/hour) with search, category filtering, and mode toggles (in-person, online, hybrid).

4. **Campus Credits Ledger with Escrow Protection**:
   - Atomic credit transactions using MongoDB sessions and conditional atomic queries (`credits: { $gte: cost }`).
   - Escrow flow:
     - Requester sends barter session request.
     - Provider accepts ➔ Credits are held in escrow (`heldCredits`).
     - Session completed ➔ Both parties confirm ➔ Credits release to provider atomically.
     - Cancellation refunds held credits back to the learner.
   - Tamper-resistant transaction ledger recording all balance changes.

5. **Interactive Safe-Handover Campus Map**:
   - Leaflet + OpenStreetMap integration (100% free, no paid APIs, no API keys).
   - Pre-seeded campus safe zones (Library, Hostel Mess, Main Gate, Canteen, Admin Block) with live available item and skill counts.
   - Interactive map flyer, popups, and responsive side panel with listings preview.
   - Mini `MapPreview` embedded into item and skill detail cards with "Open in Google Maps" links.

6. **Live Campus Impact Metrics**:
   - Public aggregate metrics cached in memory for 60 seconds: total students joined, active gear, active skills, completed barter sessions, hours mentored, credits exchanged, and items reused.
   - Personalized student dashboard with balance breakdown and session statistics.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18 (Vite), Tailwind CSS, Lucide Icons, React Router v6, Leaflet & React-Leaflet |
| **Backend** | Node.js, Express 4, Mongoose 8, Passport.js (`passport-google-oauth20`), Zod |
| **Security** | Helmet, Express Rate Limit, Cookie-Parser, JWT, Trust Proxy |
| **Database** | MongoDB Atlas (Cloud) / Local MongoDB with atomic transactions |
| **Deployment Target** | Render (Express Backend) + Vercel (React Frontend with `/api` proxy) |

---

## 📁 Repository Structure

```
campus-sphere/
├── client/                      # React (Vite) + Tailwind CSS Frontend
│   ├── public/                  # Favicons and static assets
│   ├── src/
│   │   ├── components/          # Navbar, MapPreview, ProtectedRoute, ErrorBoundary
│   │   ├── context/             # AuthContext, ToastContext
│   │   ├── pages/               # LandingPage, Login, Dashboard, Marketplace, Skills, Requests, Ledger, Map
│   │   ├── services/            # Axios API layer (itemService, skillService, requestService, etc.)
│   │   ├── App.jsx              # Routes & Context providers
│   │   ├── main.jsx             # React DOM entry point
│   │   └── index.css            # Tailwind CSS directives
│   ├── .env.development        # VITE_API_URL=http://localhost:5000
│   ├── vercel.json              # Reverse proxy rules mapping /api to Render backend
│   └── vite.config.js           # Vite dev configuration
├── server/                      # Node.js + Express + Mongoose Backend
│   ├── config/                  # MongoDB connection & Passport strategy
│   ├── controllers/             # Auth, Items, Skills, Requests, Ledger, SafeZones, Stats
│   ├── middleware/              # JWT authMiddleware, centralized errorHandler
│   ├── models/                  # User, Item, Skill, BarterRequest, Transaction, SafeZone
│   ├── routes/                  # Express REST routes
│   ├── utils/                   # Database transactions, ledger helpers, Zod schemas
│   ├── .env.example             # Server environment variables template
│   ├── package.json             # Backend dependencies and scripts
│   └── server.js                # Express app entry point
├── .env.example                 # Root environment configuration guide
├── .gitignore                   # Excludes node_modules, .env files, builds
├── package.json                 # Monorepo runner
└── README.md                    # Project documentation
```

---

## ⚙️ Environment Variables Table

| Variable | Required In | Description | Example Value |
| :--- | :---: | :--- | :--- |
| `PORT` | Server | Port for Express server | `5000` |
| `NODE_ENV` | Server | Environment mode (`development` or `production`) | `production` |
| `CLIENT_URL` | Server | Frontend origin URL for CORS | `https://campussphere.vercel.app` |
| `ALLOWED_DOMAIN` | Server | Permitted institutional email domain for Google login | `college.ac.in` |
| `MONGO_URI` | Server | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/campussphere` |
| `JWT_SECRET` | Server | Secret key used to sign session JWTs (minimum 32 chars) | `your_super_secret_jwt_key_here` |
| `GOOGLE_CLIENT_ID` | Server | Google OAuth 2.0 Web Client ID | `xxxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Server | Google OAuth 2.0 Client Secret | `GOCSPX-xxxx` |
| `GOOGLE_CALLBACK_URL` | Server | Authorized redirect URI configured in Google Console | `https://campussphere-api.onrender.com/api/auth/google/callback` |
| `VITE_API_URL` | Client | Backend base URL for development (leave empty in production) | `http://localhost:5000` |

---

## 💻 Local Setup & Development

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/campus-sphere.git
cd campus-sphere

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure Local Environment

Copy the example file to create `server/.env`:
```bash
cp server/.env.example server/.env
```
Fill in your local MongoDB URI, Google OAuth client credentials, and set `CLIENT_URL=http://localhost:5173`.

### 3. Start Development Servers

Run backend (Terminal 1):
```bash
cd server
npm run dev
```

Run frontend (Terminal 2):
```bash
cd client
npm run dev
```

* Frontend: **http://localhost:5173**
* Backend API: **http://localhost:5000**
* Health Check: **http://localhost:5000/api/health**

---

## 🚀 Production Deployment Guide

### A. Deploy Backend to Render

1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your repository and configure:
   * **Root Directory**: `server`
   * **Build Command**: `npm install`
   * **Start Command**: `node server.js`
   * **Environment**: `Node`
3. Add all required environment variables under **Environment**:
   * `NODE_ENV`: `production`
   * `PORT`: `10000` (Render default)
   * `CLIENT_URL`: `https://your-frontend.vercel.app`
   * `ALLOWED_DOMAIN`: `college.ac.in`
   * `MONGO_URI`: `mongodb+srv://...`
   * `JWT_SECRET`: `...`
   * `GOOGLE_CLIENT_ID`: `...`
   * `GOOGLE_CLIENT_SECRET`: `...`
   * `GOOGLE_CALLBACK_URL`: `https://your-backend.onrender.com/api/auth/google/callback`
4. Deploy the service and verify `https://your-backend.onrender.com/api/health` returns `{ "ok": true }`.

### B. Deploy Frontend to Vercel

1. In `client/vercel.json`, replace `RENDER_URL` with your live Render backend hostname:
   ```json
   {
     "rewrites": [
       { "source": "/api/:path*", "destination": "https://your-backend.onrender.com/api/:path*" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
2. Import the project on [Vercel](https://vercel.com):
   * **Framework Preset**: `Vite`
   * **Root Directory**: `client`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
   * **Environment Variables**: Leave `VITE_API_URL` empty (unset) so all `/api` calls route to the same origin through the Vercel rewrite proxy.
3. Deploy! Cookies set by the backend remain first-party because all API calls traverse `/api` on your Vercel domain.

### C. Update Google Cloud Console Authorized URIs
1. In the Google Cloud Console, under **APIs & Services ➔ Credentials ➔ OAuth 2.0 Client IDs**:
2. Add to **Authorized JavaScript origins**:
   * `https://your-frontend.vercel.app`
   * `https://your-backend.onrender.com`
3. Add to **Authorized redirect URIs**:
   * `https://your-backend.onrender.com/api/auth/google/callback`

---

## 📄 License
This project is open-source under the MIT License. Built with ❤️ by Alpha Coders.
