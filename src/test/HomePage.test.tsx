import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from '../store'
import HomePage from '../pages/HomePage'

// Mock the Redux store
vi.mock('../store/slices/journalsSlice', () => ({
  fetchJournals: vi.fn(() => ({ type: 'journals/fetchJournals' })),
}))

vi.mock('../store/slices/analyticsSlice', () => ({
  fetchKPISummary: vi.fn(() => ({ type: 'analytics/fetchKPISummary' })),
  fetchTopArticles: vi.fn(() => ({ type: 'analytics/fetchTopArticles' })),
}))

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
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
    expect(screen.getByText('Welcome to UDSM JOURNALS')).toBeInTheDocument()
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
    expect(screen.getByText('Popular Articles')).toBeInTheDocument()
  })
})
