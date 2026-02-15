import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store'
import { fetchJournals } from '../store/slices/journalsSlice'
import { ojsProxyAPI } from '../services/api'

interface SearchResult {
  id: number
  title: string
  journalPath?: string
  authors?: string[]
  datePublished?: string
  type: 'article' | 'journal'
}

const SearchPage = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const { journals } = useSelector((state: RootState) => state.journals)

  useEffect(() => {
    dispatch(fetchJournals())
  }, [dispatch])

  const handleSearch = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    setSearched(true)
    setResults([])

    try {
      // Search across all journals
      const searchResults: SearchResult[] = []
      
      // Search journals first
      const matchedJournals = journals.filter((journal: { name: string }) => 
        journal.name?.toLowerCase().includes(query.toLowerCase())
      )
      
      matchedJournals.forEach((journal: { id: number; name: string; path?: string }) => {
        searchResults.push({
          id: journal.id,
          title: journal.name,
          journalPath: journal.path,
          type: 'journal'
        })
      })

      // Search articles from each journal
      for (const journal of journals.slice(0, 5)) {
        try {
          const response = await ojsProxyAPI.getSubmissions(journal.path || '', undefined, 1, 20)
          const items = response.items || response || []
          
          items.forEach((item: { id: number; title?: string | { en_US?: string }; authors?: { fullName: string }[]; datePublished?: string }) => {
            const title = typeof item.title === 'object' ? item.title?.en_US || item.title?.en || '' : item.title || ''
            if (title.toLowerCase().includes(query.toLowerCase())) {
              searchResults.push({
                id: item.id,
                title: title,
                journalPath: journal.path,
                authors: item.authors?.map((a: { fullName: string }) => a.fullName),
                datePublished: item.datePublished,
                type: 'article'
              })
            }
          })
        } catch (e) {
          console.error(`Failed to search in journal ${journal.path}:`, e)
        }
      }
      
      setResults(searchResults)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif font-bold text-udsm-dark mb-8">Search</h1>
      
      <div className="max-w-2xl">
        <div className="flex gap-4 mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search articles, journals, authors..."
            className="flex-grow px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-udsm-primary"
          />
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="bg-udsm-primary text-white px-6 py-3 rounded-lg hover:bg-udsm-secondary transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-udsm-primary mx-auto"></div>
            <p className="text-gray-500 mt-2">Searching...</p>
          </div>
        ) : searched && results.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">No results found for "{query}". Try different keywords.</p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            <p className="text-gray-500 mb-4">{results.length} results found for "{query}"</p>
            {results.map((result, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                {result.type === 'journal' ? (
                  <Link to={`/journals/${result.journalPath}`} className="block">
                    <span className="text-xs font-semibold text-udsm-secondary uppercase tracking-wide">Journal</span>
                    <h3 className="text-lg font-serif font-bold text-udsm-primary hover:text-udsm-secondary">
                      {result.title}
                    </h3>
                  </Link>
                ) : (
                  <Link to={`/journals/${result.journalPath}/articles/${result.id}`} className="block">
                    <span className="text-xs font-semibold text-udsm-gold uppercase tracking-wide">Article</span>
                    <h3 className="text-lg font-serif font-bold text-udsm-primary hover:text-udsm-secondary">
                      {result.title}
                    </h3>
                    {result.authors && result.authors.length > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        {result.authors.join(', ')}
                      </p>
                    )}
                    {result.datePublished && (
                      <p className="text-xs text-gray-400 mt-1">
                        Published: {new Date(result.datePublished).toLocaleDateString()}
                      </p>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">Enter a search query to find articles in the repository.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPage
