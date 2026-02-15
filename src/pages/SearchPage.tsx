import { useState } from 'react'
import { Link } from 'react-router-dom'

const SearchPage = () => {
  const [query, setQuery] = useState('')

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif font-bold text-udsm-dark mb-8">Search</h1>
      
      <div className="max-w-2xl">
        <div className="flex gap-4 mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, journals, authors..."
            className="flex-grow px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-udsm-primary"
          />
          <button className="bg-udsm-primary text-white px-6 py-3 rounded-lg hover:bg-udsm-secondary transition-colors">
            Search
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">Enter a search query to find articles in the repository.</p>
        </div>
      </div>
    </div>
  )
}

export default SearchPage
