# 🧭 SUVIDHA AI TRAVEL SAATHI

> **Industry-Scale Full-Stack AI Travel Recommendation & Dynamic Itinerary Planning Engine**

[![Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20Express%20%7C%20MongoDB-green)](#tech-stack)
[![AI](https://img.shields.io/badge/AI-Google%20Gemini-orange)](#key-features)
[![Maps](https://img.shields.io/badge/Maps-OpenStreetMap%20%7C%20Leaflet-blue)](#key-features)
[![Auth](https://img.shields.io/badge/Auth-JWT-red)](#user-authentication)
[![License](https://img.shields.io/badge/License-MIT-yellow)](#license)

**SUVIDHA AI TRAVEL SAATHI** solves the modern traveler's biggest dilemma: spending hours sifting through generic blogs, paid advertisements, and unorganized travel forums. By pairing **Google Gemini AI reasoning** with **OpenStreetMap interactive maps** and **MongoDB data persistence**, it generates accurate, personalized day-by-day itineraries, exact cost estimates, and real-time interactive route pins tailored to budget, duration, group type, and travel style.

---

## 🌟 Key Features

### 🤖 AI-Powered Itinerary Engine
- **Custom Day-by-Day Planning**: Generates detailed morning, afternoon, and evening activity schedules tailored to your duration (1–7+ days).
- **Preference-Aware Customization**: Matches recommendations by budget tier (*Budget*, *Mid-Range*, *Luxury*), group dynamic (*Solo*, *Couple*, *Friends*, *Family*), and travel vibe (*Adventure*, *Nature*, *Heritage*, *Relaxation*, *Nightlife*, *Foodie*).
- **Intelligent Fallback Engine**: Works out-of-the-box with zero mandatory paid API keys.

### 🗺️ OpenStreetMap & Leaflet.js Interactive Mapping
- **Live Location Pins**: Automatically centers interactive map view on generated or searched destinations.
- **Zero Paid Dependencies**: Uses free, open-source OpenStreetMap tiles instead of expensive proprietary map APIs.

### 💼 Production-Ready MERN Backend
- **MongoDB Data Persistence**: Mongoose schemas for `Destination`, `User`, and `Trip`.
- **JWT Authentication**: Secure user registration, password hashing (`bcryptjs`), and token issuance.
- **Wishlist & Storage Sync**: Save favorite destinations to account or browser `localStorage`.
- **PDF & Print Ready**: One-click printable summary for offline travel reference.

---

## 🏗️ System Architecture

```text
travel-recommendation-app/
├── src/
│   ├── config/            # Database connection setup (db.js)
│   ├── controllers/       # Business logic (aiPlannerController, authController, destinationController)
│   ├── models/            # Mongoose Data Models (Destination, User, Trip)
│   ├── routes/            # Express Router endpoints (aiPlannerRoutes, authRoutes, destinationRoutes)
│   ├── services/          # Gemini AI API service & fallback engine (geminiService.js)
│   └── server.js          # Express app entry point & server setup
├── public/                # Static Client Assets
│   ├── css/               # Modern Glassmorphic CSS design system (styles.css)
│   ├── js/                # Client state, Leaflet maps & DOM handler (main.js)
│   └── index.html         # Responsive HTML5 SPA layout
├── .env                   # Environment variables
├── package.json           # Dependencies & NPM scripts
└── README.md              # Project documentation
```

---

## ⚡ Tech Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | HTML5, CSS3, ES6+ JS | Glassmorphic, responsive dark theme design system |
| **Interactive Maps**| OpenStreetMap + Leaflet.js | Free location mapping & pin visualization |
| **Backend API** | Node.js + Express.js | Modular RESTful API backend architecture |
| **Database** | MongoDB + Mongoose ODM | Cloud/Local persistence for destinations & user data |
| **AI Intelligence**| `@google/generative-ai` | Google Gemini AI trip reasoning service |
| **Security** | JSONWebToken (JWT) & bcryptjs | Password encryption & session authorization |

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.0 or higher)
- [MongoDB](https://www.mongodb.com/) (Running locally on `127.0.0.1:27017` or MongoDB Atlas URI)

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/Chaitanya0210/SUVIDHA-AI-TRAVEL-SAATHI.git
cd travel-recommendation-app
npm install
```

### 2. Configure Environment Variables
Create or verify your `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/travel_recommendation_db
JWT_SECRET=suvidha_ai_travel_saathi_super_secret_jwt_key_2026
GEMINI_API_KEY=your_optional_gemini_api_key
```

### 3. Run Application
```bash
# Start local development server (with nodemon)
npm run dev

# Or start standard production server
npm start
```

Open your browser at `http://localhost:5000` to interact with **SUVIDHA AI TRAVEL SAATHI**!

---

## 📡 API Endpoint Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend status & system health check |
| `GET` | `/api/destinations` | Get all seeded travel destinations (supports `search`, `category`, `budget`, `vibe`) |
| `GET` | `/api/destinations/seed` | Seed initial destinations database |
| `POST` | `/api/ai-planner/generate-plan` | Submit user parameters to generate full day-by-day AI itinerary |
| `GET` | `/api/ai-planner/recommendations` | Get matched destinations sorted by percentage match score |
| `POST` | `/api/auth/register` | Register new user account |
| `POST` | `/api/auth/login` | Login user & issue JWT authorization token |

---

## 👥 Author & Project Lead

- **Project Lead & Architect**: Chaitanya
- **GitHub Repository**: [Chaitanya0210/SUVIDHA-AI-TRAVEL-SAATHI](https://github.com/Chaitanya0210/SUVIDHA-AI-TRAVEL-SAATHI)

---

## 📄 License
This project is released under the [MIT License](LICENSE).
