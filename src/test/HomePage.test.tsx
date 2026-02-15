import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import HomePage from '../pages/HomePage'

// Create mock reducers with proper initial state structure matching analyticsSlice
const mockJournalsReducer = (state = { 
  journals: [], 
  currentJournal: null,
  issues: [],
  currentIssue: null,
  loading: false, 
  error: null 
}) => state

const mockArticlesReducer = (state = { 
  articles: [], 
  currentArticle: null,
  loading: false, 
  error: null 
}) => state

const mockAnalyticsReducer = (state = { 
  topArticles: [], 
  kpi: null,
  countries: [],
  devices: [],
  referrers: [],
  trends: null,
  loading: false, 
  error: null,
  countryData: [],
  trendingJournals: [],
  totalCitations: 0,
  realtimeVisitors: 0,
  downloads: [],
  downloadsLoading: false,
}) => state

const mockRealtimeReducer = (state = { 
  connected: false, 
  activeVisitors: null,
  viewsToday: null,
  downloadsToday: null,
  topArticles: [],
  topJournals: [],
  geoHotspots: [],
  recentEvents: [],
}) => state

// Create a test store with mock reducers
const createTestStore = () => configureStore({
  reducer: {
    journals: mockJournalsReducer,
    articles: mockArticlesReducer,
    analytics: mockAnalyticsReducer,
    realtime: mockRealtimeReducer,
  },
})

const renderWithProviders = (component: React.ReactElement) => {
  const testStore = createTestStore()
  return render(
    <Provider store={testStore}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  )
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the home page with title', () => {
    renderWithProviders(<HomePage />)
    expect(screen.getByText('UDSM Journals')).toBeInTheDocument()
  })

  it('renders search and submission buttons', () => {
    renderWithProviders(<HomePage />)
    expect(screen.getByText('Search Repository')).toBeInTheDocument()
    expect(screen.getByText('Submit Research')).toBeInTheDocument()
  })

  it('renders featured journals section', () => {
    renderWithProviders(<HomePage />)
    expect(screen.getByText('Featured Journals')).toBeInTheDocument()
  })

  it('renders popular articles section', () => {
    renderWithProviders(<HomePage />)
    expect(screen.getByText('Most Interacted Articles')).toBeInTheDocument()
  })
})
