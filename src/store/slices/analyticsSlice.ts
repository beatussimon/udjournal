import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { matomoAPI, getCachedData, setCachedData } from '../../services/api'
import { MatomoKPIMetrics } from '../../types/analytics'
import { DashboardMetrics } from '../../types'

// Sample dashboard metrics for demo - used as fallback when Matomo is unavailable
const sampleDashboardMetrics: DashboardMetrics = {
  totalViews: 156420,
  totalDownloads: 34560,
  totalCitations: 12847,
  activeUsers: 234,
  viewsTrend: 12.5,
  downloadsTrend: 8.3,
  citationsTrend: 15.2,
  usersTrend: -2.1,
}

interface AnalyticsState {
  kpiSummary: MatomoKPIMetrics | null
  dashboardMetrics: DashboardMetrics | null
  topArticles: { label: string; nb_hits: number }[]
  downloads: { label: string; nb_hits: number }[]
  countryData: { country: string; nb_visits: number }[]
  referrers: { referrer_type: string; nb_visits: number }[]
  devices: { type: string; nb_visits: number }[]
  trendData: { date: string; visits: number }[]
  heatmapData: { day: number; hour: number; value: number }[]
  trendingJournals: { id: number; name: string; views: number; downloads: number; citations: number }[]
  totalCitations: number
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
  heatmapData: [],
  trendingJournals: [],
  totalCitations: 0,
  loading: false,
  error: null,
  lastUpdated: null,
}

export const fetchKPISummary = createAsyncThunk('analytics/fetchKPISummary', async (_, { rejectWithValue }) => {
  try {
    const cacheKey = 'kpi_summary'
    const cached = getCachedData<MatomoKPIMetrics>(cacheKey)
    if (cached) return cached
    
    const data = await matomoAPI.getKPISummary('day', 'today')
    setCachedData(cacheKey, data)
    return data as MatomoKPIMetrics
  } catch (error) {
    return rejectWithValue('Failed to fetch KPI summary')
  }
})

export const fetchDashboardMetrics = createAsyncThunk('analytics/fetchDashboardMetrics', async (_, { rejectWithValue }) => {
  try {
    const cacheKey = 'dashboard_metrics'
    const cached = getCachedData<DashboardMetrics>(cacheKey)
    if (cached) return cached
    
    // Fetch real metrics from Matomo API
    const [visitsData, actionsData, downloadsData] = await Promise.all([
      matomoAPI.getKPISummary('day', 'today'),
      matomoAPI.getKPISummary('month', 'today'),
      matomoAPI.getDownloads('month', 'today'),
    ])
    
    // Calculate total downloads from Matomo data
    const totalDownloads = Array.isArray(downloadsData) 
      ? downloadsData.reduce((sum: number, item: { nb_hits?: number }) => sum + (item.nb_hits || 0), 0)
      : 0
    
    // Build dashboard metrics from real Matomo data
    const dashboardMetrics: DashboardMetrics = {
      totalViews: visitsData.nb_visits || 0,
      totalDownloads: totalDownloads,
      totalCitations: 0, // Citations would need to come from a separate source
      activeUsers: visitsData.nb_uniq_visitors || 0,
      viewsTrend: 0, // Would need historical data to calculate
      downloadsTrend: 0,
      citationsTrend: 0,
      usersTrend: 0,
    }
    
    setCachedData(cacheKey, dashboardMetrics)
    return dashboardMetrics
  } catch (error) {
    // Return sample data as fallback if Matomo is unavailable
    console.warn('Failed to fetch dashboard metrics from Matomo, using fallback data:', error)
    setCachedData(cacheKey, sampleDashboardMetrics)
    return sampleDashboardMetrics
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
    return rejectWithValue('Failed to fetch top articles')
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
    return rejectWithValue('Failed to fetch downloads')
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
    return rejectWithValue('Failed to fetch country data')
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
    return rejectWithValue('Failed to fetch referrers')
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
    return rejectWithValue('Failed to fetch devices')
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
    return rejectWithValue('Failed to fetch trend data')
  }
})

// Fetch heatmap data from Matomo
export const fetchHeatmapData = createAsyncThunk('analytics/fetchHeatmapData', async (_, { rejectWithValue }) => {
  try {
    const cacheKey = 'heatmap_data'
    const cached = getCachedData<{ day: number; hour: number; value: number }[]>(cacheKey)
    if (cached) return cached
    
    const data = await matomoAPI.getHeatmapData()
    setCachedData(cacheKey, data)
    return data
  } catch (error) {
    return rejectWithValue('Failed to fetch heatmap data')
  }
})

// Fetch trending journals from OJS
export const fetchTrendingJournals = createAsyncThunk('analytics/fetchTrendingJournals', async (_, { rejectWithValue }) => {
  try {
    const cacheKey = 'trending_journals'
    const cached = getCachedData<{ id: number; name: string; views: number; downloads: number; citations: number }[]>(cacheKey)
    if (cached) return cached
    
    const data = await matomoAPI.getTrendingJournals()
    setCachedData(cacheKey, data)
    return data
  } catch (error) {
    return rejectWithValue('Failed to fetch trending journals')
  }
})

// Fetch total citations from OJS
export const fetchTotalCitations = createAsyncThunk('analytics/fetchTotalCitations', async (_, { rejectWithValue }) => {
  try {
    const cacheKey = 'total_citations'
    const cached = getCachedData<number>(cacheKey)
    if (cached !== null) return cached
    
    const data = await matomoAPI.getTotalCitations()
    setCachedData(cacheKey, data)
    return data
  } catch (error) {
    return rejectWithValue('Failed to fetch total citations')
  }
})

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
      state.heatmapData = []
      state.trendingJournals = []
      state.totalCitations = 0
      state.lastUpdated = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKPISummary.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchKPISummary.fulfilled, (state, action) => {
        state.loading = false
        state.kpiSummary = action.payload
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchKPISummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        state.loading = false
        state.dashboardMetrics = action.payload
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchTopArticles.fulfilled, (state, action) => {
        state.topArticles = action.payload
      })
      .addCase(fetchDownloads.fulfilled, (state, action) => {
        state.downloads = action.payload
      })
      .addCase(fetchCountryData.fulfilled, (state, action) => {
        state.countryData = action.payload
      })
      .addCase(fetchReferrers.fulfilled, (state, action) => {
        state.referrers = action.payload
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.devices = action.payload
      })
      .addCase(fetchTrendData.fulfilled, (state, action) => {
        state.trendData = action.payload
      })
      .addCase(fetchHeatmapData.fulfilled, (state, action) => {
        state.heatmapData = action.payload
      })
      .addCase(fetchTrendingJournals.fulfilled, (state, action) => {
        state.trendingJournals = action.payload
      })
      .addCase(fetchTotalCitations.fulfilled, (state, action) => {
        state.totalCitations = action.payload
      })
  },
})

export const { clearAnalytics } = analyticsSlice.actions
export default analyticsSlice.reducer
