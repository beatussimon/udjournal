import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import JournalsPage from './pages/JournalsPage'
import JournalPage from './pages/JournalPage'
import IssuePage from './pages/IssuePage'
import ArticlePage from './pages/ArticlePage'
import SearchPage from './pages/SearchPage'
import SubmissionPage from './pages/SubmissionPage'
import AnalyticsDashboard from './pages/AnalyticsDashboard'
import FAQPage from './pages/FAQPage'
import { RealTimeProvider } from './contexts/RealTimeContext'

function App() {
  return (
    <RealTimeProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/journals" element={<JournalsPage />} />
          <Route path="/journals/:journalPath" element={<JournalPage />} />
          <Route path="/journals/:journalPath/issues/:issueId" element={<IssuePage />} />
          <Route path="/journals/:journalPath/articles/:articleId" element={<ArticlePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/submission" element={<SubmissionPage />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/faq" element={<FAQPage />} />
        </Routes>
      </Layout>
    </RealTimeProvider>
  )
}

export default App
