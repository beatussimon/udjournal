import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RealtimeEvent, RealtimeStats, TrendingArticle, TrendingJournal, GeoHotspot } from '../../types'

interface RealtimeState {
  connected: boolean
  activeVisitors: number
  viewsToday: number
  downloadsToday: number
  topArticles: TrendingArticle[]
  topJournals: TrendingJournal[]
  geoHotspots: GeoHotspot[]
  recentEvents: RealtimeEvent[]
}

const initialState: RealtimeState = {
  connected: false,
  activeVisitors: 0,
  viewsToday: 0,
  downloadsToday: 0,
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
    incrementViews: (state) => {
      state.viewsToday += 1
    },
    incrementDownloads: (state) => {
      state.downloadsToday += 1
    },
    clearRealtime: (state) => {
      state.activeVisitors = 0
      state.viewsToday = 0
      state.downloadsToday = 0
      state.topArticles = []
      state.topJournals = []
      state.geoHotspots = []
      state.recentEvents = []
    },
  },
})

export const {
  setConnectionStatus,
  updateStats,
  updateTopArticles,
  updateTopJournals,
  updateGeoHotspots,
  addEvent,
  incrementViews,
  incrementDownloads,
  clearRealtime,
} = realtimeSlice.actions

export default realtimeSlice.reducer
