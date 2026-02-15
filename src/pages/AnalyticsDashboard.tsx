import { useEffect } from 'react'
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
} from '../store/slices/analyticsSlice'

const AnalyticsDashboard = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { kpiSummary, topArticles, downloads, countryData, referrers, devices, trendData, loading } = 
    useSelector((state: RootState) => state.analytics)

  useEffect(() => {
    dispatch(fetchKPISummary())
    dispatch(fetchTopArticles())
    dispatch(fetchDownloads())
    dispatch(fetchCountryData())
    dispatch(fetchReferrers())
    dispatch(fetchDevices())
    dispatch(fetchTrendData())
  }, [dispatch])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif font-bold text-udsm-dark mb-8">Analytics Dashboard</h1>

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
          <div className="text-sm text-gray-500 mb-1">Bounce Rate</div>
          <div className="text-2xl font-bold text-udsm-primary">
            {kpiSummary?.bounce_rate?.toFixed(1) || '0'}%
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
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-udsm-dark mb-4">Geographic Distribution</h2>
          <div className="space-y-3">
            {countryData.slice(0, 5).map((item: unknown, index: number) => {
              const c = item as { country: string; nb_visits: number }
              return (
                <div key={index} className="flex justify-between items-center border-b pb-2">
                  <span>{c.country}</span>
                  <span className="text-gray-500">{c.nb_visits?.toLocaleString()}</span>
                </div>
              )
            })}
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
