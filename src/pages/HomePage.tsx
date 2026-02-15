import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { AppDispatch, RootState } from '../store'
import { fetchJournals } from '../store/slices/journalsSlice'
import { fetchTopArticles, fetchDashboardMetrics, fetchHeatmapData, fetchTrendingJournals, fetchTotalCitations } from '../store/slices/analyticsSlice'

// Embedded Analytics Heatmap Component
const AnalyticsHeatmap = ({ data }: { data: { day: number; hour: number; value: number }[] }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const hours = Array.from({ length: 24 }, (_, i) => i)
  
  const getHeatColor = (value: number) => {
    if (value === 0) return 'bg-gray-100 dark:bg-slate-700'
    if (value < 20) return 'bg-blue-200 dark:bg-blue-900'
    if (value < 40) return 'bg-blue-400 dark:bg-blue-700'
    if (value < 60) return 'bg-blue-600 dark:bg-blue-500'
    return 'bg-udsm-primary dark:bg-blue-400'
  }

  return (
    <div className="analytics-card">
      <h3 className="font-serif font-bold text-lg text-udsm-primary dark:text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        User Engagement Heatmap
      </h3>
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="flex gap-1 mb-1">
            <div className="w-10"></div>
            {hours.filter((_, i) => i % 3 === 0).map(hour => (
              <div key={hour} className="flex-1 text-xs text-center text-gray-500 dark:text-slate-400">
                {hour}:00
              </div>
            ))}
          </div>
          {days.map((day, dayIndex) => (
            <div key={day} className="flex gap-1 mb-1">
              <div className="w-10 text-xs text-gray-500 dark:text-slate-400 flex items-center">{day}</div>
              {hours.map(hour => {
                const cellData = data.find(d => d.day === dayIndex && d.hour === hour)
                const value = cellData?.value ?? 0
                return (
                  <div
                    key={`${dayIndex}-${hour}`}
                    className={`flex-1 h-6 rounded-sm ${getHeatColor(value)} transition-all hover:ring-2 ring-udsm-accent`}
                    title={`${day} ${hour}:00 - ${value} views`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-3 text-xs text-gray-500 dark:text-slate-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded-sm bg-gray-100 dark:bg-slate-700"></div>
          <div className="w-4 h-4 rounded-sm bg-blue-200 dark:bg-blue-900"></div>
          <div className="w-4 h-4 rounded-sm bg-blue-400 dark:bg-blue-700"></div>
          <div className="w-4 h-4 rounded-sm bg-blue-600 dark:bg-blue-500"></div>
          <div className="w-4 h-4 rounded-sm bg-udsm-primary dark:bg-blue-400"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  )
}

// Geographic Distribution Component
const GeoDistribution = ({ data }: { data: { country: string; visits: number; percentage: number }[] }) => {
  return (
    <div className="analytics-card">
      <h3 className="font-serif font-bold text-lg text-udsm-primary dark:text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Geographic Access Trends
      </h3>
      <div className="space-y-3">
        {data.map((item, index) => (
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
  )
}

// Real-time Metrics Bar
const RealTimeMetrics = ({ totalCitations }: { totalCitations: number }) => {
  const { activeVisitors = 0, viewsToday = 0, downloadsToday = 0 } = useSelector((state: RootState) => state.realtime)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="analytics-card text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide">Active Now</span>
        </div>
        <div className="analytics-metric">{activeVisitors.toLocaleString()}</div>
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
        <div className="analytics-metric">{viewsToday.toLocaleString()}</div>
        <div className="analytics-label">Today</div>
      </div>
      <div className="analytics-card text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide">Downloads</span>
        </div>
        <div className="analytics-metric">{downloadsToday.toLocaleString()}</div>
        <div className="analytics-label">Today</div>
      </div>
      <div className="analytics-card text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <svg className="w-4 h-4 text-udsm-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide">Citations</span>
        </div>
        <div className="analytics-metric">{totalCitations > 0 ? totalCitations.toLocaleString() : 'Loading...'}</div>
        <div className="analytics-label">Total</div>
      </div>
    </div>
  )
}

// Trending Journals Component
const TrendingJournals = ({ journals }: { journals: { id: number; name: string; views: number; downloads: number; citations: number }[] }) => {
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
                {journal.views.toLocaleString()} views | {journal.downloads.toLocaleString()} downloads | {journal.citations} citations
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

const HomePage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { journals, loading: journalsLoading } = useSelector((state: RootState) => state.journals)
  const { 
    kpiSummary, 
    topArticles, 
    loading: analyticsLoading,
    heatmapData,
    trendingJournals,
    totalCitations,
    countryData 
  } = useSelector((state: RootState) => state.analytics)
  const realtime = useSelector((state: RootState) => state.realtime)

  useEffect(() => {
    dispatch(fetchJournals())
    dispatch(fetchTopArticles())
    dispatch(fetchDashboardMetrics())
    dispatch(fetchHeatmapData())
    dispatch(fetchTrendingJournals())
    dispatch(fetchTotalCitations())
  }, [dispatch])

  // Use real heatmap data from API, fallback to empty if not loaded
  const displayHeatmapData = heatmapData.length > 0 ? heatmapData : Array.from({ length: 7 * 24 }, (_, i) => ({
    day: Math.floor(i / 24),
    hour: i % 24,
    value: 0
  }))

  // Transform country data for geo distribution
  const geoData = countryData.length > 0 ? countryData.slice(0, 6).map(item => ({
    country: item.country,
    visits: item.nb_visits,
    percentage: Math.round((item.nb_visits / Math.max(countryData.reduce((sum, c) => sum + c.nb_visits, 1), 1)) * 100)
  })) : [
    { country: 'Tanzania', visits: 0, percentage: 0 },
    { country: 'Kenya', visits: 0, percentage: 0 },
    { country: 'United States', visits: 0, percentage: 0 },
    { country: 'Uganda', visits: 0, percentage: 0 },
    { country: 'Nigeria', visits: 0, percentage: 0 },
    { country: 'Others', visits: 0, percentage: 0 },
  ]

  // Use trending journals from API, fallback to empty if not loaded
  const displayTrendingJournals = trendingJournals.length > 0 ? trendingJournals : []

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

      {/* Analytics Heatmap & Geo Trends */}
      <section className="py-8 bg-gray-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsHeatmap data={displayHeatmapData} />
            <GeoDistribution data={geoData} />
          </div>
        </div>
      </section>

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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trendingJournals.map((journal) => (
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
                  {/* Embedded Metrics - Academic & Conservative */}
                  <div className="pt-3 border-t border-gray-100 dark:border-slate-700">
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      <span className="font-semibold text-udsm-primary dark:text-blue-400">{journal.views.toLocaleString()}</span> Views |{' '}
                      <span className="font-semibold text-udsm-primary dark:text-blue-400">{journal.downloads.toLocaleString()}</span> Downloads |{' '}
                      <span className="font-semibold text-udsm-gold">{journal.citations}</span> Citations
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trending Journals with More Analytics */}
      <section className="py-8 bg-gray-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TrendingJournals journals={displayTrendingJournals.length > 0 ? displayTrendingJournals : [
                { id: 1, name: 'Journal of African Studies', views: 0, downloads: 0, citations: 0 },
                { id: 2, name: 'East African Medical Journal', views: 0, downloads: 0, citations: 0 },
                { id: 3, name: 'Tanzania Journal of Science', views: 0, downloads: 0, citations: 0 },
                { id: 4, name: 'Journal of Education', views: 0, downloads: 0, citations: 0 },
              ]} />
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
                ) : (
                  topArticles.slice(0, 5).map((article: unknown, index: number) => {
                    const a = article as { label: string; nb_hits: number }
                    return (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50">
                        <span className="text-lg font-bold text-gray-300 dark:text-slate-500">#{index + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-udsm-dark dark:text-white text-sm truncate">{a.label}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{a.nb_hits?.toLocaleString()} views</p>
                        </div>
                      </div>
                    )
                  })
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
