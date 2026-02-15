import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import {
  setConnectionStatus,
  updateStats,
  updateTopArticles,
  updateTopJournals,
  updateGeoHotspots,
  addEvent,
  incrementViews,
  incrementDownloads,
} from '../store/slices/realtimeSlice'
import { RealtimeEvent, TrendingArticle, TrendingJournal, GeoHotspot } from '../types'

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
  const { connected } = useSelector((state: RootState) => state.realtime)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Connect to WebSocket or SSE
  const connect = useCallback(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'

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
        // Fall back to SSE if WebSocket fails
        connectSSE()
      }
    } catch (error) {
      // Fall back to SSE
      connectSSE()
    }
  }, [dispatch])

  // Fallback to Server-Sent Events
  const connectSSE = useCallback(() => {
    const sseUrl = import.meta.env.VITE_MATOMO_BASE_URL?.replace('http', 'http') + '/sse' || 'http://localhost:8888/sse'

    try {
      eventSourceRef.current = new EventSource(sseUrl)

      eventSourceRef.current.onopen = () => {
        console.log('SSE connected')
        dispatch(setConnectionStatus(true))
      }

      eventSourceRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleRealtimeMessage(data)
        } catch (e) {
          console.error('Failed to parse SSE message:', e)
        }
      }

      eventSourceRef.current.onerror = () => {
        console.log('SSE disconnected')
        dispatch(setConnectionStatus(false))
      }
    } catch (error) {
      console.error('Failed to connect to SSE:', error)
    }
  }, [dispatch])

  // Handle incoming real-time messages
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

      if (eventData.type === 'view') {
        dispatch(incrementViews())
      } else if (eventData.type === 'download') {
        dispatch(incrementDownloads())
      }
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

  // Set up periodic polling as a fallback (since local Matomo may not have real-time streaming)
  useEffect(() => {
    // Poll for updates every 30 seconds as fallback
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_MATOMO_BASE_URL}/?module=API&method=Live.getLastVisitsDetails&idSite=${import.meta.env.VITE_MATOMO_SITE_ID}&format=JSON&token_auth=${import.meta.env.VITE_MATOMO_API_TOKEN}`,
          {
            method: 'POST',
          }
        )
        const data = await response.json()
        
        if (Array.isArray(data)) {
          // Update active visitors count
          dispatch(updateStats({
            activeVisitors: data.length,
          }))

          // Extract events from visits
          data.slice(0, 5).forEach((visit: { actions: { type: string }[] }) => {
            visit.actions?.forEach((action: { type: string }) => {
              if (action.type === 'action' || action.type === 'download') {
                const event: RealtimeEvent = {
                  type: action.type === 'download' ? 'download' : 'view',
                  timestamp: new Date().toISOString(),
                }
                dispatch(addEvent(event))
                
                if (event.type === 'view') {
                  dispatch(incrementViews())
                } else if (event.type === 'download') {
                  dispatch(incrementDownloads())
                }
              }
            })
          })
        }
      } catch (error) {
        console.error('Failed to poll for real-time updates:', error)
      }
    }, 30000)

    return () => clearInterval(pollInterval)
  }, [dispatch])

  // Connect on mount
  useEffect(() => {
    connect()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [connect])

  return (
    <RealTimeContext.Provider value={{ isConnected: connected, subscribe, unsubscribe }}>
      {children}
    </RealTimeContext.Provider>
  )
}
