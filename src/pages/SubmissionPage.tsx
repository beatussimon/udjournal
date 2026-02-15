import { useState } from 'react'

const SubmissionPage = () => {
  const [title, setTitle] = useState('')
  const [abstract, setAbstract] = useState('')

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif font-bold text-udsm-dark mb-8">Submit Research</h1>
      
      <div className="max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-gray-600 mb-6">
            Submit your research to UDSM JOURNALS. All submissions are peer-reviewed.
          </p>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-udsm-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Abstract
              </label>
              <textarea
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-udsm-primary"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-udsm-primary text-white px-6 py-3 rounded-lg hover:bg-udsm-secondary transition-colors"
            >
              Submit Article
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SubmissionPage
