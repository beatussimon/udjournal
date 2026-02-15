import React, { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import {
  setConnectionStatus,
  updateStats,
  updateTopArticles,
  updateTopJournals,
  updateGeoHotspots,
  addEvent,
} from '../store/slices/realtimeSlice'
import { RealtimeEvent, TrendingArticle, TrendingJournal, GeoHotspot } from '../types'

// Demo data for fallback - matching the actual types
const DEMO_DATA = {
  activeVisitors: 24,
  viewsToday: 1847,
  downloadsToday: 423,
  topArticles: [
    { id: 1, title: 'Impact of Climate Change on Agriculture', views: 156, downloads: 45, trend: 'up' as const, trendPercentage: 12 },
    { id: 2, title: 'Machine Learning in Healthcare', views: 134, downloads: 38, trend: 'up' as const, trendPercentage: 8 },
    { id: 3, title: 'Sustainable Development in Africa', views: 98, downloads: 28, trend: 'stable' as const, trendPercentage: 0 },
  ] as TrendingArticle[],
  topJournals: [
    { id: 1, name: 'Journal of Agricultural Science', views: 234, downloads: 67, submissions: 12, trend: 'up' as const, trendPercentage: 15 },
    { id: 2, name: 'East African Medical Journal', views: 187, downloads: 54, submissions: 8, trend: 'stable' as const, trendPercentage: 0 },
  ] as TrendingJournal[],
  geoHotspots: [
    { country: 'Tanzania', visits: 450, views: 520, latitude: -6.7924, longitude: 39.2083 },
    { country: 'Kenya', visits: 234, views: 287, latitude: -1.2921, longitude: 36.8219 },
    { country: 'Uganda', visits: 156, views: 178, latitude: 0.3476, longitude: 32.5825 },
  ] as GeoHotspot[],
}

const PROXY_BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL || 'http://localhost:8000'

interface RealTimeContextType {
  isConnected: boolean
  subscribe: (channel: string) => void
  unsubscribe: (channel: string) => void
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(undefined)

export const useRealTime = () => {
  const context = useContext(RealTimeContext)
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider')
  }
  return context
}

interface RealTimeProviderProps {
  children: React.ReactNode
}

export const RealTimeProvider: React.FC<RealTimeProviderProps> = ({ children }) => {
  const dispatch = useDispatch()
  const realtimeState = useSelector((state: RootState) => state.realtime) as { connected: boolean; activeVisitors: number; viewsToday: number; downloadsToday: number }
  const connected = realtimeState.connected
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Connect to WebSocket or SSE
  const connect = useCallback(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

    // Try WebSocket first
    try {
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        console.log('WebSocket connected')
        dispatch(setConnectionStatus(true))
      }

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleRealtimeMessage(data)
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e)
        }
      }

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected')
        dispatch(setConnectionStatus(false))
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 5000)
      }

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        // Fall back to polling if WebSocket fails
        startPolling()
      }
    } catch (error) {
      // Fall back to polling
      startPolling()
    }
  }, [dispatch])

  // Polling fallback - uses the secure proxy with demo data fallback
  const startPolling = useCallback(() => {
    console.log('Starting polling fallback for real-time data')
    
    // Poll for live visits every 30 seconds
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `${PROXY_BASE_URL}/api/realtime?maxRows=10`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          }
        )
        
        if (!response.ok) {
          throw new Error(`Proxy returned ${response.status}`)
        }
        
        const data = await response.json()
        
        if (Array.isArray(data)) {
          // Update active visitors count
          dispatch(updateStats({
            activeVisitors: data.length,
          }))

          // Extract events from visits - but DON'T increment client-side counters
          // Just display the data from the server
          data.slice(0, 5).forEach((visit: { actions?: { type: string }[] }) => {
            visit.actions?.forEach((action: { type: string }) => {
              if (action.type === 'action' || action.type === 'download') {
                const event: RealtimeEvent = {
                  type: action.type === 'download' ? 'download' : 'view',
                  timestamp: new Date().toISOString(),
                }
                dispatch(addEvent(event))
              }
            })
          })
        }
      } catch (error) {
        console.log('Using demo data - backend unavailable')
        // Use demo data when backend is unavailable
        dispatch(updateStats({
          activeVisitors: DEMO_DATA.activeVisitors,
          viewsToday: DEMO_DATA.viewsToday,
          downloadsToday: DEMO_DATA.downloadsToday,
        }))
        dispatch(updateTopArticles(DEMO_DATA.topArticles))
        dispatch(updateTopJournals(DEMO_DATA.topJournals))
        dispatch(updateGeoHotspots(DEMO_DATA.geoHotspots))
      }
    }, 30000)
    
    // Initial data load
    dispatch(updateStats({
      activeVisitors: DEMO_DATA.activeVisitors,
      viewsToday: DEMO_DATA.viewsToday,
      downloadsToday: DEMO_DATA.downloadsToday,
    }))
    dispatch(updateTopArticles(DEMO_DATA.topArticles))
    dispatch(updateTopJournals(DEMO_DATA.topJournals))
    dispatch(updateGeoHotspots(DEMO_DATA.geoHotspots))
  }, [dispatch])

  // Handle incoming real-time messages from WebSocket
  const handleRealtimeMessage = (data: {
    type?: string
    event?: string
    stats?: {
      activeVisitors: number
      viewsToday: number
      downloadsToday: number
    }
    topArticles?: TrendingArticle[]
    topJournals?: TrendingJournal[]
    geoHotspots?: GeoHotspot[]
  }) => {
    if (data.type === 'stats' && data.stats) {
      dispatch(updateStats(data.stats))
    }

    if (data.type === 'topArticles' && data.topArticles) {
      dispatch(updateTopArticles(data.topArticles))
    }

    if (data.type === 'topJournals' && data.topJournals) {
      dispatch(updateTopJournals(data.topJournals))
    }

    if (data.type === 'geoHotspots' && data.geoHotspots) {
      dispatch(updateGeoHotspots(data.geoHotspots))
    }

    if (data.event) {
      const eventData = JSON.parse(data.event) as RealtimeEvent
      dispatch(addEvent(eventData))
      // NOTE: We do NOT call incrementViews or incrementDownloads here
      // Real-time data should come from verified Matomo events
    }
  }

  // Subscribe to a channel
  const subscribe = useCallback((channel: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'subscribe', channel }))
    }
  }, [])

  // Unsubscribe from a channel
  const unsubscribe = useCallback((channel: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'unsubscribe', channel }))
    }
  }, [])

  // Clean up on unmount
  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
    }
  }, [])

  // Connect on mount
  useEffect(() => {
    connect()

    return () => {
      cleanup()
    }
  }, [connect, cleanup])

  return (
    <RealTimeContext.Provider value={{ isConnected: connected, subscribe, unsubscribe }}>
      {children}
    </RealTimeContext.Provider>
  )
}
