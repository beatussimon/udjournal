import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useRealTime } from '../contexts/RealTimeContext'

// OJS Login URL from environment
const OJS_LOGIN_URL = import.meta.env.VITE_OJS_LOGIN_URL || 'http://localhost:8080/login'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const location = useLocation()
  const { isConnected } = useRealTime()

  // Navigation - Removed "Institutional Repository"
  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'Journals', path: '/journals' },
    { name: 'Search', path: '/search' },
    { name: 'Submission', path: '/submission' },
  ]

  // Removed Analytics from main nav (embedded throughout site)

  const isActive = (path: string) => location.pathname === path

  // Theme toggle effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const handleLogin = () => {
    // Redirect to OJS login system
    window.location.href = OJS_LOGIN_URL
  }

  return (
    <header className="bg-udsm-primary text-white shadow-lg">
      <div className="container mx-auto">
        {/* Top bar */}
        <div className="bg-udsm-dark px-4 py-2 text-xs flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="font-semibold">University of Dar es Salaam</span>
            <span className="text-udsm-gold">|</span>
            <span className="text-udsm-gold font-medium">UDSM Journals</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Live status indicator */}
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              {isConnected ? 'Live' : 'Offline'}
            </span>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
            
            {/* OJS Login - Direct redirect */}
            <button 
              onClick={handleLogin}
              className="hover:text-udsm-gold transition-colors font-medium"
            >
              Login
            </button>
            <a href="#" className="hover:text-udsm-gold transition-colors">Help</a>
          </div>
        </div>

        {/* Main header */}
        <div className="px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/udsmlogo.png" 
              alt="UDSM Logo" 
              className="w-14 h-14 object-contain"
            />
            <div>
              <h1 className="text-2xl font-serif font-bold tracking-wide">UDSM JOURNALS</h1>
              <p className="text-xs text-blue-200">Academic Publishing Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-md transition-colors ${
                  isActive(item.path)
                    ? 'bg-udsm-secondary text-white'
                    : 'hover:bg-udsm-secondary/50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 hover:bg-udsm-secondary/50 rounded-md"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden border-t border-udsm-secondary/50">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-3 border-b border-udsm-secondary/30 ${
                  isActive(item.path) ? 'bg-udsm-secondary' : 'hover:bg-udsm-secondary/50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header
