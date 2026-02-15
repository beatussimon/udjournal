import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store'
import {
  fetchKPISummary,
  fetchTopArticles,
  fetchDownloads,
  fetchCountryData,
  fetchReferrers,
  fetchDevices,
  fetchTrendData,
  fetchOJSMetrics,
  fetchAllMetrics,
  fetchTotalCitations,
} from '../store/slices/analyticsSlice'
import { fetchLiveMetrics } from '../store/slices/realtimeSlice'

const AnalyticsDashboard = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const { 
    kpiSummary, 
    topArticles, 
    downloads, 
    countryData, 
    referrers, 
    devices, 
    trendData, 
    loading,
    ojsMetrics,
    allMetrics,
  } = useSelector((state: RootState) => state.analytics)

  // Fetch data and set up auto-refresh
  const fetchData = () => {
    dispatch(fetchKPISummary())
    dispatch(fetchTopArticles())
    dispatch(fetchDownloads())
    dispatch(fetchCountryData())
    dispatch(fetchReferrers())
    dispatch(fetchDevices())
    dispatch(fetchTrendData())
    dispatch(fetchOJSMetrics())
    dispatch(fetchTotalCitations())
    dispatch(fetchAllMetrics())
    dispatch(fetchLiveMetrics())
    setLastUpdated(new Date())
  }

  useEffect(() => {
    // Initial fetch
    fetchData()
    
    // Auto-refresh every 30 seconds for real-time data
    const interval = setInterval(fetchData, 30000)
    
    return () => clearInterval(interval)
  }, [dispatch])

  // Calculate totals from data
  const totalArticles = ojsMetrics?.total_articles || 0
  const totalJournals = ojsMetrics?.total_journals || 0
  const totalIssues = ojsMetrics?.total_issues || 0
  const totalCountries = countryData.length
  const totalVisits = kpiSummary?.nb_visits || 0
  const totalUniqueVisitors = kpiSummary?.nb_uniq_visitors || 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-bold text-udsm-dark">Analytics Dashboard</h1>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button 
            onClick={fetchData}
            className="text-sm text-udsm-primary hover:underline flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${allMetrics?.services?.ojs_configured ? 'bg-green-400' : 'bg-red-400'}`}></span>
            <span className="text-sm text-gray-500">OJS</span>
            <span className={`w-2 h-2 rounded-full ${allMetrics?.services?.matomo_configured ? 'bg-green-400' : 'bg-red-400'}`}></span>
            <span className="text-sm text-gray-500">Matomo</span>
            <span className={`w-2 h-2 rounded-full ${allMetrics?.services?.citations_configured ? 'bg-green-400' : 'bg-red-400'}`}></span>
            <span className="text-sm text-gray-500">Citations</span>
          </div>
        </div>
      </div>

      {/* OJS Platform Metrics */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Platform Overview (OJS)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl font-bold">{totalJournals}</div>
            <div className="text-sm text-white/80">Journals</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl font-bold">{totalArticles.toLocaleString()}</div>
            <div className="text-sm text-white/80">Articles</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl font-bold">{totalIssues.toLocaleString()}</div>
            <div className="text-sm text-white/80">Issues</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl font-bold">{kpiSummary?.nb_uniq_visitors?.toLocaleString() || '0'}</div>
            <div className="text-sm text-white/80">Visitors</div>
          </div>
        </div>
        
        {/* Journals List */}
        {ojsMetrics?.journals && ojsMetrics.journals.length > 0 && (
          <div className="mt-4 bg-white/10 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">Journals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {ojsMetrics.journals.map((journal: { path: string; total_articles: number; total_issues: number }, idx: number) => (
                <div key={idx} className="flex justify-between items-center bg-white/5 rounded px-3 py-2">
                  <span className="text-sm">{journal.path}</span>
                  <div className="text-xs text-white/70">
                    {journal.total_articles} articles • {journal.total_issues} issues
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

        {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-500 mb-1">Total Visits</div>
          <div className="text-2xl font-bold text-udsm-primary">
            {kpiSummary?.nb_visits?.toLocaleString() || '0'}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-500 mb-1">Unique Visitors</div>
          <div className="text-2xl font-bold text-udsm-primary">
            {kpiSummary?.nb_uniq_visitors?.toLocaleString() || '0'}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-500 mb-1">Total Actions</div>
          <div className="text-2xl font-bold text-udsm-primary">
            {kpiSummary?.nb_actions?.toLocaleString() || '0'}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-500 mb-1">Countries Reached</div>
          <div className="text-2xl font-bold text-udsm-primary">
            {totalCountries}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Articles */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-udsm-dark mb-4">Top Articles</h2>
          <div className="space-y-3">
            {topArticles.slice(0, 5).map((article: unknown, index: number) => {
              const a = article as { label: string; nb_hits: number }
              return (
                <div key={index} className="flex justify-between items-center border-b pb-2">
                  <span className="truncate flex-1">{a.label}</span>
                  <span className="text-gray-500 ml-4">{a.nb_hits?.toLocaleString()}</span>
                </div>
              )
            })}
            {topArticles.length === 0 && (
              <div className="text-gray-400 text-center py-4">No data available</div>
            )}
          </div>
        </div>

        {/* Downloads */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-udsm-dark mb-4">Downloads</h2>
          <div className="space-y-3">
            {downloads.slice(0, 5).map((item: unknown, index: number) => {
              const d = item as { label: string; nb_hits: number }
              return (
                <div key={index} className="flex justify-between items-center border-b pb-2">
                  <span className="truncate flex-1">{d.label}</span>
                  <span className="text-gray-500 ml-4">{d.nb_hits?.toLocaleString()}</span>
                </div>
              )
            })}
            {downloads.length === 0 && (
              <div className="text-gray-400 text-center py-4">No data available</div>
            )}
          </div>
        </div>

        {/* Geographic Distribution with Heatmap */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-udsm-dark">Geographic Distribution</h2>
            <span className="text-sm bg-udsm-primary/10 text-udsm-primary px-2 py-1 rounded">
              {totalCountries} Countries
            </span>
          </div>
          
          {/* Simple Heatmap Visualization */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Visitor Heatmap by Country</p>
            <div className="flex flex-wrap gap-1">
              {countryData.slice(0, 10).map((item: unknown, index: number) => {
                const c = item as { country: string; nb_visits: number }
                const maxVisits = countryData[0] ? (countryData[0] as { nb_visits: number }).nb_visits : 1
                const intensity = Math.max(0.2, (c.nb_visits || 1) / maxVisits)
                return (
                  <div 
                    key={index}
                    className="px-2 py-1 text-xs rounded cursor-default transition-transform hover:scale-105"
                    style={{ 
                      backgroundColor: `rgba(79, 70, 229, ${intensity})`,
                      color: intensity > 0.5 ? 'white' : 'inherit'
                    }}
                    title={`${c.country}: ${c.nb_visits?.toLocaleString()} visits`}
                  >
                    {c.country.substring(0, 3).toUpperCase()}
                  </div>
                )
              })}
            </div>
          </div>
          
          <div className="space-y-3">
            {countryData.slice(0, 5).map((item: unknown, index: number) => {
              const c = item as { country: string; nb_visits: number }
              const percentage = totalVisits > 0 ? ((c.nb_visits || 0) / totalVisits * 100).toFixed(1) : '0'
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-udsm-dark">{c.country}</span>
                      <span className="text-gray-500">{c.nb_visits?.toLocaleString()} ({percentage}%)</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-udsm-primary to-udsm-secondary rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
            {countryData.length === 0 && (
              <div className="text-gray-400 text-center py-4">No data available</div>
            )}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-udsm-dark mb-4">Traffic Sources</h2>
          <div className="space-y-3">
            {referrers.slice(0, 5).map((item: unknown, index: number) => {
              const r = item as { referrer_type: string; nb_visits: number }
              return (
                <div key={index} className="flex justify-between items-center border-b pb-2">
                  <span>{r.referrer_type}</span>
                  <span className="text-gray-500">{r.nb_visits?.toLocaleString()}</span>
                </div>
              )
            })}
            {referrers.length === 0 && (
              <div className="text-gray-400 text-center py-4">No data available</div>
            )}
          </div>
        </div>

        {/* Devices */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-udsm-dark mb-4">Devices</h2>
          <div className="space-y-3">
            {devices.slice(0, 5).map((item: unknown, index: number) => {
              const d = item as { type: string; nb_visits: number }
              return (
                <div key={index} className="flex justify-between items-center border-b pb-2">
                  <span className="capitalize">{d.type}</span>
                  <span className="text-gray-500">{d.nb_visits?.toLocaleString()}</span>
                </div>
              )
            })}
            {devices.length === 0 && (
              <div className="text-gray-400 text-center py-4">No data available</div>
            )}
          </div>
        </div>

        {/* Trend Data */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-udsm-dark mb-4">Visit Trends (Last 30 Days)</h2>
          <div className="space-y-3">
            {trendData.slice(0, 7).map((item: unknown, index: number) => {
              const t = item as { date: string; visits: number }
              return (
                <div key={index} className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm">{t.date}</span>
                  <span className="text-gray-500">{t.visits?.toLocaleString()}</span>
                </div>
              )
            })}
            {trendData.length === 0 && (
              <div className="text-gray-400 text-center py-4">No data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
