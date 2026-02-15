"""
API Views for analytics endpoints.
"""

import logging
from datetime import datetime
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .services import redis_service, matomo_service, ojs_service
from .services.citation_service import citation_service, citation_tracker
from .serializers import (
    DashboardSerializer,
    TrendingArticleSerializer,
    LiveMetricsSerializer,
)

logger = logging.getLogger(__name__)


# ============== Health Check ==============

@api_view(['GET'])
def health_check(request):
    """Health check endpoint."""
    return Response({
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "redis": redis_service.is_connected(),
            "matomo": matomo_service.is_configured,
            "ojs": ojs_service.is_configured,
        }
    })


# ============== Dashboard ==============

@api_view(['GET'])
def dashboard(request):
    """
    Get complete analytics dashboard data.
    
    Query params:
    - period: day, week, month, year (default: month)
    - date: today, yesterday, YYYY-MM-DD (default: today)
    """
    period = request.query_params.get('period', 'month')
    date = request.query_params.get('date', 'today')

    # Get Matomo data
    matomo_data = matomo_service.get_dashboard_data(period, date)

    # Get Redis live metrics
    live_metrics = {
        "realtime_count": matomo_service.get_realtime_count() or 0,
        "total_views": redis_service.get_total_views(),
        "total_downloads": redis_service.get_total_downloads(),
        "timestamp": datetime.utcnow().isoformat(),
    }

    # Get trending from Redis
    trending = redis_service.get_trending_articles(limit=10)

    # Combine data
    data = {
        **matomo_data,
        "live_metrics": live_metrics,
        "trending": trending,
    }

    serializer = DashboardSerializer(data)
    return Response(serializer.data)


# ============== KPIs ==============

@api_view(['GET'])
def kpi_summary(request):
    """
    Get KPI summary.
    
    Query params:
    - period: day, week, month, year (default: day)
    - date: today, yesterday, YYYY-MM-DD (default: today)
    """
    period = request.query_params.get('period', 'day')
    date = request.query_params.get('date', 'today')

    data = matomo_service.get_kpi_summary(period, date)
    if data is None:
        return Response(
            {"error": "Failed to fetch KPI data"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    return Response(data)


# ============== Real-time ==============

@api_view(['GET'])
def realtime_visits(request):
    """Get real-time visitor data."""
    max_rows = int(request.query_params.get('max_rows', 10))

    visits = matomo_service.get_realtime_visits(max_rows)
    count = matomo_service.get_realtime_count()

    if visits is None:
        return Response(
            {"error": "Failed to fetch real-time data"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    return Response({
        "count": count,
        "visits": visits,
    })


@api_view(['GET'])
def live_metrics(request):
    """Get live metrics from Redis counters."""
    metrics = {
        "realtime_count": matomo_service.get_realtime_count() or 0,
        "total_views": redis_service.get_total_views(),
        "total_downloads": redis_service.get_total_downloads(),
        "timestamp": datetime.utcnow().isoformat(),
    }

    serializer = LiveMetricsSerializer(metrics)
    return Response(serializer.data)


# ============== Content Analytics ==============

@api_view(['GET'])
def top_articles(request):
    """
    Get top articles by views.
    
    Query params:
    - period: day, week, month, year (default: week)
    - date: today, yesterday, YYYY-MM-DD (default: today)
    - limit: number of results (default: 20)
    """
    period = request.query_params.get('period', 'week')
    date = request.query_params.get('date', 'today')
    limit = int(request.query_params.get('limit', 20))

    articles = matomo_service.get_top_articles(period, date, limit)

    if articles is None:
        return Response(
            {"error": "Failed to fetch top articles"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    return Response({"articles": articles})


@api_view(['GET'])
def downloads(request):
    """
    Get download statistics.
    
    Query params:
    - period: day, week, month, year (default: month)
    - date: today, yesterday, YYYY-MM-DD (default: today)
    - limit: number of results (default: 20)
    """
    period = request.query_params.get('period', 'month')
    date = request.query_params.get('date', 'today')
    limit = int(request.query_params.get('limit', 20))

    downloads = matomo_service.get_downloads(period, date, limit)

    if downloads is None:
        return Response(
            {"error": "Failed to fetch downloads"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    return Response({"downloads": downloads})


# ============== Geo Data ==============

@api_view(['GET'])
def countries(request):
    """
    Get visitor countries.
    
    Query params:
    - period: day, week, month, year (default: month)
    - date: today, yesterday, YYYY-MM-DD (default: today)
    """
    period = request.query_params.get('period', 'month')
    date = request.query_params.get('date', 'today')

    countries = matomo_service.get_countries(period, date)

    if countries is None:
        return Response(
            {"error": "Failed to fetch country data"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    return Response({"countries": countries})


@api_view(['GET'])
def geo_heatmap(request):
    """Get geo data for heatmap visualization."""
    # Get from Matomo
    matomo_countries = matomo_service.get_countries() or []

    # Transform for frontend
    geo_data = [
        {
            "country": c.get("label", "Unknown"),
            "country_code": c.get("code", ""),
            "count": c.get("nb_visits", 0),
        }
        for c in matomo_countries
    ]

    # Also get from Redis for live data
    redis_geo = redis_service.get_geo_data()

    return Response({
        "matomo": geo_data,
        "redis": redis_geo,
    })


# ============== Devices ==============

@api_view(['GET'])
def devices(request):
    """Get device type statistics."""
    period = request.query_params.get('period', 'month')
    date = request.query_params.get('date', 'today')

    devices = matomo_service.get_devices(period, date)

    if devices is None:
        return Response(
            {"error": "Failed to fetch device data"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    return Response({"devices": devices})


# ============== Referrers ==============

@api_view(['GET'])
def referrers(request):
    """Get referrer sources."""
    period = request.query_params.get('period', 'month')
    date = request.query_params.get('date', 'today')

    referrers = matomo_service.get_referrers(period, date)

    if referrers is None:
        return Response(
            {"error": "Failed to fetch referrer data"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    return Response({"referrers": referrers})


# ============== Trends ==============

@api_view(['GET'])
def trends(request):
    """Get visit trends over time."""
    date = request.query_params.get('date', 'last30')

    trends = matomo_service.get_trends(date)

    if trends is None:
        return Response(
            {"error": "Failed to fetch trends"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    return Response(trends)


# ============== Trending ==============

@api_view(['GET'])
def trending(request):
    """Get trending articles from Redis."""
    limit = int(request.query_params.get('limit', 10))

    trending = redis_service.get_trending_articles(limit)

    serializer = TrendingArticleSerializer(trending, many=True)
    return Response({"trending": serializer.data})


@api_view(['POST'])
def track_article_view(request):
    """
    Track article view.
    
    Body:
    - article_id: string
    - journal_id: string (optional)
    """
    article_id = request.data.get('article_id')
    journal_id = request.data.get('journal_id')

    if not article_id:
        return Response(
            {"error": "article_id is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Increment counters
    redis_service.increment_article_views(article_id)
    redis_service.update_trending(article_id, score=1.0)

    if journal_id:
        redis_service.increment_journal_views(journal_id)

    # Publish event
    redis_service.publish_event("analytics:views", {
        "type": "view",
        "article_id": article_id,
        "journal_id": journal_id,
        "timestamp": datetime.utcnow().isoformat(),
    })

    return Response({
        "success": True,
        "article_id": article_id,
        "views": redis_service.get_article_views(article_id),
    })


@api_view(['POST'])
def track_article_download(request):
    """
    Track article download.
    
    Body:
    - article_id: string
    - journal_id: string (optional)
    """
    article_id = request.data.get('article_id')
    journal_id = request.data.get('journal_id')

    if not article_id:
        return Response(
            {"error": "article_id is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Increment counters
    redis_service.increment_article_downloads(article_id)

    # Publish event
    redis_service.publish_event("analytics:downloads", {
        "type": "download",
        "article_id": article_id,
        "journal_id": journal_id,
        "timestamp": datetime.utcnow().isoformat(),
    })

    return Response({
        "success": True,
        "article_id": article_id,
        "downloads": redis_service.get_article_downloads(article_id),
    })


@api_view(['GET'])
def article_metrics(request, article_id):
    """Get metrics for a specific article."""
    period = request.query_params.get('period', 'month')
    date = request.query_params.get('date', 'today')

    # Get from Matomo
    article_url = f"/article/{article_id}"
    matomo_metrics = matomo_service.get_article_metrics(article_url, period, date)

    # Get from Redis
    redis_views = redis_service.get_article_views(article_id)
    redis_downloads = redis_service.get_article_downloads(article_id)

    return Response({
        "article_id": article_id,
        "period": period,
        "matomo": matomo_metrics,
        "realtime": {
            "views": redis_views,
            "downloads": redis_downloads,
        }
    })


# ============== OJS Content Proxy ==============

@api_view(['GET'])
def ojs_journals(request):
    """Get journals from OJS."""
    journals = ojs_service.get_journals()

    if journals is None:
        return Response(
            {"error": "Failed to fetch journals from OJS"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    return Response({"journals": journals})


@api_view(['GET'])
def ojs_issues(request, journal_path):
    """Get issues for a journal from OJS."""
    status_filter = request.query_params.get('status')
    page = int(request.query_params.get('page', 1))

    issues = ojs_service.get_issues(journal_path, status_filter, page)

    if issues is None:
        return Response(
            {"error": "Failed to fetch issues from OJS"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    return Response(issues)


@api_view(['GET'])
def ojs_submissions(request, journal_path):
    """Get submissions for a journal from OJS."""
    status_filter = request.query_params.get('status')
    page = int(request.query_params.get('page', 1))
    items_per_page = int(request.query_params.get('items_per_page', 20))

    submissions = ojs_service.get_submissions(
        journal_path, status_filter, page, items_per_page
    )

    if submissions is None:
        return Response(
            {"error": "Failed to fetch submissions from OJS"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    return Response(submissions)


@api_view(['GET'])
def ojs_article(request, journal_path, article_id):
    """Get a specific article from OJS."""
    article = ojs_service.get_article(journal_path, article_id)

    if article is None:
        return Response(
            {"error": "Failed to fetch article from OJS"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    return Response(article)


@api_view(['GET'])
def ojs_stats(request, journal_path):
    """Get statistics for a journal."""
    stats = ojs_service.get_journal_stats(journal_path)
    return Response(stats)


# ============== Citations ==============

@api_view(['GET'])
def article_citations(request, article_id):
    """
    Get citations for a specific article.
    
    Query params:
    - force_refresh: Force cache refresh (default: false)
    """
    force_refresh = request.query_params.get('force_refresh', 'false').lower() == 'true'
    
    # Try to get from Redis cache first
    from .services.redis_service import redis_service
    import json
    
    cached = redis_service.redis.hgetall(f"article:{article_id}:citations")
    if cached and not force_refresh:
        try:
            data = cached.get(b"data")
            if data:
                return Response({
                    "article_id": article_id,
                    "cached": True,
                    "citation_count": cached.get(b"citation_count", 0),
                    "total_results": cached.get(b"total_results", 0),
                    "last_updated": cached.get(b"last_updated", b"").decode(),
                    "citations": json.loads(data).get("citations", []),
                })
        except Exception as e:
            logger.warning(f"Failed to get cached citations: {e}")
    
    # Get article from OJS
    # We need journal_path to get the article, so we'll search by article_id
    # For now, return error if no journal_path provided
    journal_path = request.query_params.get('journal_path')
    if not journal_path:
        return Response(
            {"error": "journal_path is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    article = ojs_service.get_article(journal_path, int(article_id))
    if not article:
        return Response(
            {"error": "Article not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    article_title = article.get("title", {}).get("en", "")
    authors = article.get("authors", [])
    author_name = authors[0].get("fullName", "") if authors else None
    
    # Get citations
    citations = citation_service.get_article_citations(
        article_title=article_title,
        author=author_name,
        journal=journal_path,
        force_refresh=force_refresh,
    )
    
    if citations is None:
        return Response(
            {"error": "Failed to fetch citations"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    return Response({
        "article_id": article_id,
        "article_title": article_title,
        "author": author_name,
        "cached": False,
        "citation_count": citations.get("citation_count", 0),
        "total_results": citations.get("total_results", 0),
        "citations": citations.get("citations", []),
        "sources": citations.get("sources", []),
        "search_time": citations.get("search_time"),
    })


@api_view(['GET'])
def search_citations(request):
    """
    Search for citations by article title.
    
    Query params:
    - title: Article title (required)
    - author: Author name (optional)
    - journal: Journal name (optional)
    """
    title = request.query_params.get('title')
    author = request.query_params.get('author')
    journal = request.query_params.get('journal')
    
    if not title:
        return Response(
            {"error": "title is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    citations = citation_service.search_citations(
        article_title=title,
        author=author,
        journal=journal,
    )
    
    if citations is None:
        return Response(
            {"error": "Failed to search citations"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    return Response(citations)


@api_view(['POST'])
def update_citations(request):
    """
    Trigger daily citation update for all articles.
    This endpoint should be called daily via cron/celery.
    """
    result = citation_tracker.update_all_citations()
    return Response({
        "success": True,
        "updated": len(result.get("updated", [])),
        "failed": len(result.get("failed", [])),
        "total": result.get("total", 0),
        "timestamp": result.get("timestamp"),
    })


# ============== OJS Comprehensive Metrics ==============

@api_view(['GET'])
def ojs_all_metrics(request):
    """Get comprehensive metrics for all journals."""
    metrics = ojs_service.get_all_metrics()
    return Response(metrics)


@api_view(['GET'])
def ojs_journal_metrics(request, journal_path):
    """Get comprehensive metrics for a specific journal."""
    metrics = ojs_service.get_journal_metrics(journal_path)
    return Response(metrics)


@api_view(['GET'])
def ojs_article_metrics(request, journal_path, article_id):
    """Get detailed metrics for a specific article."""
    metrics = ojs_service.get_article_metrics(journal_path, article_id)
    
    if metrics is None:
        return Response(
            {"error": "Failed to fetch article metrics"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    # Get cached citations if available
    from .services.redis_service import redis_service
    import json
    
    cached_citations = redis_service.redis.hgetall(f"article:{article_id}:citations")
    if cached_citations:
        metrics["citation_count"] = int(cached_citations.get(b"citation_count", 0))
        metrics["citation_last_updated"] = cached_citations.get(b"last_updated", b"").decode()
    
    return Response(metrics)


@api_view(['GET'])
def all_metrics(request):
    """
    Get all metrics including OJS, analytics, and citations.
    This is a comprehensive dashboard endpoint.
    """
    period = request.query_params.get('period', 'month')
    date = request.query_params.get('date', 'today')
    
    # Get Matomo data
    matomo_data = matomo_service.get_dashboard_data(period, date)
    
    # Get OJS metrics
    ojs_metrics = ojs_service.get_all_metrics()
    
    # Get Redis live metrics
    live_metrics = {
        "realtime_count": matomo_service.get_realtime_count() or 0,
        "total_views": redis_service.get_total_views(),
        "total_downloads": redis_service.get_total_downloads(),
        "timestamp": datetime.utcnow().isoformat(),
    }
    
    # Get trending from Redis
    trending = redis_service.get_trending_articles(limit=10)
    
    # Combine all data
    data = {
        "matomo": matomo_data,
        "ojs": ojs_metrics,
        "live_metrics": live_metrics,
        "trending": trending,
        "services": {
            "ojs_configured": ojs_service.is_configured,
            "matomo_configured": matomo_service.is_configured,
            "citations_configured": citation_service.is_configured,
        },
    }
    
    return Response(data)
