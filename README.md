<!--suppress HtmlDeprecatedAttribute -->
<div align="center">

![UDSM Journals](https://img.shields.io/badge/UDSM-Journals-blue?style=for-the-badge&logo=university)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Django](https://img.shields.io/badge/Django-4.2-green?style=flat-square&logo=django)
![Docker](https://img.shields.io/badge/Docker-24-blue?style=flat-square&logo=docker)

# UDSM JOURNALS

### Analytics-Enhanced Institutional Repository

A fully local-first, analytics-enhanced, real-time version of **commons.udsm.ac.tz** built with React + Vite. This application provides institutional journal publishing with integrated analytics from OJS and Matomo.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Docker Compose](https://img.shields.io/badge/Docker-Compose-blue.svg)](docker-compose.yml)
[![Contributors](https://img.shields.io/github/contributors/udsm/journals.svg)]()

---

<p align="center">
  <a href="#system-overview">Overview</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#features">Features</a> •
  <a href="#prerequisites">Prerequisites</a> •
  <a href="#installation">Installation</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#api-reference">API Reference</a> •
  <a href="#troubleshooting">Troubleshooting</a>
</p>

</div>

---

## 🚀 System Overview

UDSM Journals is a comprehensive institutional repository system that combines:

- **Journal Publishing** via Open Journal Systems (OJS)
- **Web Analytics** via Matomo
- **Real-Time Metrics** via WebSocket connections
- **Modern Frontend** built with React and TypeScript
- **RESTful Backend** powered by Django

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              UDSM JOURNALS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │   Browser    │    │   Browser    │    │   Browser    │                   │
│  │  (React UI)  │    │  (React UI)  │    │  (React UI)  │                   │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                   │
│         │                   │                   │                            │
│         └───────────────────┼───────────────────┘                            │
│                             │                                                │
│                             ▼                                                │
│                    ┌────────────────┐                                        │
│                    │   Nginx        │                                        │
│                    │  (Port 3000)  │                                        │
│                    └────────┬───────┘                                        │
│                             │                                                │
│              ┌──────────────┼──────────────┐                                 │
│              │              │              │                                 │
│              ▼              ▼              ▼                                 │
│     ┌────────────┐  ┌────────────┐  ┌────────────┐                          │
│     │  React    │  │  Django    │  │  Node.js  │                          │
│     │  Frontend │  │  Backend   │  │  Server   │                          │
│     │  (Vite)   │  │  (Port 8000)│  │(Matomo)   │                          │
│     └────────────┘  └─────┬──────┘  └─────┬──────┘                          │
│                          │              │                                   │
└──────────────────────────┼──────────────┼───────────────────────────────────┘
                           │              │
         ┌─────────────────┼──────────────┼─────────────────┐                  
         │                 │              │                 │                  
         ▼                 ▼              ▼                 ▼                  
┌─────────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        
│   OJS Service   │  │   Redis     │  │  Matomo     │  │   OJS DB    │        
│  (Port 8080)    │  │  (Port 6379)│  │ (Port 8085) │  │  MySQL 8.0  │        
└─────────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        
                                                                     │        
                                                             ┌─────────────┐
                                                             │ Matomo DB   │
                                                             │  MySQL 8.0  │
                                                             └─────────────┘
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 **Real-Time Analytics** | Live views/downloads counters, trending articles, geo heatmaps |
| 🌐 **Local-First Architecture** | All data sourced from locally hosted OJS and Matomo instances |
| 🎯 **Analytics Overlays** | Dashboard panels for metrics without disrupting user workflow |
| 🎨 **UDSM Branding** | Professional institutional design with UDSM logo and colors |
| ♿ **WCAG Compliant** | Accessible UI with proper focus states and ARIA labels |
| 🔌 **REST API** | Django REST framework for structured API endpoints |
| 🔄 **WebSocket Support** | Real-time updates via Redis pub/sub |
| 🐳 **Docker Ready** | Complete containerization with Docker Compose |

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI Framework |
| TypeScript | 5.x | Type Safety |
| Vite | 5.x | Build Tool |
| Redux Toolkit | 2.x | State Management |
| Zustand | 4.x | Lightweight State |
| Tailwind CSS | 3.x | Styling |
| Recharts | 2.x | Charts |
| Socket.io Client | 4.x | WebSocket |
| Leaflet | 1.9.x | Maps |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Django | 4.2.x | Web Framework |
| Django REST Framework | 3.14.x | REST API |
| Django Channels | 4.x | WebSockets |
| Redis | 7.x | Cache/Pub-Sub |
| MySQL | 8.0 | Database |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker | Container Runtime |
| Docker Compose | Orchestration |
| Nginx | Reverse Proxy |
| OJS | Journal Management |
| Matomo | Analytics |

---

## 📋 Prerequisites

Before installation, ensure you have the following:

| Requirement | Minimum Version | Recommended | Purpose |
|------------|----------------|-------------|---------|
| Node.js | 18.x | 20.x | Frontend development |
| Docker | 24.0+ | Latest | Container runtime |
| Docker Compose | 2.0+ | Latest | Service orchestration |
| Git | 2.0+ | Latest | Version control |
| RAM | 8GB | 16GB | Running all services |
| Disk | 20GB | 50GB | Data and logs |

---

## 📥 Installation

### Quick Start (Recommended)

The fastest way to get started using Docker Compose:

```bash
# 1. Clone the repository
git clone <repository-url>
cd hackathon

# 2. Start all services
docker-compose up -d

# 3. Verify services are running
docker-compose ps
```

### Services Available

| Service | URL | Description |
|---------|-----|-------------|
| 🌐 Frontend | http://localhost:3000 | React application |
| 📰 OJS | http://localhost:8080 | Journal management |
| 📊 Matomo | http://localhost:8085 | Analytics dashboard |
| 🔧 Django API | http://localhost:8000 | Backend REST API |

---

### Manual Installation

#### 1. Frontend Setup

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Configure environment variables (see Configuration section)
# Edit .env with your specific values

# Start development server
npm run dev
```

#### 2. Backend Setup (Django)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

#### 3. Node.js Server Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start server
npm start
```

---

## ⚙️ Configuration

### Frontend Environment Variables

Create a `.env` file in the project root:

```env
# ===========================================
# OJS Configuration
# ===========================================
VITE_OJS_BASE_URL=http://localhost:8080
VITE_OJS_API_TOKEN=your-ojs-api-token

# ===========================================
# Matomo Analytics
# ===========================================
VITE_MATOMO_BASE_URL=http://localhost:8888
VITE_MATOMO_SITE_ID=1
VITE_MATOMO_API_TOKEN=your-matomo-api-token

# ===========================================
# WebSocket
# ===========================================
VITE_WS_URL=ws://localhost:3001

# ===========================================
# Django Backend
# ===========================================
VITE_DJANGO_BASE_URL=http://localhost:8000
```

### Backend Environment Variables

Create a `.env` file in `backend/`:

```env
# ===========================================
# Django Settings
# ===========================================
DEBUG=True
DJANGO_SECRET_KEY=your-secret-key-change-in-production

# ===========================================
# Redis Cache
# ===========================================
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0

# ===========================================
# OJS Connection
# ===========================================
OJS_BASE_URL=http://ojs:8080
OJS_API_KEY=your-ojs-api-key
OJS_JOURNALS=innovative-minds:1,bright-tomorrow:2

# ===========================================
# Matomo Analytics
# ===========================================
MATOMO_BASE_URL=http://matomo:8085/index.php
MATOMO_TOKEN=your-matomo-token
MATOMO_SITE_ID=1

# ===========================================
# Optional Services
# ===========================================
SERPER_API_KEY=your-serper-api-key
```

---

## 💻 Development Commands

### Frontend

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run tests |
| `npm run test:ui` | Run tests with UI |
| `npm run test:coverage` | Generate coverage report |
| `npm run lint` | Lint code |

### Docker

| Command | Description |
|---------|-------------|
| `docker-compose up -d` | Start all services |
| `docker-compose down` | Stop all services |
| `docker-compose down -v` | Stop and remove volumes |
| `docker-compose logs -f` | View all logs |
| `docker-compose logs -f backend` | View backend logs |
| `docker-compose restart` | Restart all services |
| `docker-compose build app` | Rebuild frontend |

### Django Backend

| Command | Description |
|---------|-------------|
| `python manage.py migrate` | Run migrations |
| `python manage.py makemigrations` | Create migrations |
| `python manage.py createsuperuser` | Create admin user |
| `pytest` | Run tests |
| `pytest --cov` | Run with coverage |

---

## 📂 Project Structure

```
hackathon/
│
├── 📁 backend/                    # Django backend
│   ├── 📁 analytics/             # Analytics app
│   │   ├── 📄 consumers.py       # WebSocket consumers
│   │   ├── 📄 serializers.py     # DRF serializers
│   │   ├── 📁 services/          # Business logic
│   │   │   ├── 📄 citation_service.py
│   │   │   ├── 📄 matomo_service.py
│   │   │   ├── 📄 ojs_service.py
│   │   │   └── 📄 redis_service.py
│   │   ├── 📄 urls.py            # URL routing
│   │   └── 📄 views.py           # API views
│   ├── 📁 backend/               # Django project
│   │   ├── 📄 settings.py
│   │   ├── 📄 urls.py
│   │   └── 📄 wsgi.py
│   ├── 📄 manage.py              # Django CLI
│   └── 📄 requirements.txt       # Python deps
│
├── 📁 server/                    # Node.js proxy
│   ├── 📄 index.js              # Express server
│   └── 📄 package.json
│
├── 📁 src/                       # React frontend
│   ├── 📁 components/           # UI components
│   │   ├── 📄 AnalyticsOverlay.tsx
│   │   ├── 📄 Footer.tsx
│   │   ├── 📄 Header.tsx
│   │   ├── 📄 Layout.tsx
│   │   └── 📄 LiveMetricsBar.tsx
│   ├── 📁 contexts/             # React contexts
│   │   └── 📄 RealTimeContext.tsx
│   ├── 📁 pages/                # Page components
│   │   ├── 📄 AnalyticsDashboard.tsx
│   │   ├── 📄 ArticlePage.tsx
│   │   ├── 📄 HomePage.tsx
│   │   └── 📄 ...
│   ├── 📁 services/             # API clients
│   │   └── 📄 api.ts
│   ├── 📁 store/                # Redux store
│   │   ├── 📄 index.ts
│   │   └── 📁 slices/
│   └── 📁 types/                # TypeScript types
│
├── 📄 docker-compose.yml        # Docker orchestration
├── 📄 Dockerfile                # Frontend image
├── 📄 nginx.conf                # Nginx config
├── 📄 package.json              # Frontend deps
└── 📄 README.md                 # This file
```

---

## 🔌 API Reference

### OJS API Endpoints

> Base URL: `http://localhost:8080`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/index.php/{journal}/api/v1/submissions` | `GET` | List submissions |
| `/index.php/{journal}/api/v1/issues` | `GET` | List journal issues |
| `/index.php/{journal}/api/v1/users` | `GET` | List journal users |
| `/index.php/{journal}/api/v1/articles/{id}` | `GET` | Get article details |
| `/index.php/{journal}/api/v1/sections` | `GET` | List sections |

### Matomo API Methods

> Base URL: `http://localhost:8085`

| Method | Description |
|--------|-------------|
| `VisitsSummary.get` | KPI summary (visits, page views, bounce rate) |
| `Live.getLastVisitsDetails` | Real-time visitor activity |
| `Actions.getPageTitles` | Top performing articles |
| `Actions.getDownloads` | Download statistics |
| `UserCountry.getCountry` | Geographic distribution |

### Django Backend API

> Base URL: `http://localhost:8000`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics/overview` | `GET` | Analytics overview |
| `/api/analytics/realtime` | `GET` | Real-time metrics |
| `/api/analytics/trending` | `GET` | Trending articles |
| `/api/analytics/geo` | `GET` | Geographic data |
| `/api/journals/` | `GET` | List journals |
| `/api/articles/` | `GET` | List articles |

---

## 🐛 Troubleshooting

### Common Issues

#### ❌ Services Not Starting

```bash
# Check Docker status
docker ps -a

# Check logs
docker-compose logs -f

# Restart Docker daemon
sudo systemctl restart docker
```

#### 🔴 Port Conflicts

If ports are already in use:

```bash
# Find process using port
lsof -i :3000  # Frontend
lsof -i :8000  # Backend
lsof -i :8080  # OJS
lsof -i :8085  # Matomo

# Kill process
kill -9 <PID>
```

#### 🗄️ Database Connection Issues

```bash
# Check database containers
docker-compose ps ojs-db matomo-db

# View database logs
docker-compose logs ojs-db

# Reset database volumes
docker-compose down -v
docker-compose up -d
```

#### 💾 Memory Issues

> Increase Docker memory allocation in Docker Desktop settings to at least **4GB**.

#### 🔒 Permission Issues

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm

# Fix Docker volume permissions
sudo chmod -R 755 /var/lib/docker
```

### Health Check Endpoints

| Service | URL | Expected Response |
|---------|-----|-------------------|
| Frontend | http://localhost:3000 | HTML page |
| Django API | http://localhost:8000/api/health | JSON |
| OJS | http://localhost:8080 | HTML page |
| Matomo | http://localhost:8085 | HTML page |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Open Journal Systems (OJS)](https://pkp.sfu.ca/ojs/) - Open-source journal management
- [Matomo](https://matomo.org/) - Open-source analytics platform
- [React](https://react.dev/) - UI library
- [Django](https://www.djangoproject.com/) - Python web framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [UDSM](https://www.udsm.ac.tz/) - University of Dar es Salaam

---

<div align="center">

Made with ❤️ by Beatus Simon

</div>
