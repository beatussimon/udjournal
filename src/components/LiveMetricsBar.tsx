import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../store'
import { fetchOJSMetrics, fetchTotalCitations } from '../store/slices/analyticsSlice'
import { fetchLiveMetrics } from '../store/slices/realtimeSlice'

const LiveMetricsBar = () => {
  const dispatch = useDispatch<AppDispatch>()
  const realtime = useSelector((state: RootState) => state.realtime) as {
    activeVisitors: number | null
    viewsToday: number | null
    downloadsToday: number | null
    connected: boolean
  }
  const { ojsMetrics } = useSelector((state: RootState) => state.analytics)
  
  // Convert null to display value
  const activeVisitors = realtime?.activeVisitors ?? null
  const viewsToday = realtime?.viewsToday ?? null
  const downloadsToday = realtime?.downloadsToday ?? null
  const isConnected = realtime?.connected ?? false

  useEffect(() => {
    // Fetch OJS metrics for article and journal counts
    dispatch(fetchOJSMetrics())
    dispatch(fetchTotalCitations())
    // Fetch live metrics from the realtime slice
    dispatch(fetchLiveMetrics())
  }, [dispatch])

  // Helper to display value or unavailable
  const displayValue = (value: number | null) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">--</span>
    }
    return value.toLocaleString()
  }

  return (
    <div className="bg-gradient-to-r from-udsm-primary to-udsm-secondary text-white py-2 px-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
            <span className="text-sm font-medium">Live Metrics</span>
          </div>
          
          <div className="flex items-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-semibold live-counter">{displayValue(activeVisitors)}</span>
              <span className="text-blue-200">Active</span>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="font-semibold live-counter">{displayValue(viewsToday)}</span>
              <span className="text-blue-200">Views</span>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="font-semibold live-counter">{displayValue(downloadsToday)}</span>
              <span className="text-blue-200">Downloads</span>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="font-semibold live-counter">{ojsMetrics?.total_articles?.toLocaleString() || '--'}</span>
              <span className="text-blue-200">Articles</span>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1 2.684a3 3.342m0 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="font-semibold live-counter">{ojsMetrics?.total_journals || '--'}</span>
              <span className="text-blue-200">Journals</span>
            </div>
          </div>
        </div>

        <Link
          to="/analytics"
          className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-colors"
        >
          View Dashboard →
        </Link>
      </div>
    </div>
  )
}

export default LiveMetricsBar
