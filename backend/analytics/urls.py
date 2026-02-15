"""
URL configuration for analytics API.
"""

from django.urls import path
from . import views
from . import sse

urlpatterns = [
    # Health check
    path('health', views.health_check, name='health_check'),

    # Dashboard
    path('dashboard', views.dashboard, name='dashboard'),

    # KPIs
    path('kpi', views.kpi_summary, name='kpi_summary'),

    # Real-time
    path('realtime', views.realtime_visits, name='realtime_visits'),
    path('live-metrics', views.live_metrics, name='live_metrics'),

    # Content Analytics
    path('top-articles', views.top_articles, name='top_articles'),
    path('downloads', views.downloads, name='downloads'),

    # Geo
    path('countries', views.countries, name='countries'),
    path('geo-heatmap', views.geo_heatmap, name='geo_heatmap'),

    # Devices
    path('devices', views.devices, name='devices'),

    # Referrers
    path('referrers', views.referrers, name='referrers'),

    # Trends
    path('trends', views.trends, name='trends'),

    # Trending
    path('trending', views.trending, name='trending'),

    # Tracking
    path('track/view', views.track_article_view, name='track_view'),
    path('track/download', views.track_article_download, name='track_download'),

    # Article metrics
    path('article/<str:article_id>/metrics', views.article_metrics, name='article_metrics'),

    # OJS Content Proxy
    path('ojs/journals', views.ojs_journals, name='ojs_journals'),
    path('ojs/<str:journal_path>/issues', views.ojs_issues, name='ojs_issues'),
    path('ojs/<str:journal_path>/submissions', views.ojs_submissions, name='ojs_submissions'),
    path('ojs/<str:journal_path>/article/<int:article_id>', views.ojs_article, name='ojs_article'),
    path('ojs/<str:journal_path>/stats', views.ojs_stats, name='ojs_stats'),
    path('ojs/<str:journal_path>/metrics', views.ojs_journal_metrics, name='ojs_journal_metrics'),
    path('ojs/<str:journal_path>/article/<int:article_id>/metrics', views.ojs_article_metrics, name='ojs_article_metrics'),
    path('ojs/all-metrics', views.ojs_all_metrics, name='ojs_all_metrics'),

    # Citations
    path('citations/search', views.search_citations, name='search_citations'),
    path('citations/article/<str:article_id>', views.article_citations, name='article_citations'),
    path('citations/update', views.update_citations, name='update_citations'),

    # All Metrics (Combined Dashboard)
    path('all-metrics', views.all_metrics, name='all_metrics'),

    # SSE for real-time
    path('sse', sse.sse_stream, name='sse_stream'),
    path('events', sse.events_stream, name='events_stream'),
]
