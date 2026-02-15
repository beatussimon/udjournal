"""
Tests for Matomo service.
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
import responses


class TestMatomoService:
    """Tests for MatomoService."""

    def test_is_configured(self):
        """Test Matomo configuration check."""
        from analytics.services.matomo_service import MatomoService

        with patch('analytics.services.matomo_service.settings') as mock_settings:
            mock_settings.MATOMO_TOKEN = "test_token"
            mock_settings.MATOMO_BASE_URL = "http://matomo:8085"
            mock_settings.MATOMO_SITE_ID = 1

            service = MatomoService()
            assert service.is_configured is True

    def test_is_not_configured(self):
        """Test Matomo configuration check when not configured."""
        from analytics.services.matomo_service import MatomoService

        with patch('analytics.services.matomo_service.settings') as mock_settings:
            mock_settings.MATOMO_TOKEN = ""
            mock_settings.MATOMO_BASE_URL = "http://matomo:8085"

            service = MatomoService()
            assert service.is_configured is False

    @responses.activate
    def test_get_kpi_summary(self):
        """Test getting KPI summary."""
        from analytics.services.matomo_service import MatomoService

        mock_response = {
            "nb_visits": 100,
            "nb_uniq_visitors": 50,
            "nb_actions": 500,
            "avg_time_on_site": 120,
            "bounce_rate": 30.0,
        }

        responses.add(
            responses.POST,
            "http://matomo:8085/index.php",
            json=mock_response,
            status=200,
        )

        with patch('analytics.services.matomo_service.settings') as mock_settings:
            mock_settings.MATOMO_TOKEN = "test_token"
            mock_settings.MATOMO_BASE_URL = "http://matomo:8085/index.php"
            mock_settings.MATOMO_SITE_ID = 1

            service = MatomoService()
            result = service.get_kpi_summary("day", "today")

            assert result == mock_response

    @responses.activate
    def test_get_top_articles(self):
        """Test getting top articles."""
        from analytics.services.matomo_service import MatomoService

        mock_response = [
            {"label": "Article 1", "nb_hits": 100},
            {"label": "Article 2", "nb_hits": 50},
        ]

        responses.add(
            responses.POST,
            "http://matomo:8085/index.php",
            json=mock_response,
            status=200,
        )

        with patch('analytics.services.matomo_service.settings') as mock_settings:
            mock_settings.MATOMO_TOKEN = "test_token"
            mock_settings.MATOMO_BASE_URL = "http://matomo:8085/index.php"
            mock_settings.MATOMO_SITE_ID = 1

            service = MatomoService()
            result = service.get_top_articles("week", "today", 10)

            assert len(result) == 2
            assert result[0]["label"] == "Article 1"

    @responses.activate
    def test_get_countries(self):
        """Test getting country data."""
        from analytics.services.matomo_service import MatomoService

        mock_response = [
            {"label": "Tanzania", "nb_visits": 100, "code": "TZ"},
            {"label": "Kenya", "nb_visits": 50, "code": "KE"},
        ]

        responses.add(
            responses.POST,
            "http://matomo:8085/index.php",
            json=mock_response,
            status=200,
        )

        with patch('analytics.services.matomo_service.settings') as mock_settings:
            mock_settings.MATOMO_TOKEN = "test_token"
            mock_settings.MATOMO_BASE_URL = "http://matomo:8085/index.php"
            mock_settings.MATOMO_SITE_ID = 1

            service = MatomoService()
            result = service.get_countries("month", "today")

            assert len(result) == 2
            assert result[0]["label"] == "Tanzania"

    @responses.activate
    def test_get_downloads(self):
        """Test getting download data."""
        from analytics.services.matomo_service import MatomoService

        mock_response = [
            {"label": "paper.pdf", "nb_hits": 50},
        ]

        responses.add(
            responses.POST,
            "http://matomo:8085/index.php",
            json=mock_response,
            status=200,
        )

        with patch('analytics.services.matomo_service.settings') as mock_settings:
            mock_settings.MATOMO_TOKEN = "test_token"
            mock_settings.MATOMO_BASE_URL = "http://matomo:8085/index.php"
            mock_settings.MATOMO_SITE_ID = 1

            service = MatomoService()
            result = service.get_downloads("month", "today", 20)

            assert len(result) == 1
            assert result[0]["label"] == "paper.pdf"

    @responses.activate
    def test_get_devices(self):
        """Test getting device data."""
        from analytics.services.matomo_service import MatomoService

        mock_response = [
            {"label": "Desktop", "nb_visits": 60},
            {"label": "Mobile", "nb_visits": 30},
            {"label": "Tablet", "nb_visits": 10},
        ]

        responses.add(
            responses.POST,
            "http://matomo:8085/index.php",
            json=mock_response,
            status=200,
        )

        with patch('analytics.services.matomo_service.settings') as mock_settings:
            mock_settings.MATOMO_TOKEN = "test_token"
            mock_settings.MATOMO_BASE_URL = "http://matomo:8085/index.php"
            mock_settings.MATOMO_SITE_ID = 1

            service = MatomoService()
            result = service.get_devices("month", "today")

            assert len(result) == 3
            assert result[0]["label"] == "Desktop"

    @responses.activate
    def test_matomo_timeout(self):
        """Test handling Matomo timeout."""
        import requests
        from analytics.services.matomo_service import MatomoService

        responses.add(
            responses.POST,
            "http://matomo:8085/index.php",
            body=requests.Timeout(),
        )

        with patch('analytics.services.matomo_service.settings') as mock_settings:
            mock_settings.MATOMO_TOKEN = "test_token"
            mock_settings.MATOMO_BASE_URL = "http://matomo:8085/index.php"
            mock_settings.MATOMO_SITE_ID = 1

            service = MatomoService()
            result = service.get_kpi_summary("day", "today")

            assert result is None

    @responses.activate
    def test_get_realtime_count(self):
        """Test getting real-time visitor count."""
        from analytics.services.matomo_service import MatomoService

        mock_response = [{"visits": 15}]

        responses.add(
            responses.POST,
            "http://matomo:8085/index.php",
            json=mock_response,
            status=200,
        )

        with patch('analytics.services.matomo_service.settings') as mock_settings:
            mock_settings.MATOMO_TOKEN = "test_token"
            mock_settings.MATOMO_BASE_URL = "http://matomo:8085/index.php"
            mock_settings.MATOMO_SITE_ID = 1

            service = MatomoService()
            result = service.get_realtime_count()

            assert result == 15
