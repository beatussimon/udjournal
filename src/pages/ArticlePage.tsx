import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

// Article Analytics Component
const ArticleAnalytics = ({ 
  views, 
  downloads, 
  citations, 
  googleScholarUrl 
}: { 
  views: number
  downloads: number
  citations: number
  googleScholarUrl?: string
}) => {
  const [citationTrend, setCitationTrend] = useState<{ year: number; count: number }[]>([])

  useEffect(() => {
    // Sample citation trend data (in production, fetch from Google Scholar API)
    setCitationTrend([
      { year: 2020, count: 2 },
      { year: 2021, count: 5 },
      { year: 2022, count: 8 },
      { year: 2023, count: 12 },
      { year: 2024, count: 15 },
    ])
  }, [])

  return (
    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4 mb-6">
      <h3 className="font-serif font-bold text-udsm-primary dark:text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Article Metrics
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-udsm-primary dark:text-blue-400">{views.toLocaleString()}</div>
          <div className="text-xs text-gray-500 dark:text-slate-400">Total Views</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-udsm-primary dark:text-blue-400">{downloads.toLocaleString()}</div>
          <div className="text-xs text-gray-500 dark:text-slate-400">Downloads</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-udsm-gold">{citations}</div>
          <div className="text-xs text-gray-500 dark:text-slate-400">Citations</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">+15%</div>
          <div className="text-xs text-gray-500 dark:text-slate-400">Growth</div>
        </div>
      </div>

      {/* Citation Trend Graph */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-600 dark:text-slate-300 mb-2">Citation Trend</h4>
        <div className="flex items-end gap-1 h-20">
          {citationTrend.map((item, index) => {
            const maxCount = Math.max(...citationTrend.map(c => c.count))
            const height = (item.count / maxCount) * 100
            return (
              <div key={item.year} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-udsm-gold dark:bg-yellow-600 rounded-t transition-all"
                  style={{ height: `${height}%` }}
                  title={`${item.count} citations in ${item.year}`}
                />
                <span className="text-[10px] text-gray-500 dark:text-slate-400">{item.year}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Google Scholar Link */}
      {googleScholarUrl && (
        <a 
          href={googleScholarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-udsm-secondary hover:text-udsm-primary dark:text-blue-400 dark:hover:text-blue-300"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.145 19.546c-3.905 1.94-8.346-.45-9.89-5.335-1.545-4.89 1.15-10.335 6.03-12.16 4.88-1.826 10.35 1.52 12.17 7.46 1.815 5.94-1.195 12.44-6.16 13.96-.52.16-1.07.26-1.63.26-.62 0-1.24-.12-1.82-.36l.3.13zm3.59-3.54c.65-.36 1.07-.93 1.25-1.6.17-.67.1-1.36-.2-2-.6-1.28-1.86-2.04-3.2-1.95-1.35.1-2.53.97-3.02 2.22-.5 1.25-.25 2.6.65 3.46.9.87 2.24 1.08 3.28.42l1.24.45z"/>
          </svg>
          View on Google Scholar
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
    </div>
  )
}

// Academic Impact Indicators
const AcademicImpact = ({ 
  impactScore, 
  relevanceScore 
}: { 
  impactScore?: number
  relevanceScore?: number
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-slate-300">Academic Impact</span>
          <span className="text-sm font-semibold text-udsm-primary dark:text-blue-400">{impactScore || 78}/100</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-udsm-secondary to-udsm-accent rounded-full"
            style={{ width: `${impactScore || 78}%` }}
          />
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-slate-300">Institutional Relevance</span>
          <span className="text-sm font-semibold text-udsm-primary dark:text-blue-400">{relevanceScore || 85}/100</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
            style={{ width: `${relevanceScore || 85}%` }}
          />
        </div>
      </div>
    </div>
  )
}

const ArticlePage = () => {
  const { journalPath, articleId } = useParams<{ journalPath: string; articleId: string }>()
  const { viewsToday } = useSelector((state: RootState) => state.realtime)
  
  // Sample article data (in production, fetch from API)
  const articleData = {
    title: 'Impact of Climate Change on Agricultural Productivity in East Africa: A Comprehensive Review',
    authors: [
      { firstName: 'John', lastName: 'Mushi', affiliation: 'University of Dar es Salaam' },
      { firstName: 'Mary', lastName: 'Kombo', affiliation: 'Sokoine University of Agriculture' }
    ],
    datePublished: '2024-01-15',
    abstract: 'This comprehensive review examines the multifaceted impacts of climate change on agricultural productivity in East Africa. Using a meta-analytic approach, we synthesize findings from 87 peer-reviewed studies conducted between 2010 and 2023. Our analysis reveals significant negative correlations between rising temperatures and crop yields, with maize production projected to decrease by 15-30% by 2050 under current emission scenarios. The study also identifies adaptation strategies that have shown promise in mitigating these impacts, including drought-resistant crop varieties, improved irrigation systems, and climate-smart agricultural practices.',
    views: 2847,
    downloads: 456,
    citations: 23,
    googleScholarUrl: 'https://scholar.google.com/scholar?q=climate+change+agriculture+east+africa',
    impactScore: 82,
    relevanceScore: 91,
    keywords: ['Climate Change', 'Agriculture', 'East Africa', 'Food Security', 'Adaptation']
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 dark:text-slate-400 mb-4">
        <Link to="/" className="hover:text-udsm-primary">Home</Link> / 
        <Link to="/journals" className="hover:text-udsm-primary ml-1">Journals</Link> / 
        <Link to={`/journals/${journalPath}`} className="hover:text-udsm-primary ml-1 capitalize">
          {journalPath?.replace(/-/g, ' ')}
        </Link> / 
        <span className="ml-1 text-udsm-dark dark:text-white">Article {articleId}</span>
      </nav>

      <article className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8">
        {/* Article Header */}
        <h1 className="text-3xl font-serif font-bold text-udsm-dark dark:text-white mb-4">
          {articleData.title}
        </h1>
        
        {/* Authors */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-slate-300 mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{articleData.authors.map(a => `${a.firstName} ${a.lastName}`).join(', ')}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Published: {new Date(articleData.datePublished).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Keywords */}
        <div className="flex flex-wrap gap-2 mb-6">
          {articleData.keywords.map((keyword, index) => (
            <span 
              key={index} 
              className="px-3 py-1 text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-full"
            >
              {keyword}
            </span>
          ))}
        </div>

        {/* Article Analytics - Embedded */}
        <ArticleAnalytics 
          views={articleData.views}
          downloads={articleData.downloads}
          citations={articleData.citations}
          googleScholarUrl={articleData.googleScholarUrl}
        />

        {/* Academic Impact Indicators */}
        <AcademicImpact 
          impactScore={articleData.impactScore}
          relevanceScore={articleData.relevanceScore}
        />

        {/* Abstract */}
        <div className="mb-8">
          <h2 className="text-xl font-serif font-bold text-udsm-primary dark:text-white mb-4">Abstract</h2>
          <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
            {articleData.abstract}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 items-center border-t border-gray-200 dark:border-slate-700 pt-6">
          <button className="bg-udsm-primary text-white px-6 py-2 rounded-lg hover:bg-udsm-secondary transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </button>
          <button className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 px-6 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View HTML
          </button>
          <span className="text-gray-500 dark:text-slate-400 ml-auto">
            {viewsToday} views today
          </span>
        </div>
      </article>
    </div>
  )
}

export default ArticlePage
