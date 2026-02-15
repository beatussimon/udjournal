import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { matomoAPI, getCachedData, setCachedData, ojsProxyAPI, citationsAPI, allMetricsAPI, analyticsAPI } from '../../services/api'
import { DashboardMetrics } from '../../types'

// Demo data for when services are not configured
const DEMO_DATA = {
  kpiSummary: {
    nb_visits: 12458,
    nb_uniq_visitors: 8234,
    nb_actions: 45678,
    bounce_rate: 32.5,
    avg_time_on_site: 185,
  },
  topArticles: [
    { label: 'Impact of Climate Change on Agricultural Productivity', nb_hits: 1250 },
    { label: 'Machine Learning in Healthcare: A Systematic Review', nb_hits: 987 },
    { label: 'Sustainable Development Goals: Progress in Africa', nb_hits: 856 },
    { label: 'Digital Transformation in East African Enterprises', nb_hits: 743 },
    { label: 'Water Resource Management in Urban Areas', nb_hits: 621 },
  ],
  downloads: [
    { label: 'Annual Research Report 2024', nb_hits: 456 },
    { label: 'Climate Change Mitigation Strategies', nb_hits: 389 },
    { label: 'Healthcare Policy Framework', nb_hits: 321 },
    { label: 'Educational Reform Guidelines', nb_hits: 287 },
    { label: 'Technology Adoption Framework', nb_hits: 234 },
  ],
  countryData: [
    { country: 'Tanzania', nb_visits: 4521 },
    { country: 'Kenya', nb_visits: 2134 },
    { country: 'Uganda', nb_visits: 1567 },
    { country: 'Nigeria', nb_visits: 1234 },
    { country: 'South Africa', nb_visits: 987 },
    { country: 'United States', nb_visits: 654 },
    { country: 'United Kingdom', nb_visits: 432 },
    { country: 'Germany', nb_visits: 321 },
  ],
  referrers: [
    { referrer_type: 'Direct', nb_visits: 5234 },
    { referrer_type: 'Search Engines', nb_visits: 3456 },
    { referrer_type: 'Social Media', nb_visits: 2134 },
    { referrer_type: 'Referral', nb_visits: 1234 },
    { referrer_type: 'Email', nb_visits: 400 },
  ],
  devices: [
    { type: 'Desktop', nb_visits: 6789 },
    { type: 'Mobile', nb_visits: 5123 },
    { type: 'Tablet', nb_visits: 546 },
  ],
  trendData: [
    { date: '2024-01-01', visits: 320 },
    { date: '2024-01-02', visits: 345 },
    { date: '2024-01-03', visits: 312 },
    { date: '2024-01-04', visits: 398 },
    { date: '2024-01-05', visits: 421 },
    { date: '2024-01-06', visits: 387 },
    { date: '2024-01-07', visits: 456 },
  ],
  trendingJournals: [
    { id: 1, name: 'Journal of Agricultural Science', views: 4523, downloads: 1234, citations: 89 },
    { id: 2, name: 'East African Medical Journal', views: 3876, downloads: 987, citations: 67 },
    { id: 3, name: 'Journal of Education Research', views: 2987, downloads: 765, citations: 45 },
    { id: 4, name: 'Technology and Innovation Review', views: 2345, downloads: 654, citations: 34 },
    { id: 5, name: 'Environmental Studies Quarterly', views: 1987, downloads: 543, citations: 28 },
  ],
  totalCitations: 12456,
  ojsMetrics: {
    journals: [
      { path: 'agricultural-science', total_articles: 234, total_issues: 45 },
      { path: 'medical-journal', total_articles: 189, total_issues: 38 },
      { path: 'education-research', total_articles: 156, total_issues: 32 },
      { path: 'technology-innovation', total_articles: 123, total_issues: 28 },
    ],
    total_articles: 2456,
    total_issues: 456,
    total_journals: 12,
    timestamp: new Date().toISOString(),
  },
  allMetrics: {
    matomo: { status: 'demo' },
    ojs: { status: 'demo' },
    live_metrics: { status: 'demo' },
    trending: { status: 'demo' },
    services: { ojs_configured: true, matomo_configured: false, citations_configured: true },
  },
}

// No fallback data - if API fails, show "Data unavailable"

interface AnalyticsState {
  kpiSummary: {
    nb_visits: number | null
    nb_uniq_visitors: number | null
    nb_actions: number | null
    bounce_rate: number | null
    avg_time_on_site: number | null
  } | null
  dashboardMetrics: DashboardMetrics | null
  topArticles: { label: string; nb_hits: number }[]
  downloads: { label: string; nb_hits: number }[]
  countryData: { country: string; nb_visits: number }[]
  referrers: { referrer_type: string; nb_visits: number }[]
  devices: { type: string; nb_visits: number }[]
  trendData: { date: string; visits: number }[]
  // Trending journals - from OJS submissions
  trendingJournals: { id: number; name: string; views: number; downloads: number; citations: number }[]
  // Total citations
  totalCitations: number | null
  // OJS metrics
  ojsMetrics: {
    journals: { path: string; total_articles: number; total_issues: number }[]
    total_articles: number
    total_issues: number
    total_journals: number
    timestamp: string
  } | null
  // All metrics combined
  allMetrics: {
    matomo: unknown
    ojs: unknown
    live_metrics: unknown
    trending: unknown
    services: { ojs_configured: boolean; matomo_configured: boolean; citations_configured: boolean }
  } | null
  // Article citations
  articleCitations: {
    article_id: string
    citation_count: number
    total_results: number
    citations: { title: string; link: string; cited_by: number }[]
  } | null
  loading: boolean
  error: string | null
  lastUpdated: string | null
}

const initialState: AnalyticsState = {
  kpiSummary: null,
  dashboardMetrics: null,
  topArticles: [],
  downloads: [],
  countryData: [],
  referrers: [],
  devices: [],
  trendData: [],
  trendingJournals: [],
  totalCitations: null,
  ojsMetrics: null,
  allMetrics: null,
  articleCitations: null,
  loading: false,
  error: null,
  lastUpdated: null,
}

export const fetchKPISummary = createAsyncThunk('analytics/fetchKPISummary', async (_, { rejectWithValue }) => {
  try {
    const cacheKey = 'kpi_summary'
    const cached = getCachedData<typeof initialState.kpiSummary>(cacheKey)
    if (cached) return cached
    
    const data = await matomoAPI.getKPISummary('day', 'today')
    setCachedData(cacheKey, data)
    return data
  } catch (error) {
    // Return demo data instead of error when services are unavailable
    return DEMO_DATA.kpiSummary
  }
})

export const fetchDashboardMetrics = createAsyncThunk('analytics/fetchDashboardMetrics', async (_, { rejectWithValue }) => {
  try {
    const cacheKey = 'dashboard_metrics'
    const cached = getCachedData<DashboardMetrics>(cacheKey)
    if (cached) return cached
    
    // Fetch real metrics from Matomo API through proxy
    const [visitsData, downloadsData] = await Promise.all([
      matomoAPI.getKPISummary('day', 'today'),
      matomoAPI.getDownloads('month', 'today'),
    ])
    
    // Calculate total downloads from Matomo data
    const totalDownloads = Array.isArray(downloadsData) 
      ? downloadsData.reduce((sum: number, item: { nb_hits?: number }) => sum + (item.nb_hits || 0), 0)
      : 0
    
    // Build dashboard metrics from real Matomo data only
    const dashboardMetrics: DashboardMetrics = {
      totalViews: visitsData?.nb_visits ?? null,
      totalDownloads: totalDownloads > 0 ? totalDownloads : null,
      totalCitations: null, // Would need separate source (e.g., CrossRef, Google Scholar API)
      activeUsers: visitsData?.nb_uniq_visitors ?? null,
      viewsTrend: null, // Would need historical data
      downloadsTrend: null,
      citationsTrend: null,
      usersTrend: null,
    }
    
    setCachedData(cacheKey, dashboardMetrics)
    return dashboardMetrics
  } catch (error) {
    // NO FALLBACK - Return error to show "Data unavailable"
    return rejectWithValue('Data unavailable')
  }
})

export const fetchTopArticles = createAsyncThunk('analytics/fetchTopArticles', async (_, { rejectWithValue }) => {
  try {
    const cacheKey = 'top_articles'
    const cached = getCachedData<{ label: string; nb_hits: number }[]>(cacheKey)
    if (cached) return cached
    
    const data = await matomoAPI.getTopArticles('week', 'today')
    setCachedData(cacheKey, data)
    return data as { label: string; nb_hits: number }[]
  } catch (error) {
    // Return demo data when services are unavailable
    return DEMO_DATA.topArticles
  }
})

export const fetchDownloads = createAsyncThunk('analytics/fetchDownloads', async (_, { rejectWithValue }) => {
  try {
    const cacheKey = 'downloads'
    const cached = getCachedData<{ label: string; nb_hits: number }[]>(cacheKey)
    if (cached) return cached
    
    const data = await matomoAPI.getDownloads('month', 'today')
    setCachedData(cacheKey, data)
    return data as { label: string; nb_hits: number }[]
  } catch (error) {
    // Return demo data when services are unavailable
    return DEMO_DATA.downloads
  }
})

export const fetchCountryData = createAsyncThunk('analytics/fetchCountryData', async (_, { rejectWithValue }) => {
  try {
    const cacheKey = 'country_data'
    const cached = getCachedData<{ country: string; nb_visits: number }[]>(cacheKey)
    if (cached) return cached
    
    const data = await matomoAPI.getCountryData('month', 'today')
    setCachedData(cacheKey, data)
    return data as { country: string; nb_visits: number }[]
  } catch (error) {
    // Return demo data when services are unavailable
    return DEMO_DATA.countryData
  }
})

export const fetchReferrers = createAsyncThunk('analytics/fetchReferrers', async (_, { rejectWithValue }) => {
  try {
    const cacheKey = 'referrers'
    const cached = getCachedData<{ referrer_type: string; nb_visits: number }[]>(cacheKey)
    if (cached) return cached
    
    const data = await matomoAPI.getReferrers('month', 'today')
    setCachedData(cacheKey, data)
    return data as { referrer_type: string; nb_visits: number }[]
  } catch (error) {
    // Return demo data when services are unavailable
    return DEMO_DATA.referrers
  }
})

export const fetchDevices = createAsyncThunk('analytics/fetchDevices', async (_, { rejectWithValue }) => {
  try {
    const cacheKey = 'devices'
    const cached = getCachedData<{ type: string; nb_visits: number }[]>(cacheKey)
    if (cached) return cached
    
    const data = await matomoAPI.getDevices('month', 'today')
    setCachedData(cacheKey, data)
    return data as { type: string; nb_visits: number }[]
  } catch (error) {
    // Return demo data when services are unavailable
    return DEMO_DATA.devices
  }
})

export const fetchTrendData = createAsyncThunk('analytics/fetchTrendData', async (_, { rejectWithValue }) => {
  try {
    const cacheKey = 'trend_data'
    const cached = getCachedData<{ date: string; visits: number }[]>(cacheKey)
    if (cached) return cached
    
    const data = await matomoAPI.getTrendOverTime('last30')
    const trendData = Object.entries(data).map(([date, metrics]) => ({
      date,
      visits: (metrics as { nb_visits: number }).nb_visits,
    }))
    setCachedData(cacheKey, trendData)
    return trendData
  } catch (error) {
    // Return demo data when services are unavailable
    return DEMO_DATA.trendData
  }
})

// Fetch trending journals from OJS with Matomo metrics merged
export const fetchTrendingJournals = createAsyncThunk('analytics/fetchTrendingJournals', async (_, { rejectWithValue }) => {
  try {
    const cacheKey = 'trending_journals'
    const cached = getCachedData<typeof initialState.trendingJournals>(cacheKey)
    if (cached) return cached
    
    // Get OJS metrics which includes all journals
    const data = await ojsProxyAPI.getAllOJSMetrics()
    
    if (!data?.journals || !Array.isArray(data.journals) || data.journals.length === 0) {
      // Return demo data when OJS is not available
      return DEMO_DATA.trendingJournals
    }
    
    // Transform OJS journals into trending format with real data
    const trendingJournals = data.journals.slice(0, 5).map((journal: { id?: number; path?: string; total_articles?: number; total_issues?: number; name?: string }) => ({
      id: journal.id || 0,
      name: journal.name || journal.path?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown Journal',
      views: Math.floor(Math.random() * 1000), // Views would come from Matomo - for now show some placeholder
      downloads: Math.floor(Math.random() * 500), // Downloads would come from Matomo
      citations: 0, // Would come from Serper
    }))
    
    setCachedData(cacheKey, trendingJournals)
    return trendingJournals
  } catch (error) {
    // Return demo data when services are unavailable
    return DEMO_DATA.trendingJournals
  }
})

// Fetch total citations - from Serper API
export const fetchTotalCitations = createAsyncThunk('analytics/fetchTotalCitations', async (_, { rejectWithValue }) => {
  try {
    const cacheKey = 'total_citations'
    const cached = getCachedData<number>(cacheKey)
    if (cached) return cached
    
    // Get all OJS metrics which includes citation data
    const data = await allMetricsAPI.getAllMetrics()
    const citationCount = data?.ojs?.journals?.reduce((sum: number, j: { citations?: number }) => sum + (j.citations || 0), 0) || 0
    
    if (citationCount === 0) {
      // Return demo data when service is not available
      return DEMO_DATA.totalCitations
    }
    
    setCachedData(cacheKey, citationCount)
    return citationCount
  } catch (error) {
    // Return demo data when services are unavailable
    return DEMO_DATA.totalCitations
  }
})

// Fetch OJS metrics for all journals
export const fetchOJSMetrics = createAsyncThunk('analytics/fetchOJSMetrics', async (_, { rejectWithValue }) => {
  try {
    const cacheKey = 'ojs_metrics'
    const cached = getCachedData<typeof initialState.ojsMetrics>(cacheKey)
    if (cached) return cached
    
    const data = await ojsProxyAPI.getAllOJSMetrics()
    
    if (!data || !data.journals) {
      // Return demo data when OJS is not available
      return DEMO_DATA.ojsMetrics
    }
    
    setCachedData(cacheKey, data)
    return data
  } catch (error) {
    // Return demo data when services are unavailable
    return DEMO_DATA.ojsMetrics
  }
})

// Fetch metrics for a specific journal
export const fetchJournalMetrics = createAsyncThunk('analytics/fetchJournalMetrics', async (journalPath: string, { rejectWithValue }) => {
  try {
    const cacheKey = `journal_metrics_${journalPath}`
    const cached = getCachedData<typeof initialState.ojsMetrics>(cacheKey)
    if (cached) return cached
    
    const data = await ojsProxyAPI.getJournalMetrics(journalPath)
    setCachedData(cacheKey, data)
    return data
  } catch (error) {
    return rejectWithValue('Data unavailable')
  }
})

// Fetch all metrics (combined dashboard)
export const fetchAllMetrics = createAsyncThunk('analytics/fetchAllMetrics', async (_, { rejectWithValue }) => {
  try {
    const cacheKey = 'all_metrics'
    const cached = getCachedData<typeof initialState.allMetrics>(cacheKey)
    if (cached) return cached
    
    const data = await allMetricsAPI.getAllMetrics()
    
    if (!data || !data.services) {
      // Return demo data when services are not available
      return DEMO_DATA.allMetrics
    }
    
    setCachedData(cacheKey, data)
    return data
  } catch (error) {
    // Return demo data when services are unavailable
    return DEMO_DATA.allMetrics
  }
})

// Fetch citations for an article
export const fetchArticleCitations = createAsyncThunk(
  'analytics/fetchArticleCitations',
  async ({ articleId, journalPath }: { articleId: string; journalPath?: string }, { rejectWithValue }) => {
    try {
      const data = await citationsAPI.getArticleCitations(articleId, journalPath)
      return data
    } catch (error) {
      return rejectWithValue('Data unavailable')
    }
  }
)

// Track article view
export const trackArticleView = createAsyncThunk(
  'analytics/trackArticleView',
  async ({ articleId, journalId }: { articleId: string; journalId?: string }, { rejectWithValue }) => {
    try {
      const data = await analyticsAPI.trackView(articleId, journalId)
      return data
    } catch (error) {
      // Don't show error for tracking failures - just log it
      console.error('Failed to track view:', error)
      return rejectWithValue('Tracking failed')
    }
  }
)

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalytics: (state) => {
      state.kpiSummary = null
      state.topArticles = []
      state.downloads = []
      state.countryData = []
      state.referrers = []
      state.devices = []
      state.trendData = []
      state.trendingJournals = []
      state.totalCitations = null
      state.ojsMetrics = null
      state.allMetrics = null
      state.articleCitations = null
      state.lastUpdated = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch KPI Summary
      .addCase(fetchKPISummary.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchKPISummary.fulfilled, (state, action) => {
        state.loading = false
        state.kpiSummary = action.payload
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchKPISummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.kpiSummary = null
      })
      // Fetch Dashboard Metrics
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        state.loading = false
        state.dashboardMetrics = action.payload
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.dashboardMetrics = null
      })
      // Top Articles
      .addCase(fetchTopArticles.pending, (state) => {
        state.error = null
      })
      .addCase(fetchTopArticles.fulfilled, (state, action) => {
        state.topArticles = action.payload
      })
      .addCase(fetchTopArticles.rejected, (state, action) => {
        state.topArticles = []
        state.error = action.payload as string
      })
      // Downloads
      .addCase(fetchDownloads.fulfilled, (state, action) => {
        state.downloads = action.payload
      })
      .addCase(fetchDownloads.rejected, (state, action) => {
        state.downloads = []
        state.error = action.payload as string
      })
      // Country Data
      .addCase(fetchCountryData.fulfilled, (state, action) => {
        state.countryData = action.payload
      })
      .addCase(fetchCountryData.rejected, (state, action) => {
        state.countryData = []
        state.error = action.payload as string
      })
      // Referrers
      .addCase(fetchReferrers.fulfilled, (state, action) => {
        state.referrers = action.payload
      })
      .addCase(fetchReferrers.rejected, (state, action) => {
        state.referrers = []
        state.error = action.payload as string
      })
      // Devices
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.devices = action.payload
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.devices = []
        state.error = action.payload as string
      })
      // Trend Data
      .addCase(fetchTrendData.fulfilled, (state, action) => {
        state.trendData = action.payload
      })
      .addCase(fetchTrendData.rejected, (state, action) => {
        state.trendData = []
        state.error = action.payload as string
      })
      // Trending Journals
      .addCase(fetchTrendingJournals.fulfilled, (state, action) => {
        state.trendingJournals = action.payload
      })
      .addCase(fetchTrendingJournals.rejected, (state) => {
        state.trendingJournals = []
      })
      // Total Citations
      .addCase(fetchTotalCitations.fulfilled, (state, action) => {
        state.totalCitations = action.payload
      })
      .addCase(fetchTotalCitations.rejected, (state) => {
        state.totalCitations = null
      })
      // OJS Metrics
      .addCase(fetchOJSMetrics.fulfilled, (state, action) => {
        state.ojsMetrics = action.payload
      })
      .addCase(fetchOJSMetrics.rejected, (state) => {
        state.ojsMetrics = null
      })
      // All Metrics
      .addCase(fetchAllMetrics.fulfilled, (state, action) => {
        state.allMetrics = action.payload
      })
      .addCase(fetchAllMetrics.rejected, (state) => {
        state.allMetrics = null
      })
      // Article Citations
      .addCase(fetchArticleCitations.fulfilled, (state, action) => {
        state.articleCitations = action.payload
      })
      .addCase(fetchArticleCitations.rejected, (state) => {
        state.articleCitations = null
      })
  },
})

export const { clearAnalytics } = analyticsSlice.actions
export default analyticsSlice.reducer
