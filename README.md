# UDSM JOURNALS - Analytics-Enhanced Institutional Repository

A fully local-first, analytics-enhanced, real-time version of commons.udsm.ac.tz built with React + Vite.

## Features

- **Local-First Architecture**: All data sourced from locally hosted OJS and Matomo
- **Real-Time Analytics**: Live views/downloads counters, trending articles, geo heatmaps
- **Analytics Overlays**: Dashboard panels for metrics without disrupting user workflow
- **UDSM Branding**: Professional institutional design
- **WCAG Compliant**: Accessible UI with proper focus states and ARIA labels

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library
- **Docker**: Multi-stage Dockerfile with Nginx

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Local OJS instance (http://localhost:8080)
- Local Matomo instance (http://localhost:8888)

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
VITE_OJS_BASE_URL=http://localhost:8080
VITE_OJS_API_TOKEN=your-ojs-api-token
VITE_MATOMO_BASE_URL=http://localhost:8888
VITE_MATOMO_SITE_ID=1
VITE_MATOMO_API_TOKEN=your-matomo-api-token
VITE_WS_URL=ws://localhost:3001
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## API Integration

### OJS API (http://localhost:8080)

- `GET /index.php/{journal}/api/v1/submissions` - List submissions
- `GET /index.php/{journal}/api/v1/issues` - List issues
- `GET /index.php/{journal}/api/v1/users` - List users

### Matomo API (http://localhost:8888)

- `VisitsSummary.get` - KPI summary
- `Live.getLastVisitsDetails` - Real-time activity
- `Actions.getPageTitles` - Top articles
- `Actions.getDownloads` - Downloads
- `UserCountry.getCountry` - Geographic data

## Project Structure

```
src/
├── components/       # Reusable UI components
├── contexts/        # React contexts (RealTime)
├── pages/           # Page components
├── services/        # API clients
├── store/          # Redux store and slices
├── test/           # Test setup and mocks
└── types/          # TypeScript definitions
```

## License

MIT
