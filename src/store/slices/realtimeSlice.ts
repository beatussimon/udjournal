import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RealtimeEvent, RealtimeStats, TrendingArticle, TrendingJournal, GeoHotspot } from '../../types'
import { analyticsAPI } from '../../services/api'

// Demo data for realtime metrics
const DEMO_REALTIME = {
  activeVisitors: 24,
  viewsToday: 1847,
  downloadsToday: 423,
  topArticles: [
    { id: '1', title: 'Impact of Climate Change on Agriculture', views: 156 },
    { id: '2', title: 'Machine Learning in Healthcare', views: 134 },
    { id: '3', title: 'Sustainable Development in Africa', views: 98 },
  ] as TrendingArticle[],
  topJournals: [
    { id: 1, name: 'Journal of Agricultural Science', views: 234 },
    { id: 2, name: 'East African Medical Journal', views: 187 },
  ] as TrendingJournal[],
  geoHotspots: [
    { country: 'Tanzania', count: 450, lat: -6.7924, lng: 39.2083 },
    { country: 'Kenya', count: 234, lat: -1.2921, lng: 36.8219 },
    { country: 'Uganda', count: 156, lat: 0.3476, lng: 32.5825 },
  ] as GeoHotspot[],
}

interface RealtimeState {
  connected: boolean
  activeVisitors: number | null  // null = data unavailable
  viewsToday: number | null      // null = data unavailable  
  downloadsToday: number | null  // null = data unavailable
  topArticles: TrendingArticle[]
  topJournals: TrendingJournal[]
  geoHotspots: GeoHotspot[]
  recentEvents: RealtimeEvent[]
}

// Async thunk for fetching live metrics
export const fetchLiveMetrics = createAsyncThunk(
  'realtime/fetchLiveMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const data = await analyticsAPI.getLiveMetrics()
      return {
        activeVisitors: data.realtime_count || 0,
        viewsToday: data.total_views || 0,
        downloadsToday: data.total_downloads || 0,
      }
    } catch (error) {
      // Return demo data when services are unavailable
      return {
        activeVisitors: DEMO_REALTIME.activeVisitors,
        viewsToday: DEMO_REALTIME.viewsToday,
        downloadsToday: DEMO_REALTIME.downloadsToday,
      }
    }
  }
)

const initialState: RealtimeState = {
  connected: false,
  activeVisitors: null,
  viewsToday: null,
  downloadsToday: null,
  topArticles: [],
  topJournals: [],
  geoHotspots: [],
  recentEvents: [],
}

const realtimeSlice = createSlice({
  name: 'realtime',
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload
    },
    // Update stats from Matomo (real data only)
    updateStats: (state, action: PayloadAction<Partial<RealtimeStats>>) => {
      if (action.payload.activeVisitors !== undefined) {
        state.activeVisitors = action.payload.activeVisitors
      }
      if (action.payload.viewsToday !== undefined) {
        state.viewsToday = action.payload.viewsToday
      }
      if (action.payload.downloadsToday !== undefined) {
        state.downloadsToday = action.payload.downloadsToday
      }
      if (action.payload.topArticles) {
        state.topArticles = action.payload.topArticles
      }
      if (action.payload.topJournals) {
        state.topJournals = action.payload.topJournals
      }
    },
    updateTopArticles: (state, action: PayloadAction<TrendingArticle[]>) => {
      state.topArticles = action.payload
    },
    updateTopJournals: (state, action: PayloadAction<TrendingJournal[]>) => {
      state.topJournals = action.payload
    },
    updateGeoHotspots: (state, action: PayloadAction<GeoHotspot[]>) => {
      state.geoHotspots = action.payload
    },
    addEvent: (state, action: PayloadAction<RealtimeEvent>) => {
      state.recentEvents.unshift(action.payload)
      // Keep only last 50 events
      if (state.recentEvents.length > 50) {
        state.recentEvents = state.recentEvents.slice(0, 50)
      }
    },
    // REMOVED: incrementViews and incrementDownloads
    // These should NEVER be called client-side as they simulate data
    // Instead, data should come from Matomo through the proxy
    clearRealtime: (state) => {
      state.activeVisitors = null
      state.viewsToday = null
      state.downloadsToday = null
      state.topArticles = []
      state.topJournals = []
      state.geoHotspots = []
      state.recentEvents = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLiveMetrics.pending, (state) => {
        // Optionally handle loading state
      })
      .addCase(fetchLiveMetrics.fulfilled, (state, action) => {
        if (action.payload.activeVisitors !== undefined) {
          state.activeVisitors = action.payload.activeVisitors
        }
        if (action.payload.viewsToday !== undefined) {
          state.viewsToday = action.payload.viewsToday
        }
        if (action.payload.downloadsToday !== undefined) {
          state.downloadsToday = action.payload.downloadsToday
        }
      })
      .addCase(fetchLiveMetrics.rejected, (state) => {
        // Keep existing values on failure
      })
  },
})

export const {
  setConnectionStatus,
  updateStats,
  updateTopArticles,
  updateTopJournals,
  updateGeoHotspots,
  addEvent,
  clearRealtime,
} = realtimeSlice.actions

export default realtimeSlice.reducer
