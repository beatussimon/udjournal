import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { AppDispatch, RootState } from '../store'
import { fetchJournals } from '../store/slices/journalsSlice'

// Journal Card with Embedded Analytics
const JournalCard = ({ journal }: { journal: { 
  id: number; 
  name: string; 
  description?: string; 
  path?: string; 
  articlesCount?: number;
  views?: number;
  downloads?: number;
  citations?: number;
  lastUpdated?: string;
  issuesCount?: number;
}}) => {
  return (
    <Link
      to={`/journals/${journal.path || journal.id}`}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow card-hover p-6"
    >
      <h2 className="text-xl font-serif font-bold text-udsm-primary dark:text-white mb-3">
        {journal.name}
      </h2>
      <p className="text-gray-600 dark:text-slate-300 mb-4 line-clamp-3">
        {journal.description || 'No description available'}
      </p>
      
      {/* Embedded Academic Metrics - Conservative Style */}
      <div className="pt-3 border-t border-gray-100 dark:border-slate-700">
        <p className="text-sm text-gray-500 dark:text-slate-400">
          <span className="font-semibold text-udsm-primary dark:text-blue-400">{(journal.views || 0).toLocaleString()}</span> Views |{' '}
          <span className="font-semibold text-udsm-primary dark:text-blue-400">{(journal.downloads || 0).toLocaleString()}</span> Downloads |{' '}
          <span className="font-semibold text-udsm-gold">{journal.citations || 0}</span> Citations
        </p>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-400 dark:text-slate-500">
          <span>{journal.issuesCount || 0} Issues</span>
          <span>{journal.articlesCount || 0} Articles</span>
          {journal.lastUpdated && (
            <span>Updated: {new Date(journal.lastUpdated).toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

const JournalsPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { journals, loading, error } = useSelector((state: RootState) => state.journals)

  useEffect(() => {
    dispatch(fetchJournals())
  }, [dispatch])

  // Sample journals with embedded metrics (in production, this comes from API)
  const sampleJournals = [
    {
      id: 1,
      name: 'Journal of African Studies',
      description: 'A peer-reviewed academic journal publishing research on African history, culture, politics, and development.',
      path: 'african-studies',
      articlesCount: 245,
      issuesCount: 48,
      views: 12430,
      downloads: 2340,
      citations: 145,
      lastUpdated: '2024-01-15'
    },
    {
      id: 2,
      name: 'East African Medical Journal',
      description: 'Publishing original research, reviews, and case studies in medicine and health sciences.',
      path: 'medical-journal',
      articlesCount: 189,
      issuesCount: 36,
      views: 8920,
      downloads: 1890,
      citations: 98,
      lastUpdated: '2024-02-01'
    },
    {
      id: 3,
      name: 'Tanzania Journal of Science',
      description: 'Interdisciplinary scientific journal covering natural and applied sciences.',
      path: 'science-journal',
      articlesCount: 312,
      issuesCount: 52,
      views: 7650,
      downloads: 1450,
      citations: 76,
      lastUpdated: '2024-01-20'
    },
    {
      id: 4,
      name: 'Journal of Education',
      description: 'Research on educational policies, pedagogy, and learning methodologies.',
      path: 'education-journal',
      articlesCount: 156,
      issuesCount: 24,
      views: 6230,
      downloads: 1120,
      citations: 54,
      lastUpdated: '2024-01-10'
    },
    {
      id: 5,
      name: 'Law Review',
      description: 'Legal scholarship covering Tanzanian, African, and international law.',
      path: 'law-review',
      articlesCount: 98,
      issuesCount: 18,
      views: 4580,
      downloads: 890,
      citations: 42,
      lastUpdated: '2023-12-15'
    },
    {
      id: 6,
      name: 'Journal of Agriculture',
      description: 'Research on agricultural sciences, food security, and rural development.',
      path: 'agriculture-journal',
      articlesCount: 178,
      issuesCount: 30,
      views: 5890,
      downloads: 1230,
      citations: 67,
      lastUpdated: '2024-01-25'
    },
  ]

  const displayJournals = journals.length > 0 ? journals : sampleJournals

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-udsm-dark dark:text-white mb-2">Journals</h1>
        <p className="text-gray-600 dark:text-slate-400">
          Browse our collection of academic journals with real-time engagement metrics
        </p>
      </div>
      
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/3 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayJournals.map((journal: unknown) => {
          const j = journal as { 
            id: number; 
            name: string; 
            description?: string; 
            path?: string; 
            articlesCount?: number;
            issuesCount?: number;
            views?: number;
            downloads?: number;
            citations?: number;
            lastUpdated?: string;
          }
          return <JournalCard key={j.id} journal={j} />
        })}
      </div>
    </div>
  )
}

export default JournalsPage
