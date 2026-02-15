import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store'
import { fetchIssues } from '../store/slices/journalsSlice'

// Journal Analytics Header Component
const JournalAnalyticsHeader = ({ 
  views, 
  downloads, 
  citations, 
  issuesCount, 
  articlesCount 
}: { 
  views: number
  downloads: number
  citations: number
  issuesCount: number
  articlesCount: number
}) => {
  return (
    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-6 mb-8">
      <h2 className="font-serif font-bold text-lg text-udsm-primary dark:text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Journal Analytics
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
          <div className="text-2xl font-bold text-udsm-primary dark:text-blue-400">{views.toLocaleString()}</div>
          <div className="text-xs text-gray-500 dark:text-slate-400">Total Views</div>
        </div>
        <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
          <div className="text-2xl font-bold text-udsm-primary dark:text-blue-400">{downloads.toLocaleString()}</div>
          <div className="text-xs text-gray-500 dark:text-slate-400">Downloads</div>
        </div>
        <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
          <div className="text-2xl font-bold text-udsm-gold">{citations}</div>
          <div className="text-xs text-gray-500 dark:text-slate-400">Citations</div>
        </div>
        <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
          <div className="text-2xl font-bold text-udsm-secondary dark:text-blue-400">{issuesCount}</div>
          <div className="text-xs text-gray-500 dark:text-slate-400">Issues</div>
        </div>
        <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
          <div className="text-2xl font-bold text-udsm-secondary dark:text-blue-400">{articlesCount}</div>
          <div className="text-xs text-gray-500 dark:text-slate-400">Articles</div>
        </div>
      </div>
    </div>
  )
}

// Issue Card with Analytics
const IssueCard = ({ 
  issue, 
  journalPath 
}: { 
  issue: { 
    id: number; 
    title?: string; 
    datePublished?: string; 
    volume?: string; 
    number?: string;
    views?: number;
    downloads?: number;
  }
  journalPath?: string
}) => {
  return (
    <Link
      to={`/journals/${journalPath}/issues/${issue.id}`}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow card-hover p-6"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-sm text-gray-500 dark:text-slate-400">
          Vol. {issue.volume || '-'}, No. {issue.number || '-'}
        </div>
        {issue.datePublished && (
          <span className="text-xs text-gray-400 dark:text-slate-500">
            {new Date(issue.datePublished).toLocaleDateString()}
          </span>
        )}
      </div>
      <h2 className="font-serif font-bold text-udsm-primary dark:text-white mb-2">
        {issue.title || `Issue ${issue.id}`}
      </h2>
      {/* Issue-level analytics */}
      <div className="pt-3 border-t border-gray-100 dark:border-slate-700">
        <p className="text-xs text-gray-500 dark:text-slate-400">
          <span className="font-medium">{(issue.views || 0).toLocaleString()} views</span> |{' '}
          <span className="font-medium">{(issue.downloads || 0).toLocaleString()} downloads</span>
        </p>
      </div>
    </Link>
  )
}

const JournalPage = () => {
  const { journalPath } = useParams<{ journalPath: string }>()
  const dispatch = useDispatch<AppDispatch>()
  const { issues, loading, error } = useSelector((state: RootState) => state.journals)

  useEffect(() => {
    if (journalPath) {
      dispatch(fetchIssues(journalPath))
    }
  }, [dispatch, journalPath])

  // Sample journal data with embedded analytics (in production, fetch from API)
  const journalData = {
    name: journalPath?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Journal',
    description: 'A peer-reviewed academic journal publishing research on African history, culture, politics, and development.',
    views: 12430,
    downloads: 2340,
    citations: 145,
    issuesCount: 48,
    articlesCount: 245,
  }

  // Sample issues with embedded analytics
  const sampleIssues = [
    { id: 1, title: 'Volume 48, Issue 3', volume: '48', number: '3', datePublished: '2024-01-15', views: 890, downloads: 156 },
    { id: 2, title: 'Volume 48, Issue 2', volume: '48', number: '2', datePublished: '2023-10-15', views: 765, downloads: 134 },
    { id: 3, title: 'Volume 48, Issue 1', volume: '48', number: '1', datePublished: '2023-07-15', views: 920, downloads: 178 },
    { id: 4, title: 'Volume 47, Issue 4', volume: '47', number: '4', datePublished: '2023-04-15', views: 680, downloads: 123 },
    { id: 5, title: 'Volume 47, Issue 3', volume: '47', number: '3', datePublished: '2023-01-15', views: 720, downloads: 145 },
    { id: 6, title: 'Volume 47, Issue 2', volume: '47', number: '2', datePublished: '2022-10-15', views: 590, downloads: 98 },
  ]

  const displayIssues = issues.length > 0 ? issues : sampleIssues

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 dark:text-slate-400 mb-4">
        <Link to="/" className="hover:text-udsm-primary">Home</Link> / 
        <Link to="/journals" className="hover:text-udsm-primary ml-1">Journals</Link> / 
        <span className="ml-1 text-udsm-dark dark:text-white capitalize">{journalPath?.replace(/-/g, ' ')}</span>
      </nav>

      {/* Journal Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-bold text-udsm-dark dark:text-white mb-2 capitalize">
          {journalData.name}
        </h1>
        <p className="text-gray-600 dark:text-slate-300 max-w-3xl">
          {journalData.description}
        </p>
      </div>

      {/* Journal Analytics - Embedded */}
      <JournalAnalyticsHeader 
        views={journalData.views}
        downloads={journalData.downloads}
        citations={journalData.citations}
        issuesCount={journalData.issuesCount}
        articlesCount={journalData.articlesCount}
      />

      <h2 className="text-2xl font-serif font-bold text-udsm-dark dark:text-white mb-6">Issues</h2>

      {loading && <div className="animate-pulse text-gray-500">Loading...</div>}
      {error && <div className="text-red-600 dark:text-red-400">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayIssues.map((issue: unknown) => {
          const i = issue as { 
            id: number; 
            title?: string; 
            datePublished?: string; 
            volume?: string; 
            number?: string;
            views?: number;
            downloads?: number;
          }
          return <IssueCard key={i.id} issue={i} journalPath={journalPath} />
        })}
      </div>
    </div>
  )
}

export default JournalPage
