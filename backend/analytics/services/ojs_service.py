"""
OJS API service for fetching content metadata.
"""

import logging
from datetime import datetime
import requests
from typing import Dict, Any, Optional, List
from django.conf import settings

logger = logging.getLogger(__name__)


class OJSService:
    """Service for OJS REST API integration."""

    def __init__(self):
        self.base_url = settings.OJS_BASE_URL
        self.api_key = settings.OJS_API_KEY
        # Ensure base_url ends with /index.php for API calls
        if self.base_url and not self.base_url.endswith('/index.php'):
            self.base_url = self.base_url.rstrip('/') + '/index.php'
        # base_url should NOT have trailing slash for endpoint concatenation
        self.base_url = self.base_url.rstrip('/')

    @property
    def is_configured(self) -> bool:
        """Check if OJS is properly configured."""
        return bool(self.api_key and self.base_url)

    def _get_headers(self) -> Dict[str, str]:
        """Get headers for OJS API requests."""
        return {"Accept": "application/json"}

    def _make_request(
        self, method: str, endpoint: str, params: Dict[str, Any] = None
    ) -> Optional[Any]:
        """Make a request to OJS API."""
        if not self.is_configured:
            logger.warning("OJS is not configured")
            return None

        if params is None:
            params = {}

        # Add API token to params
        params["apiToken"] = self.api_key

        url = f"{self.base_url}{endpoint}"

        # Ensure we don't have double /index.php
        if "/index.php/index.php/" in url:
            url = url.replace("/index.php/index.php/", "/index.php/")

        try:
            if method.upper() == "GET":
                response = requests.get(
                    url, params=params, headers=self._get_headers(), timeout=30
                )
            else:
                response = requests.request(
                    method, url, params=params, headers=self._get_headers(), timeout=30
                )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.Timeout:
            logger.error(f"OJS request timed out: {endpoint}")
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"OJS request failed: {e}")
            return None
        except ValueError as e:
            logger.error(f"Invalid JSON response from OJS: {e}")
            return None

# ============== Journals ==============

    def get_journals(self) -> Optional[List[Dict[str, Any]]]:
        """Get all journals (contexts) from OJS.
        
        Since there's no system-wide API, we iterate through known journals
        and fetch their context details individually.
        """
        # Get list of known journals from settings or use defaults
        known_journals = getattr(settings, 'OJS_JOURNALS', [
            {'path': 'innovative-minds', 'id': 1},
            {'path': 'bright-tomorrow', 'id': 2},
        ])
        
        journals = []
        for journal in known_journals:
            context = self.get_journal_context(journal['path'], journal['id'])
            if context:
                journals.append(context)
        
        if not journals:
            return None
        
        return {
            'itemsMax': len(journals),
            'items': journals
        }
    
    def get_journal_context(self, journal_path: str, context_id: int) -> Optional[Dict[str, Any]]:
        """Get full context details for a specific journal."""
        return self._make_request(
            "GET", f"/index.php/{journal_path}/api/v1/contexts/{context_id}"
        )

    def get_journal(self, journal_path: str) -> Optional[Dict[str, Any]]:
        """Get a specific journal by path (uses first context ID found)."""
        return self._make_request(
            "GET", f"/index.php/{journal_path}/api/v1/journals"
        )

    # ============== Issues ==============

    def get_issues(
        self, journal_path: str, status: str = None, page: int = 1
    ) -> Optional[Dict[str, Any]]:
        """Get issues for a journal."""
        params = {"page": page}
        if status:
            params["status"] = status
        return self._make_request(
            "GET", f"/index.php/{journal_path}/api/v1/issues", params
        )

    def get_issue(self, journal_path: str, issue_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific issue."""
        return self._make_request(
            "GET", f"/index.php/{journal_path}/api/v1/issues/{issue_id}"
        )

    # ============== Articles/Submissions ==============

    def get_submissions(
        self,
        journal_path: str,
        status: str = None,
        page: int = 1,
        items_per_page: int = 20,
    ) -> Optional[Dict[str, Any]]:
        """Get submissions/articles for a journal."""
        params = {"page": page, "itemsPerPage": items_per_page}
        if status:
            params["status"] = status
        return self._make_request(
            "GET", f"/index.php/{journal_path}/api/v1/submissions", params
        )

    def get_published_submissions(
        self, journal_path: str, page: int = 1, items_per_page: int = 20
    ) -> Optional[Dict[str, Any]]:
        """Get published submissions."""
        return self.get_submissions(
            journal_path, status="published", page=page, items_per_page=items_per_page
        )

    def get_submission(
        self, journal_path: str, submission_id: int
    ) -> Optional[Dict[str, Any]]:
        """Get a specific submission."""
        return self._make_request(
            "GET", f"/index.php/{journal_path}/api/v1/submissions/{submission_id}"
        )

    # ============== Articles ==============

    def get_articles(
        self, journal_path: str, issue_id: int = None, page: int = 1
    ) -> Optional[List[Dict[str, Any]]]:
        """Get articles for a journal/issue."""
        params = {"page": page}
        if issue_id:
            params["issueId"] = issue_id
        result = self._make_request(
            "GET", f"/index.php/{journal_path}/api/v1/articles", params
        )
        if isinstance(result, dict) and "items" in result:
            return result["items"]
        return result if isinstance(result, list) else []

    def get_article(
        self, journal_path: str, article_id: int
    ) -> Optional[Dict[str, Any]]:
        """Get a specific article."""
        return self._make_request(
            "GET", f"/index.php/{journal_path}/api/v1/articles/{article_id}"
        )

    # ============== Authors ==============

    def get_authors(
        self, journal_path: str, page: int = 1
    ) -> Optional[Dict[str, Any]]:
        """Get authors for a journal."""
        return self._make_request(
            "GET", f"/index.php/{journal_path}/api/v1/authors", {"page": page}
        )

    # ============== Search ==============

    def search(
        self, journal_path: str, query: str, page: int = 1
    ) -> Optional[Dict[str, Any]]:
        """Search articles."""
        return self._make_request(
            "GET",
            f"/index.php/{journal_path}/api/v1/submissions",
            {"searchPhrase": query, "page": page},
        )

    # ============== Sections ==============

    def get_sections(self, journal_path: str) -> Optional[List[Dict[str, Any]]]:
        """Get journal sections."""
        result = self._make_request(
            "GET", f"/index.php/{journal_path}/api/v1/sections"
        )
        if isinstance(result, list):
            return result
        return []

    # ============== Statistics/Aggregated ==============

    def get_journal_stats(self, journal_path: str) -> Dict[str, Any]:
        """Get aggregated stats for a journal."""
        submissions = self.get_published_submissions(journal_path)
        issues = self.get_issues(journal_path)

        stats = {
            "total_articles": 0,
            "total_issues": 0,
            "journal_path": journal_path,
        }

        if submissions and isinstance(submissions, dict):
            stats["total_articles"] = submissions.get("itemsTotalCount", 0)
        if issues and isinstance(issues, dict):
            stats["total_issues"] = issues.get("itemsTotalCount", 0)

        return stats

    # ============== Statistics/Aggregated Metrics ==============

    def get_article_metrics(self, journal_path: str, article_id: int) -> Optional[Dict[str, Any]]:
        """Get detailed metrics for a specific article."""
        article = self.get_article(journal_path, article_id)
        if not article:
            return None

        # Extract article details
        metrics = {
            "article_id": article_id,
            "title": article.get("title", {}).get("en", ""),
            "authors": [],
            "status": article.get("status", ""),
            "date_published": None,
            "abstract": article.get("abstract", {}).get("en", ""),
            "section": article.get("section", {}).get("title", ""),
            "views": 0,
            "downloads": 0,
        }

        # Get authors
        authors = article.get("authors", [])
        metrics["authors"] = [
            {
                "full_name": a.get("fullName", ""),
                "first_name": a.get("firstName", ""),
                "last_name": a.get("lastName", ""),
                "affiliation": a.get("affiliation", ""),
                "orcid": a.get("orcid", ""),
            }
            for a in authors
        ]

        # Get publication date
        date_published = article.get("datePublished")
        if date_published:
            metrics["date_published"] = date_published

        # Get submission ID for metrics lookup
        metrics["submission_id"] = article.get("id", article_id)

        return metrics

    def get_journal_metrics(self, journal_path: str) -> Dict[str, Any]:
        """Get comprehensive metrics for a journal including all OJS data."""
        # Get basic stats
        stats = self.get_journal_stats(journal_path)
        
        # Get recent submissions
        recent_submissions = self.get_published_submissions(journal_path, page=1, items_per_page=10)
        
        # Get issues
        issues = self.get_issues(journal_path, status="published")
        
        # Get sections
        sections = self.get_sections(journal_path)
        
        # Build comprehensive metrics
        metrics = {
            **stats,
            "recent_articles": [],
            "published_issues": 0,
            "sections": [],
            "journal_path": journal_path,
        }
        
        # Process recent submissions
        if recent_submissions and isinstance(recent_submissions, dict):
            items = recent_submissions.get("items", [])
            metrics["recent_articles"] = [
                {
                    "id": item.get("id"),
                    "title": item.get("title", {}).get("en", ""),
                    "status": item.get("status"),
                    "date_published": item.get("datePublished"),
                    "authors": [
                        a.get("fullName", "") 
                        for a in item.get("authors", [])[:3]
                    ],
                }
                for item in items
            ]
        
        # Process issues
        if issues and isinstance(issues, dict):
            metrics["published_issues"] = issues.get("itemsTotalCount", 0)
        
        # Process sections
        if sections:
            metrics["sections"] = [
                {
                    "id": s.get("id"),
                    "title": s.get("title", ""),
                }
                for s in sections
            ]
        
        return metrics

    def get_all_metrics(self) -> Dict[str, Any]:
        """Get metrics for all journals."""
        known_journals = getattr(settings, 'OJS_JOURNALS', [
            {'path': 'innovate-minds', 'id': 1},
            {'path': 'bright-tomorrow', 'id': 2},
        ])
        
        all_metrics = {
            "journals": [],
            "total_articles": 0,
            "total_issues": 0,
            "total_journals": len(known_journals),
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        for journal in known_journals:
            journal_metrics = self.get_journal_metrics(journal['path'])
            all_metrics["journals"].append(journal_metrics)
            all_metrics["total_articles"] += journal_metrics.get("total_articles", 0)
            all_metrics["total_issues"] += journal_metrics.get("total_issues", 0)
        
        return all_metrics

    def get_context_stats(self, journal_path: str, context_id: int) -> Optional[Dict[str, Any]]:
        """Get detailed context/journal statistics from OJS."""
        return self._make_request(
            "GET", f"/index.php/{journal_path}/api/v1/contexts/{context_id}/stats"
        )


# Singleton instance
ojs_service = OJSService()
