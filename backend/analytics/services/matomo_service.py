"""
Matomo API service for fetching analytics data.
"""

import logging
import requests
from typing import Dict, Any, Optional, List
from django.conf import settings

logger = logging.getLogger(__name__)


class MatomoService:
    """Service for Matomo Analytics API integration."""

    def __init__(self):
        self.base_url = settings.MATOMO_BASE_URL
        self.token = settings.MATOMO_TOKEN
        self.site_id = settings.MATOMO_SITE_ID

    @property
    def is_configured(self) -> bool:
        """Check if Matomo is properly configured."""
        return bool(self.token and self.base_url)

    def _make_request(
        self, method: str, params: Dict[str, Any] = None
    ) -> Optional[Dict[str, Any]]:
        """Make a request to Matomo API."""
        if not self.is_configured:
            logger.warning("Matomo is not configured")
            return None

        if params is None:
            params = {}

        # Build request parameters
        request_params = {
            "module": "API",
            "method": method,
            "idSite": self.site_id,
            "format": "JSON",
            "token_auth": self.token,
            **params,
        }

        try:
            response = requests.post(
                self.base_url,
                data=request_params,
                timeout=30,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.Timeout:
            logger.error("Matomo request timed out")
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"Matomo request failed: {e}")
            return None
        except ValueError as e:
            logger.error(f"Invalid JSON response from Matomo: {e}")
            return None

    # ============== KPI Endpoints ==============

    def get_kpi_summary(
        self, period: str = "day", date: str = "today"
    ) -> Optional[Dict[str, Any]]:
        """Get KPI summary (visits, unique visitors, etc.)."""
        return self._make_request("VisitsSummary.get", {"period": period, "date": date})

    def get_realtime_visits(self, max_rows: int = 10) -> Optional[List[Dict[str, Any]]]:
        """Get real-time visitor details."""
        return self._make_request("Live.getLastVisitsDetails", {"maxRows": max_rows})

    def get_realtime_count(self) -> Optional[int]:
        """Get count of real-time visitors."""
        result = self._make_request("Live.getCounters", {})
        if result and isinstance(result, list) and len(result) > 0:
            return result[0].get("visits", 0)
        return 0

    # ============== Content Analytics ==============

    def get_top_articles(
        self, period: str = "week", date: str = "today", limit: int = 20
    ) -> Optional[List[Dict[str, Any]]]:
        """Get top articles by page views."""
        result = self._make_request(
            "Actions.getPageTitles",
            {"period": period, "date": date, "flat": "1", "filter_limit": limit},
        )
        if isinstance(result, list):
            return result
        return []

    def get_article_metrics(
        self, article_url: str, period: str = "month", date: str = "today"
    ) -> Optional[Dict[str, Any]]:
        """Get metrics for a specific article."""
        return self._make_request(
            "Actions.getPageUrl",
            {"period": period, "date": date, "pageUrl": article_url},
        )

    def get_downloads(
        self, period: str = "month", date: str = "today", limit: int = 20
    ) -> Optional[List[Dict[str, Any]]]:
        """Get download statistics."""
        result = self._make_request(
            "Actions.getDownloads",
            {"period": period, "date": date, "expanded": "1", "filter_limit": limit},
        )
        if isinstance(result, list):
            return result
        return []

    # ============== Geographic Data ==============

    def get_countries(
        self, period: str = "month", date: str = "today"
    ) -> Optional[List[Dict[str, Any]]]:
        """Get visitor countries."""
        result = self._make_request(
            "UserCountry.getCountry", {"period": period, "date": date}
        )
        if isinstance(result, list):
            return result
        return []

    def get_cities(
        self, period: str = "month", date: str = "today", limit: int = 20
    ) -> Optional[List[Dict[str, Any]]]:
        """Get visitor cities."""
        result = self._make_request(
            "UserCountry.getCity",
            {"period": period, "date": date, "filter_limit": limit},
        )
        if isinstance(result, list):
            return result
        return []

    # ============== Acquisition ==============

    def get_referrers(
        self, period: str = "month", date: str = "today"
    ) -> Optional[List[Dict[str, Any]]]:
        """Get referrer sources."""
        result = self._make_request(
            "Referrers.getReferrerType", {"period": period, "date": date}
        )
        if isinstance(result, list):
            return result
        return []

    def get_search_engines(
        self, period: str = "month", date: str = "today", limit: int = 10
    ) -> Optional[List[Dict[str, Any]]]:
        """Get search engine referrers."""
        result = self._make_request(
            "Referrers.getSearchEngines",
            {"period": period, "date": date, "filter_limit": limit},
        )
        if isinstance(result, list):
            return result
        return []

    def get_socials(
        self, period: str = "month", date: str = "today"
    ) -> Optional[List[Dict[str, Any]]]:
        """Get social media referrers."""
        result = self._make_request(
            "Referrers.getSocials", {"period": period, "date": date}
        )
        if isinstance(result, list):
            return result
        return []

    # ============== Technology ==============

    def get_devices(
        self, period: str = "month", date: str = "today"
    ) -> Optional[List[Dict[str, Any]]]:
        """Get device types."""
        result = self._make_request(
            "DevicesDetection.getType", {"period": period, "date": date}
        )
        if isinstance(result, list):
            return result
        return []

    def get_browsers(
        self, period: str = "month", date: str = "today"
    ) -> Optional[List[Dict[str, Any]]]:
        """Get browser statistics."""
        result = self._make_request(
            "DevicesDetection.getBrowser", {"period": period, "date": date}
        )
        if isinstance(result, list):
            return result
        return []

    def get_os(
        self, period: str = "month", date: str = "today"
    ) -> Optional[List[Dict[str, Any]]]:
        """Get operating system statistics."""
        result = self._make_request(
            "DevicesDetection.getOs", {"period": period, "date": date}
        )
        if isinstance(result, list):
            return result
        return []

    # ============== Trends ==============

    def get_trends(
        self, date: str = "last30", period: str = "day"
    ) -> Optional[Dict[str, Any]]:
        """Get visit trends over time."""
        return self._make_request("VisitsSummary.get", {"date": date, "period": period})

    # ============== Goals ==============

    def get_goals(
        self, period: str = "month", date: str = "today"
    ) -> Optional[List[Dict[str, Any]]]:
        """Get goal conversions."""
        result = self._make_request("Goals.getGoals", {"period": period, "date": date})
        if isinstance(result, list):
            return result
        return []

    # ============== Aggregated Dashboard ==============

    def get_dashboard_data(
        self,
        period: str = "month",
        date: str = "today",
    ) -> Dict[str, Any]:
        """Get all dashboard data in a single request."""
        return {
            "kpi": self.get_kpi_summary(period, date),
            "realtime_count": self.get_realtime_count(),
            "top_articles": self.get_top_articles(period, date, 10),
            "downloads": self.get_downloads(period, date, 10),
            "countries": self.get_countries(period, date),
            "devices": self.get_devices(period, date),
            "referrers": self.get_referrers(period, date),
            "trends": self.get_trends("last30", "day"),
        }


# Singleton instance
matomo_service = MatomoService()
