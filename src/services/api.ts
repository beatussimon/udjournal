import axios from 'axios'

const OJS_BASE_URL = import.meta.env.VITE_OJS_BASE_URL || 'http://localhost:8080'
const DJANGO_BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL || 'http://localhost:8000'

// OJS API Client - Direct calls for public content only
export const ojsApi = axios.create({
  baseURL: OJS_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Add response interceptor for error handling
ojsApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('OJS API Error:', error.message)
    return Promise.reject(error)
  }
)

// Django Backend API Client - For all analytics and OJS proxy calls
const djangoApi = axios.create({
  baseURL: DJANGO_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

djangoApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Django API Error:', error.message)
    return Promise.reject(error)
  }
)

// ============================================
// DJANGO BACKEND API - Analytics & Content Proxy
// ============================================

export const analyticsAPI = {
  // Health check
  healthCheck: async () => {
    const response = await djangoApi.get('/api/health')
    return response.data
  },

  // Dashboard - Complete analytics data
  getDashboard: async (period: string = 'month', date: string = 'today') => {
    const response = await djangoApi.get('/api/dashboard', {
      params: { period, date }
    })
    return response.data
  },

  // KPI Summary
  getKPI: async (period: string = 'day', date: string = 'today') => {
    const response = await djangoApi.get('/api/kpi', {
      params: { period, date }
    })
    return response.data
  },

  // Real-time data
  getRealtime: async (maxRows: number = 10) => {
    const response = await djangoApi.get('/api/realtime', {
      params: { maxRows }
    })
    return response.data
  },

  // Live metrics (from Redis)
  getLiveMetrics: async () => {
    const response = await djangoApi.get('/api/live-metrics')
    return response.data
  },

  // Top Articles
  getTopArticles: async (period: string = 'week', date: string = 'today', limit: number = 20) => {
    const response = await djangoApi.get('/api/top-articles', {
      params: { period, date, limit }
    })
    return response.data
  },

  // Downloads
  getDownloads: async (period: string = 'month', date: string = 'today', limit: number = 20) => {
    const response = await djangoApi.get('/api/downloads', {
      params: { period, date, limit }
    })
    return response.data
  },

  // Countries
  getCountries: async (period: string = 'month', date: string = 'today') => {
    const response = await djangoApi.get('/api/countries', {
      params: { period, date }
    })
    return response.data
  },

  // Geo Heatmap
  getGeoHeatmap: async () => {
    const response = await djangoApi.get('/api/geo-heatmap')
    return response.data
  },

  // Devices
  getDevices: async (period: string = 'month', date: string = 'today') => {
    const response = await djangoApi.get('/api/devices', {
      params: { period, date }
    })
    return response.data
  },

  // Referrers
  getReferrers: async (period: string = 'month', date: string = 'today') => {
    const response = await djangoApi.get('/api/referrers', {
      params: { period, date }
    })
    return response.data
  },

  // Trends
  getTrends: async (date: string = 'last30') => {
    const response = await djangoApi.get('/api/trends', {
      params: { date }
    })
    return response.data
  },

  // Trending
  getTrending: async (limit: number = 10) => {
    const response = await djangoApi.get('/api/trending', {
      params: { limit }
    })
    return response.data
  },

  // Track view
  trackView: async (articleId: string, journalId?: string) => {
    const response = await djangoApi.post('/api/track/view', {
      article_id: articleId,
      journal_id: journalId
    })
    return response.data
  },

  // Track download
  trackDownload: async (articleId: string, journalId?: string) => {
    const response = await djangoApi.post('/api/track/download', {
      article_id: articleId,
      journal_id: journalId
    })
    return response.data
  },

  // Article metrics
  getArticleMetrics: async (articleId: string, period: string = 'month', date: string = 'today') => {
    const response = await djangoApi.get(`/api/article/${articleId}/metrics`, {
      params: { period, date }
    })
    return response.data
  },
}

// ============================================
// OJS API PROXY - Through Django Backend
// ============================================

export const ojsProxyAPI = {
  // Get journals
  getJournals: async () => {
    const response = await djangoApi.get('/api/ojs/journals')
    return response.data
  },

  // Get issues for a journal
  getIssues: async (journalPath: string, status?: string, page: number = 1) => {
    const response = await djangoApi.get(`/api/ojs/${journalPath}/issues`, {
      params: { status, page }
    })
    return response.data
  },

  // Get submissions
  getSubmissions: async (
    journalPath: string,
    status?: string,
    page: number = 1,
    itemsPerPage: number = 20
  ) => {
    const response = await djangoApi.get(`/api/ojs/${journalPath}/submissions`, {
      params: { status, page, items_per_page: itemsPerPage }
    })
    return response.data
  },

  // Get article
  getArticle: async (journalPath: string, articleId: number) => {
    const response = await djangoApi.get(`/api/ojs/${journalPath}/article/${articleId}`)
    return response.data
  },

  // Get journal stats
  getJournalStats: async (journalPath: string) => {
    const response = await djangoApi.get(`/api/ojs/${journalPath}/stats`)
    return response.data
  },

  // Get journal metrics (comprehensive)
  getJournalMetrics: async (journalPath: string) => {
    const response = await djangoApi.get(`/api/ojs/${journalPath}/metrics`)
    return response.data
  },

  // Get article metrics (comprehensive)
  getArticleMetrics: async (journalPath: string, articleId: number) => {
    const response = await djangoApi.get(`/api/ojs/${journalPath}/article/${articleId}/metrics`)
    return response.data
  },

  // Get all journals metrics
  getAllOJSMetrics: async () => {
    const response = await djangoApi.get('/api/ojs/all-metrics')
    return response.data
  },
}

// ============================================
// CITATIONS API - Serper API Integration
// ============================================

export const citationsAPI = {
  // Search citations
  searchCitations: async (title: string, author?: string, journal?: string) => {
    const response = await djangoApi.get('/api/citations/search', {
      params: { title, author, journal }
    })
    return response.data
  },

  // Get article citations
  getArticleCitations: async (articleId: string, journalPath?: string, forceRefresh: boolean = false) => {
    const response = await djangoApi.get(`/api/citations/article/${articleId}`, {
      params: { journal_path: journalPath, force_refresh: forceRefresh }
    })
    return response.data
  },

  // Trigger citation update
  updateCitations: async () => {
    const response = await djangoApi.post('/api/citations/update')
    return response.data
  },
}

// ============================================
// ALL METRICS API - Combined Dashboard
// ============================================

export const allMetricsAPI = {
  getAllMetrics: async (period: string = 'month', date: string = 'today') => {
    const response = await djangoApi.get('/api/all-metrics', {
      params: { period, date }
    })
    return response.data
  },
}

// ============================================
// OJS API FUNCTIONS - Direct calls for public content only
// ============================================

// Keep original OJS calls for direct access (when needed)
export const ojsAPI = {
  // Get published submissions for a journal
  getPublishedSubmissions: async (journalPath: string, page: number = 0, limit: number = 20) => {
    const response = await ojsApi.get(`/${journalPath}/api/v1/submissions`, {
      params: {
        status: 'published',
        page,
        limit,
      }
    })
    return response.data
  },

  // Get single submission
  getSubmission: async (journalPath: string, submissionId: number) => {
    const response = await ojsApi.get(`/${journalPath}/api/v1/submissions/${submissionId}`)
    return response.data
  },

  // Get issues for a journal
  getIssues: async (journalPath: string) => {
    const response = await ojsApi.get(`/${journalPath}/api/v1/issues`)
    return response.data
  },

  // Get single issue
  getIssue: async (journalPath: string, issueId: number) => {
    const response = await ojsApi.get(`/${journalPath}/api/v1/issues/${issueId}`)
    return response.data
  },

  // Get journal info
  getJournal: async (journalPath: string) => {
    const response = await ojsApi.get(`/${journalPath}/api/v1/journal`)
    return response.data
  },

  // Get all journals (contexts) from OJS
  getJournals: async () => {
    try {
      const response = await ojsApi.get('/innovative-minds/api/v1/contexts', {
        params: {
          apiToken: import.meta.env.VITE_OJS_API_TOKEN
        }
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch journals from OJS:', error)
      throw error
    }
  },

  // Search submissions
  searchSubmissions: async (journalPath: string, query: string) => {
    const response = await ojsApi.get(`/${journalPath}/api/v1/submissions`, {
      params: {
        status: 'published',
        search: query,
      }
    })
    return response.data
  },
}

// ============================================
// CACHE IMPLEMENTATION
// ============================================

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache: Map<string, CacheEntry<unknown>> = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export function getCachedData<T>(key: string): T | null {
  const entry = cache.get(key)
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T
  }
  cache.delete(key)
  return null
}

export function setCachedData<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() })
}

export function clearCache(): void {
  cache.clear()
}

// ============================================
// SSE/WS URL Configuration
// ============================================

export const SSE_URL = `${DJANGO_BASE_URL}/api/sse`
export const WS_URL = `${DJANGO_BASE_URL.replace('http', 'ws')}/ws/analytics/`

// Backward compatibility - map old matomoAPI to new analyticsAPI
export const matomoAPI = {
  ...analyticsAPI,
  // Add missing method names for backward compatibility
  getKPISummary: analyticsAPI.getKPI,
  getTopArticles: analyticsAPI.getTopArticles,
  getDownloads: analyticsAPI.getDownloads,
  getCountryData: analyticsAPI.getCountries,
  getDevices: analyticsAPI.getDevices,
  getReferrers: analyticsAPI.getReferrers,
  getTrendOverTime: analyticsAPI.getTrends,
}
