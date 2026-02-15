import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { AppDispatch, RootState } from '../store'
import { fetchJournals } from '../store/slices/journalsSlice'
import { fetchTopArticles, fetchDashboardMetrics, fetchTrendingJournals, fetchTotalCitations } from '../store/slices/analyticsSlice'

// Helper component to display "Data unavailable" when data is null
const DataUnavailable = () => (
  <span className="text-gray-400 italic">Data unavailable</span>
)

// Helper to format numbers or show unavailable
const formatValue = (value: number | null | undefined, format: 'number' | 'percent' = 'number') => {
  if (value === null || value === undefined) {
    return <DataUnavailable />
  }
  if (format === 'number') {
    return value.toLocaleString()
  }
  return `${value}%`
}

// Real-time Metrics Bar - shows data from Matomo only
const RealTimeMetrics = ({ totalCitations }: { totalCitations: number | null }) => {
  const realtimeState = useSelector((state: RootState) => state.realtime) as {
    activeVisitors: number | null
    viewsToday: number | null
    downloadsToday: number | null
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="analytics-card text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide">Active Now</span>
        </div>
        <div className="analytics-metric">
          {realtimeState.activeVisitors !== null ? realtimeState.activeVisitors.toLocaleString() : <DataUnavailable />}
        </div>
        <div className="analytics-label">Live Users</div>
      </div>
      <div className="analytics-card text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide">Views</span>
        </div>
        <div className="analytics-metric">
          {realtimeState.viewsToday !== null ? realtimeState.viewsToday.toLocaleString() : <DataUnavailable />}
        </div>
        <div className="analytics-label">Today</div>
      </div>
      <div className="analytics-card text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide">Downloads</span>
        </div>
        <div className="analytics-metric">
          {realtimeState.downloadsToday !== null ? realtimeState.downloadsToday.toLocaleString() : <DataUnavailable />}
        </div>
        <div className="analytics-label">Today</div>
      </div>
      <div className="analytics-card text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <svg className="w-4 h-4 text-udsm-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide">Citations</span>
        </div>
        <div className="analytics-metric">
          {totalCitations !== null ? totalCitations.toLocaleString() : <DataUnavailable />}
        </div>
        <div className="analytics-label">Total</div>
      </div>
    </div>
  )
}

// Trending Journals Component - shows data from OJS + Matomo only
const TrendingJournals = ({ journals }: { journals: { id: number; name: string; views: number; downloads: number; citations: number }[] }) => {
  if (journals.length === 0) {
    return (
      <div className="analytics-card">
        <h3 className="font-serif font-bold text-lg text-udsm-primary dark:text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Trending Journals
        </h3>
        <p className="text-gray-500 dark:text-slate-400"><DataUnavailable /></p>
      </div>
    )
  }

  return (
    <div className="analytics-card">
      <h3 className="font-serif font-bold text-lg text-udsm-primary dark:text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        Trending Journals
      </h3>
      <div className="space-y-3">
        {journals.map((journal, index) => (
          <Link
            key={journal.id}
            to={`/journals/${journal.id}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span className="text-lg font-bold text-gray-300 dark:text-slate-500">#{index + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-udsm-dark dark:text-white truncate">{journal.name}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {formatValue(journal.views)} views | {formatValue(journal.downloads)} downloads | {formatValue(journal.citations)} citations
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// Typed selector helper - properly typed
const useTypedSelector = useSelector as <T>(selector: (state: RootState) => T) => T

const HomePage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const journalsState = useTypedSelector(state => state.journals)
  const analyticsState = useTypedSelector(state => state.analytics)

  const { journals, loading: journalsLoading } = journalsState
  const { 
    topArticles, 
    loading: analyticsLoading,
    trendingJournals,
    totalCitations,
    countryData,
    error 
  } = analyticsState

  useEffect(() => {
    dispatch(fetchJournals())
    dispatch(fetchTopArticles())
    dispatch(fetchDashboardMetrics())
    dispatch(fetchTrendingJournals())
    dispatch(fetchTotalCitations())
  }, [dispatch])

  // NO FALLBACK DATA - Show data only if available from APIs
  const geoData = countryData.length > 0 ? countryData.slice(0, 6).map((item: { country: string; nb_visits: number }) => ({
    country: item.country,
    visits: item.nb_visits,
    percentage: Math.round((item.nb_visits / Math.max(countryData.reduce((sum: number, c: { nb_visits: number }) => sum + c.nb_visits, 1), 1)) * 100)
  })) : []

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-udsm-primary via-udsm-secondary to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              UDSM Journals
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              The University of Dar es Salaam's premier open access platform for scholarly research, 
              journals, and academic publications.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/search"
                className="bg-udsm-gold text-udsm-dark px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                Search Repository
              </Link>
              <Link
                to="/submission"
                className="bg-white/10 backdrop-blur px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                Submit Research
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Real-Time Metrics - Embedded everywhere */}
      <section className="bg-white dark:bg-slate-800 py-6 shadow-sm border-b border-gray-200 dark:border-slate-700">
        <div className="container mx-auto px-4">
          <RealTimeMetrics totalCitations={totalCitations} />
        </div>
      </section>

      {/* Analytics Error Message */}
      {error && analyticsLoading === false && (
        <section className="bg-yellow-50 dark:bg-yellow-900/20 py-4 border-b border-yellow-200 dark:border-yellow-800">
          <div className="container mx-auto px-4">
            <p className="text-yellow-800 dark:text-yellow-200 text-center">
              Some analytics data is currently unavailable. Please try again later.
            </p>
          </div>
        </section>
      )}

      {/* Geographic Trends */}
      {geoData.length > 0 && (
        <section className="py-8 bg-gray-50 dark:bg-slate-900">
          <div className="container mx-auto px-4">
            <div className="analytics-card">
              <h3 className="font-serif font-bold text-lg text-udsm-primary dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Geographic Access Trends
              </h3>
              <div className="space-y-3">
                {geoData.map((item: { country: string; percentage: number }) => (
                  <div key={item.country} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 dark:text-slate-300 w-24 truncate">
                      {item.country}
                    </span>
                    <div className="flex-1 h-4 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-udsm-secondary to-udsm-accent rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-udsm-primary dark:text-blue-400 w-16 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Journals with Embedded Metrics */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-serif font-bold text-udsm-dark dark:text-white">Featured Journals</h2>
            <Link to="/journals" className="text-udsm-accent hover:underline">
              View All →
            </Link>
          </div>
          
          {journalsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : journals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {journals.slice(0, 3).map((journal: { id: number; name: string }) => (
                <Link
                  key={journal.id}
                  to={`/journals/${journal.id}`}
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow card-hover p-6"
                >
                  <h3 className="font-serif font-bold text-lg text-udsm-primary dark:text-white mb-2">
                    {journal.name}
                  </h3>
                  <p className="text-gray-600 dark:text-slate-300 text-sm mb-3">
                    Academic research journal covering various disciplines
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8"><DataUnavailable /></p>
          )}
        </div>
      </section>

      {/* Trending Journals with Analytics */}
      <section className="py-8 bg-gray-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TrendingJournals journals={trendingJournals} />
            </div>
            
            {/* Top Articles */}
            <div className="analytics-card">
              <h3 className="font-serif font-bold text-lg text-udsm-primary dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Most Interacted Articles
              </h3>
              <div className="space-y-3">
                {analyticsLoading ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-12 bg-gray-100 dark:bg-slate-700 rounded animate-pulse" />
                  ))
                ) : topArticles.length > 0 ? (
                  topArticles.slice(0, 5).map((article: { label: string; nb_hits: number }, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50">
                      <span className="text-lg font-bold text-gray-300 dark:text-slate-500">#{index + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-udsm-dark dark:text-white text-sm truncate">{article.label}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{article.nb_hits?.toLocaleString()} views</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-slate-400"><DataUnavailable /></p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-udsm-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">Publish with UDSM JOURNALS</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join researchers worldwide who publish their work through UDSM JOURNALS.
            Get your research the visibility it deserves.
          </p>
          <Link
            to="/submission"
            className="bg-udsm-gold text-udsm-dark px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
          >
            Start Submission
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage
