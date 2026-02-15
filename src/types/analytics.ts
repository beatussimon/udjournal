export interface MatomoKPIMetrics {
  nb_visits: number
  nb_uniq_visitors: number
  nb_actions: number
  bounce_rate: number
  avg_time_on_site: number
  max_actions?: number
  nb_visits_converted?: number
}

export interface MatomoLiveVisit {
  id: string
  lastActionDateTime: string
  visitorType: string
  country: string
  countryCode?: string
  city?: string
  device: string
  browser: string
  os: string
  actions: MatomoAction[]
  referrerType: string
  referrerName?: string
  visitDuration?: number
}

export interface MatomoAction {
  id: number
  type: string
  title: string
  url: string
  timestamp: string
}

export interface MatomoPageTitle {
  label: string
  nb_hits: number
  nb_visits?: number
  avg_time_on_page?: number
}

export interface MatomoDownloadItem {
  label: string
  nb_hits: number
  nb_visits?: number
  url?: string
}

export interface MatomoCountryItem {
  country: string
  countryCode?: string
  nb_visits: number
  nb_uniq_visitors: number
}

export interface MatomoReferrerItem {
  referrer_type: string
  referrer_name?: string
  nb_visits: number
  nb_uniq_visitors: number
}

export interface MatomoDeviceItem {
  type: string
  nb_visits: number
  nb_uniq_visitors: number
}

export interface MatomoTrendData {
  date: string
  visits: number
  visitors?: number
}
