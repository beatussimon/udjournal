"""
Tests for API views.
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from django.test import TestCase, override_settings


class TestHealthCheck:
    """Tests for health check endpoint."""

    def test_health_check(self):
        """Test health check returns correct status."""
        from analytics.views import health_check

        with patch('analytics.views.redis_service') as mock_redis, \
             patch('analytics.views.matomo_service') as mock_matomo, \
             patch('analytics.views.ojs_service') as mock_ojs:

            mock_redis.is_connected.return_value = True
            mock_matomo.is_configured = True
            mock_ojs.is_configured = True

            # Create mock request
            mock_request = Mock()

            # Call view
            from rest_framework.test import APIRequestFactory
            factory = APIRequestFactory()
            request = factory.get('/api/health')
            response = health_check(request)

            assert response.status_code == 200
            data = response.data
            assert data['status'] == 'ok'
            assert data['services']['redis'] is True


class TestDashboard:
    """Tests for dashboard endpoint."""

    def test_dashboard_returns_data(self):
        """Test dashboard returns analytics data."""
        from analytics.views import dashboard

        with patch('analytics.views.matomo_service') as mock_matomo, \
             patch('analytics.views.redis_service') as mock_redis:

            mock_matomo.get_dashboard_data.return_value = {
                "kpi": {"nb_visits": 100},
                "top_articles": [],
                "countries": [],
            }
            mock_matomo.get_realtime_count.return_value = 5
            mock_redis.get_total_views.return_value = 1000
            mock_redis.get_total_downloads.return_value = 500
            mock_redis.get_trending_articles.return_value = []

            from rest_framework.test import APIRequestFactory
            factory = APIRequestFactory()
            request = factory.get('/api/dashboard')
            response = dashboard(request)

            assert response.status_code == 200
            assert 'live_metrics' in response.data


class TestKPIs:
    """Tests for KPI endpoints."""

    def test_kpi_summary(self):
        """Test KPI summary endpoint."""
        from analytics.views import kpi_summary

        with patch('analytics.views.matomo_service') as mock_matomo:
            mock_matomo.get_kpi_summary.return_value = {
                "nb_visits": 100,
                "nb_uniq_visitors": 50,
            }

            from rest_framework.test import APIRequestFactory
            factory = APIRequestFactory()
            request = factory.get('/api/kpi')
            response = kpi_summary(request)

            assert response.status_code == 200


class TestLiveMetrics:
    """Tests for live metrics endpoint."""

    def test_live_metrics(self):
        """Test live metrics endpoint."""
        from analytics.views import live_metrics

        with patch('analytics.views.matomo_service') as mock_matomo, \
             patch('analytics.views.redis_service') as mock_redis:

            mock_matomo.get_realtime_count.return_value = 10
            mock_redis.get_total_views.return_value = 1000
            mock_redis.get_total_downloads.return_value = 500

            from rest_framework.test import APIRequestFactory
            factory = APIRequestFactory()
            request = factory.get('/api/live-metrics')
            response = live_metrics(request)

            assert response.status_code == 200
            data = response.data
            assert data['realtime_count'] == 10
            assert data['total_views'] == 1000
            assert data['total_downloads'] == 500


class TestTracking:
    """Tests for tracking endpoints."""

    def test_track_article_view(self):
        """Test tracking article view."""
        from analytics.views import track_article_view

        with patch('analytics.views.redis_service') as mock_redis:
            mock_redis.increment_article_views.return_value = 1
            mock_redis.update_trending.return_value = True
            mock_redis.publish_event.return_value = True
            mock_redis.get_article_views.return_value = 1

            from rest_framework.test import APIRequestFactory
            factory = APIRequestFactory()
            request = factory.post(
                '/api/track/view',
                {'article_id': 'test-article-123'},
                format='json'
            )
            response = track_article_view(request)

            assert response.status_code == 200
            assert response.data['success'] is True
            assert response.data['article_id'] == 'test-article-123'

    def test_track_article_view_missing_id(self):
        """Test tracking article view without article_id."""
        from analytics.views import track_article_view

        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        request = factory.post(
            '/api/track/view',
            {},
            format='json'
        )
        response = track_article_view(request)

        assert response.status_code == 400

    def test_track_article_download(self):
        """Test tracking article download."""
        from analytics.views import track_article_download

        with patch('analytics.views.redis_service') as mock_redis:
            mock_redis.increment_article_downloads.return_value = 1
            mock_redis.publish_event.return_value = True
            mock_redis.get_article_downloads.return_value = 1

            from rest_framework.test import APIRequestFactory
            factory = APIRequestFactory()
            request = factory.post(
                '/api/track/download',
                {'article_id': 'test-article-123'},
                format='json'
            )
            response = track_article_download(request)

            assert response.status_code == 200
            assert response.data['success'] is True


class TestTrending:
    """Tests for trending endpoint."""

    def test_trending(self):
        """Test trending endpoint."""
        from analytics.views import trending

        with patch('analytics.views.redis_service') as mock_redis:
            mock_redis.get_trending_articles.return_value = [
                {"article_id": "article-1", "score": 100},
                {"article_id": "article-2", "score": 50},
            ]

            from rest_framework.test import APIRequestFactory
            factory = APIRequestFactory()
            request = factory.get('/api/trending')
            response = trending(request)

            assert response.status_code == 200
            assert len(response.data['trending']) == 2


class TestGeoHeatmap:
    """Tests for geo heatmap endpoint."""

    def test_geo_heatmap(self):
        """Test geo heatmap endpoint."""
        from analytics.views import geo_heatmap

        with patch('analytics.views.matomo_service') as mock_matomo, \
             patch('analytics.views.redis_service') as mock_redis:

            mock_matomo.get_countries.return_value = [
                {"label": "Tanzania", "code": "TZ", "nb_visits": 100},
                {"label": "Kenya", "code": "KE", "nb_visits": 50},
            ]
            mock_redis.get_geo_data.return_value = {"TZ": 20, "KE": 10}

            from rest_framework.test import APIRequestFactory
            factory = APIRequestFactory()
            request = factory.get('/api/geo-heatmap')
            response = geo_heatmap(request)

            assert response.status_code == 200
            assert 'matomo' in response.data
            assert 'redis' in response.data
