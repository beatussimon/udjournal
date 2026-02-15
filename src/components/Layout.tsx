import { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import LiveMetricsBar from './LiveMetricsBar'
import AnalyticsOverlay from './AnalyticsOverlay'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <LiveMetricsBar />
      <main className="flex-grow">
        {children}
      </main>
      <AnalyticsOverlay />
      <Footer />
    </div>
  )
}

export default Layout
