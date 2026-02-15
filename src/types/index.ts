// OJS Types - Enhanced with Analytics
export interface Journal {
  id: number
  path: string
  name: string
  description?: string
  thumbnail?: string
  issuesCount?: number
  articlesCount?: number
  currentIssue?: Issue
  // Embedded analytics
  views?: number
  downloads?: number
  citations?: number
  lastUpdated?: string
  impactFactor?: number
}

export interface Issue {
  id: number
  journalId: number
  volume?: string
  number?: string
  year?: number
  datePublished?: string
  title?: string
  description?: string
  coverImage?: string
  articles?: Article[]
  // Embedded analytics
  views?: number
  downloads?: number
}

export interface Article {
  id: number
  submissionId: number
  title: string
  abstract?: string
  authors: Author[]
  keywords?: string[]
  datePublished?: string
  views: number
  downloads: number
  galleys?: Galley[]
  section?: Section
  journal?: Journal
  issue?: Issue
  // Embedded analytics
  citations?: number
  citationTrend?: CitationTrend[]
  googleScholarUrl?: string
  academicImpactScore?: number
  institutionalRelevanceScore?: number
}

export interface Author {
  id: number
  firstName: string
  lastName: string
  email?: string
  affiliation?: string
  orcid?: string
}

export interface Galley {
  id: number
  label: string
  url: string
  type: 'pdf' | 'html' | 'other'
}

export interface Section {
  id: number
  title: string
}

export interface Submission {
  id: number
  title: string
  abstract?: string
  status: 'published' | 'draft' | 'review' | 'accepted' | 'declined'
  dateSubmitted?: string
  datePublished?: string
  authors: Author[]
  keywords?: string[]
}

// Citation Data from Google Scholar
export interface CitationData {
  articleId: number
  totalCitations: number
  citesPerYear: { year: number; count: number }[]
  hIndex?: number
  i10Index?: number
  lastUpdated: string
  googleScholarUrl?: string
}

export interface CitationTrend {
  year: number
  citations: number
}

// Matomo Analytics Types
export interface MatomoKPISummary {
  nb_visits: number
  nb_uniq_visitors: number
  nb_actions: number
  bounce_rate: number
  avg_time_on_site: number
}

export interface MatomoVisit {
  id: string
  lastActionDateTime: string
  visitorType: string
  country: string
  city?: string
  device: string
  browser: string
  os: string
  actions: MatomoAction[]
  referrerType: string
  referrerName?: string
}

export interface MatomoAction {
  id: number
  type: string
  title: string
  url: string
  timestamp: string
}

export interface MatomoPage {
  id: string
  title: string
  url: string
  hits: number
  avgTimeOnPage?: number
}

export interface MatomoDownload {
  id: string
  name: string
  url: string
  hits: number
}

export interface MatomoCountry {
  country: string
  nb_visits: number
  nb_uniq_visitors: number
}

export interface MatomoReferrer {
  referrerType: string
  referrerName?: string
  nb_visits: number
  nb_uniq_visitors: number
}

export interface MatomoDevice {
  type: string
  nb_visits: number
  nb_uniq_visitors: number
}

// Real-time Types
export interface RealtimeEvent {
  type: 'view' | 'download' | 'search' | 'submission' | 'citation'
  articleId?: number
  journalId?: number
  issueId?: number
  timestamp: string
  visitorId?: string
  country?: string
  city?: string
}

export interface RealtimeStats {
  activeVisitors: number
  viewsToday: number
  downloadsToday: number
  citationsToday: number
  topArticles: TrendingArticle[]
  topJournals: TrendingJournal[]
  geoDistribution: GeoHotspot[]
}

export interface TrendingArticle {
  id: number
  title: string
  views: number
  downloads: number
  citations?: number
  trend: 'up' | 'down' | 'stable'
  trendPercentage?: number
}

export interface TrendingJournal {
  id: number
  name: string
  path?: string
  views: number
  downloads: number
  citations?: number
  submissions: number
  trend: 'up' | 'down' | 'stable'
  trendPercentage?: number
}

export interface GeoHotspot {
  country: string
  countryCode?: string
  city?: string
  latitude?: number
  longitude?: number
  visits: number
  views: number
  percentage?: number
}

// Search Types
export interface SearchParams {
  query: string
  journal?: string
  issue?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: 'relevance' | 'date' | 'views' | 'downloads' | 'citations'
}

export interface SearchResult {
  articles: Article[]
  totalCount: number
  page: number
  pageSize: number
}

// Dashboard Analytics Types
export interface DashboardMetrics {
  totalViews: number | null
  totalDownloads: number | null
  totalCitations: number | null
  activeUsers: number | null
  viewsTrend: number | null
  downloadsTrend: number | null
  citationsTrend: number | null
  usersTrend: number | null
}

export interface EngagementData {
  period: string
  views: number
  downloads: number
  uniqueVisitors: number
  avgSessionDuration: number
  bounceRate: number
}

export interface HeatmapCell {
  day: number
  hour: number
  value: number
}

// Theme Types
export type ThemeMode = 'light' | 'dark'

export interface ThemeContextType {
  theme: ThemeMode
  toggleTheme: () => void
}
