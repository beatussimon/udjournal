"""
Citation service for tracking article citations using Serper API.
"""

import logging
import requests
from typing import Dict, Any, Optional, List
from django.conf import settings
from django.utils import timezone
from datetime import datetime, timedelta
import hashlib
import json

logger = logging.getLogger(__name__)


class CitationService:
    """Service for tracking article citations using Serper API."""

    def __init__(self):
        self.api_key = settings.SERPER_API_KEY
        self.base_url = "https://google.serper.dev/search"
        self.citations_url = "https://google.serper.dev/citations"
        self.cache_ttl = 86400  # 24 hours

    @property
    def is_configured(self) -> bool:
        """Check if Serper API is properly configured."""
        return bool(self.api_key)

    def _get_headers(self) -> Dict[str, str]:
        """Get headers for Serper API requests."""
        return {
            "X-API-Key": self.api_key,
            "Content-Type": "application/json",
        }

    def _cache_key(self, query: str) -> str:
        """Generate cache key for a query."""
        query_hash = hashlib.md5(query.encode()).hexdigest()
        return f"citation_cache:{query_hash}"

    def search_citations(
        self,
        article_title: str,
        author: str = None,
        journal: str = None,
        use_citations: bool = True,
    ) -> Optional[Dict[str, Any]]:
        """
        Search for citations of an article using Serper API.
        
        Uses advanced filters for best results:
        - Citation search mode
        - Site-specific search for academic sources
        - Author and journal filters
        """
        if not self.is_configured:
            logger.warning("Serper API is not configured")
            return None

        # Build search query with advanced filters
        query_parts = [article_title]
        
        if author:
            query_parts.append(f'author:"{author}"')
        
        if journal:
            query_parts.append(f'site:{journal}')
        
        # Use citation-specific search
        query = " ".join(query_parts)

        try:
            # Use citations endpoint for scholarly results
            if use_citations:
                response = requests.post(
                    self.citations_url,
                    headers=self._get_headers(),
                    json={
                        "q": query,
                        "num": 20,
                    },
                    timeout=30,
                )
            else:
                # Fallback to regular search with citation filters
                response = requests.post(
                    self.base_url,
                    headers=self._get_headers(),
                    json={
                        "q": query,
                        "num": 20,
                        "filter": "1",  # Remove duplicates
                    },
                    timeout=30,
                )

            response.raise_for_status()
            data = response.json()

            # Process results
            return self._process_citation_results(data, article_title)

        except requests.exceptions.Timeout:
            logger.error(f"Serper API request timed out for: {article_title}")
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"Serper API request failed: {e}")
            return None
        except ValueError as e:
            logger.error(f"Invalid JSON response from Serper: {e}")
            return None

    def _process_citation_results(
        self, data: Dict[str, Any], article_title: str
    ) -> Dict[str, Any]:
        """Process Serper API citation results."""
        
        results = {
            "article_title": article_title,
            "search_time": datetime.utcnow().isoformat(),
            "citations": [],
            "total_results": 0,
            "sources": [],
        }

        # Extract citations if available
        if "citations" in data:
            results["citations"] = [
                {
                    "title": cit.get("title", ""),
                    "link": cit.get("link", ""),
                    "snippet": cit.get("snippet", ""),
                    "cited_by": cit.get("cited_by", 0),
                    "year": cit.get("year", ""),
                    "authors": cit.get("authors", []),
                    "venue": cit.get("venue", ""),
                }
                for cit in data.get("citations", [])
            ]
            results["total_results"] = len(results["citations"])

        # Extract organic results
        if "organic" in data:
            for item in data.get("organic", [])[:10]:
                results["sources"].append({
                    "title": item.get("title", ""),
                    "link": item.get("link", ""),
                    "snippet": item.get("snippet", ""),
                    "position": item.get("position", 0),
                })

        # Calculate citation metrics
        results["citation_count"] = sum(
            cit.get("cited_by", 0) for cit in results["citations"]
        )

        return results

    def get_article_citations(
        self,
        article_title: str,
        author: str = None,
        journal: str = None,
        force_refresh: bool = False,
    ) -> Optional[Dict[str, Any]]:
        """
        Get citations for an article with caching.
        
        Args:
            article_title: Title of the article
            author: Author name (optional)
            journal: Journal name (optional)
            force_refresh: Force cache refresh
        """
        from .redis_service import redis_service

        cache_key = self._cache_key(article_title)

        # Check cache if not forcing refresh
        if not force_refresh:
            cached = redis_service.redis.get(cache_key)
            if cached:
                try:
                    return json.loads(cached)
                except:
                    pass

        # Fetch fresh data
        result = self.search_citations(article_title, author, journal)

        if result:
            # Cache the result
            try:
                redis_service.redis.setex(
                    cache_key,
                    self.cache_ttl,
                    json.dumps(result),
                )
            except Exception as e:
                logger.warning(f"Failed to cache citation result: {e}")

        return result

    def get_citations_for_articles(
        self,
        articles: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Get citations for multiple articles.
        
        Args:
            articles: List of article dicts with 'title', 'author', 'journal' keys
        """
        results = []

        for article in articles:
            title = article.get("title")
            if not title:
                continue

            result = self.get_article_citations(
                article_title=title,
                author=article.get("author"),
                journal=article.get("journal"),
            )

            if result:
                results.append({
                    "article_id": article.get("id"),
                    "article_title": title,
                    "citations": result.get("citations", []),
                    "citation_count": result.get("citation_count", 0),
                    "total_results": result.get("total_results", 0),
                    "search_time": result.get("search_time"),
                })

        return results


class CitationTracker:
    """Daily citation tracking and updates."""

    def __init__(self):
        self.citation_service = CitationService()

    def update_all_citations(self) -> Dict[str, Any]:
        """
        Update citations for all tracked articles.
        This should be run daily via cron or Celery beat.
        """
        from .ojs_service import ojs_service
        from .redis_service import redis_service

        results = {
            "updated": [],
            "failed": [],
            "total": 0,
        }

        # Get all known journals
        journals = getattr(settings, 'OJS_JOURNALS', [
            {'path': 'innovate-minds', 'id': 1},
            {'path': 'bright-tomorrow', 'id': 2},
        ])

        for journal in journals:
            # Get published submissions
            submissions = ojs_service.get_published_submissions(
                journal['path'], items_per_page=50
            )

            if not submissions or not submissions.get("items"):
                continue

            for item in submissions["items"]:
                article_title = item.get("title", {}).get("en", "")
                if not article_title:
                    continue

                # Extract authors
                authors = item.get("authors", [])
                author_name = authors[0].get("fullName", "") if authors else None

                # Get citation result
                citation_result = self.citation_service.get_article_citations(
                    article_title=article_title,
                    author=author_name,
                    journal=journal.get('path'),
                    force_refresh=True,  # Force update
                )

                if citation_result:
                    # Store in Redis for quick access
                    article_id = item.get("id")
                    if article_id:
                        redis_service.redis.hset(
                            f"article:{article_id}:citations",
                            mapping={
                                "citation_count": citation_result.get("citation_count", 0),
                                "total_results": citation_result.get("total_results", 0),
                                "last_updated": datetime.utcnow().isoformat(),
                                "data": json.dumps(citation_result),
                            },
                        )
                        redis_service.redis.expire(
                            f"article:{article_id}:citations", 
                            86400 * 2  # 2 days TTL
                        )

                    results["updated"].append(article_title)
                else:
                    results["failed"].append(article_title)

                results["total"] += 1

        results["timestamp"] = datetime.utcnow().isoformat()
        return results


# Singleton instances
citation_service = CitationService()
citation_tracker = CitationTracker()
