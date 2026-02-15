import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../store'
import { fetchTrendingJournals, fetchTopArticles } from '../store/slices/analyticsSlice'

const AnalyticsOverlay = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const { topArticles: realtimeTopArticles, topJournals, recentEvents } = useSelector((state: RootState) => state.realtime)
  const { trendingJournals, topArticles: analyticsTopArticles } = useSelector((state: RootState) => state.analytics)

  // Use analytics data if available, fallback to realtime data
  const displayTopArticles = analyticsTopArticles.length > 0 ? analyticsTopArticles : realtimeTopArticles
  const displayTrendingJournals = trendingJournals.length > 0 ? trendingJournals : topJournals

  useEffect(() => {
    dispatch(fetchTrendingJournals())
    dispatch(fetchTopArticles())
  }, [dispatch])

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-0 top-1/2 transform -translate-y-1/2 bg-udsm-primary text-white px-3 py-4 rounded-l-lg shadow-lg z-40 transition-all ${
          isOpen ? 'translate-x-full' : ''
        }`}
        aria-label="Toggle Analytics Panel"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </button>

      {/* Side panel */}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="font-serif font-bold text-lg text-udsm-primary">Analytics Overview</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="Close panel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Top Articles */}
          <section>
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Trending Articles
            </h3>
            <div className="space-y-2">
              {displayTopArticles.length > 0 ? (
                displayTopArticles.slice(0, 5).map((article: { label?: string; title?: string; nb_hits?: number; views?: number }, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                      <span className="text-sm truncate max-w-[200px]">{article.label || article.title}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      <span>{(article.nb_hits || article.views || 0).toLocaleString()} views</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">No data available</p>
              )}
            </div>
          </section>

          {/* Top Journals */}
          <section>
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Top Journals
            </h3>
            <div className="space-y-2">
              {displayTrendingJournals.length > 0 ? (
                displayTrendingJournals.slice(0, 5).map((journal: { id?: number; name: string; views?: number }, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                      <span className="text-sm truncate max-w-[200px]">{journal.name}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      <span>{(journal.views || 0).toLocaleString()} views</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">No data available</p>
              )}
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Activity
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentEvents.length > 0 ? (
                recentEvents.slice(0, 10).map((event, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                    <span className={`px-1.5 py-0.5 rounded ${
                      event.type === 'view' ? 'bg-blue-100 text-blue-700' :
                      event.type === 'download' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {event.type}
                    </span>
                    <span className="text-gray-500">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                    {event.country && (
                      <span className="text-gray-400">{event.country}</span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">No recent activity</p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

export default AnalyticsOverlay
