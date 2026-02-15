import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store'
import { fetchArticles } from '../store/slices/articlesSlice'

// Issue Analytics Component
const IssueAnalytics = ({ 
  views, 
  downloads, 
  articleCount 
}: { 
  views: number
  downloads: number
  articleCount: number
}) => {
  return (
    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif font-bold text-udsm-primary dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Issue Metrics
        </h3>
        <div className="flex gap-6 text-sm">
          <span className="text-gray-600 dark:text-slate-300">
            <span className="font-semibold text-udsm-primary dark:text-blue-400">{views.toLocaleString()}</span> views
          </span>
          <span className="text-gray-600 dark:text-slate-300">
            <span className="font-semibold text-udsm-primary dark:text-blue-400">{downloads.toLocaleString()}</span> downloads
          </span>
          <span className="text-gray-600 dark:text-slate-300">
            <span className="font-semibold text-udsm-secondary dark:text-blue-400">{articleCount}</span> articles
          </span>
        </div>
      </div>
    </div>
  )
}

// Article Preview Card with Metrics
const ArticlePreviewCard = ({ 
  article,
  journalPath,
  issueId
}: { 
  article: {
    id: number
    title: string
    authors?: { firstName: string; lastName: string }[]
    views?: number
    downloads?: number
    citations?: number
  }
  journalPath?: string
  issueId?: string
}) => {
  return (
    <Link
      to={`/journals/${journalPath}/articles/${article.id}`}
      className="block bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
    >
      <h3 className="font-medium text-udsm-primary dark:text-white mb-2 line-clamp-2">
        {article.title}
      </h3>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-slate-400">
          {article.authors?.map(a => `${a.firstName} ${a.lastName}`).join(', ') || 'Unknown Authors'}
        </p>
        <p className="text-xs text-gray-400 dark:text-slate-500">
          {(article.views || 0).toLocaleString()} views | {(article.downloads || 0).toLocaleString()} downloads
        </p>
      </div>
    </Link>
  )
}

const IssuePage = () => {
  const { journalPath, issueId } = useParams<{ journalPath: string; issueId: string }>()
  const dispatch = useDispatch<AppDispatch>()
  const { articles, loading, error } = useSelector((state: RootState) => state.articles)

  useEffect(() => {
    if (journalPath && issueId) {
      dispatch(fetchArticles({ journalPath, issueId }))
    }
  }, [dispatch, journalPath, issueId])

  // Sample issue data
  const issueData = {
    title: `Issue ${issueId}`,
    volume: '48',
    number: '3',
    datePublished: '2024-01-15',
    views: 890,
    downloads: 156,
    articleCount: 12,
  }

  // Sample articles with embedded metrics
  const sampleArticles = [
    { 
      id: 1, 
      title: 'Impact of Climate Change on Agricultural Productivity in East Africa',
      authors: [{ firstName: 'John', lastName: 'Mushi' }, { firstName: 'Mary', lastName: 'Kombo' }],
      views: 2847,
      downloads: 456,
      citations: 23
    },
    { 
      id: 2, 
      title: 'Urbanization and Environmental Sustainability in Tanzania',
      authors: [{ firstName: 'David', lastName: 'Lugoe' }],
      views: 1523,
      downloads: 289,
      citations: 12
    },
    { 
      id: 3, 
      title: 'Digital Transformation in East African Higher Education',
      authors: [{ firstName: 'Sarah', lastName: 'Mwakidudu' }, { firstName: 'Peter', lastName: 'Nyerere' }],
      views: 987,
      downloads: 178,
      citations: 8
    },
    { 
      id: 4, 
      title: 'Public Health Policy Implementation in Rural Tanzania',
      authors: [{ firstName: 'Emmanuel', lastName: 'Mushi' }],
      views: 765,
      downloads: 134,
      citations: 5
    },
    { 
      id: 5, 
      title: 'Economic Impact of Tourism on Local Communities',
      authors: [{ firstName: 'Anna', lastName: 'Kassim' }, { firstName: 'James', lastName: 'Mwalimu' }],
      views: 654,
      downloads: 112,
      citations: 7
    },
  ]

  const displayArticles = articles.length > 0 ? articles : sampleArticles

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 dark:text-slate-400 mb-4">
        <Link to="/" className="hover:text-udsm-primary">Home</Link> / 
        <Link to="/journals" className="hover:text-udsm-primary ml-1">Journals</Link> / 
        <Link to={`/journals/${journalPath}`} className="hover:text-udsm-primary ml-1 capitalize">
          {journalPath?.replace(/-/g, ' ')}
        </Link> / 
        <span className="ml-1 text-udsm-dark dark:text-white">Issue {issueId}</span>
      </nav>

      {/* Issue Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-bold text-udsm-dark dark:text-white mb-2">
          Volume {issueData.volume}, Issue {issueData.number}
        </h1>
        <p className="text-gray-600 dark:text-slate-300">
          Published: {new Date(issueData.datePublished).toLocaleDateString()}
        </p>
      </div>

      {/* Issue Analytics - Embedded */}
      <IssueAnalytics 
        views={issueData.views}
        downloads={issueData.downloads}
        articleCount={issueData.articleCount}
      />

      <h2 className="text-2xl font-serif font-bold text-udsm-dark dark:text-white mb-6">Articles</h2>

      {loading && <div className="animate-pulse text-gray-500">Loading...</div>}
      {error && <div className="text-red-600 dark:text-red-400">{error}</div>}

      <div className="space-y-4">
        {displayArticles.map((article: unknown) => {
          const a = article as {
            id: number
            title: string
            authors?: { firstName: string; lastName: string }[]
            views?: number
            downloads?: number
            citations?: number
          }
          return (
            <ArticlePreviewCard 
              key={a.id} 
              article={a} 
              journalPath={journalPath}
              issueId={issueId}
            />
          )
        })}
      </div>
    </div>
  )
}

export default IssuePage
