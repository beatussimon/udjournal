"""
DRF Serializers for analytics data.
"""

from rest_framework import serializers


class KPIResponseSerializer(serializers.Serializer):
    """Serializer for KPI summary data."""
    nb_visits = serializers.IntegerField(required=False)
    nb_uniq_visitors = serializers.IntegerField(required=False)
    nb_actions = serializers.IntegerField(required=False)
    avg_time_on_site = serializers.IntegerField(required=False)
    bounce_rate = serializers.FloatField(required=False)


class ArticleMetricSerializer(serializers.Serializer):
    """Serializer for article metrics."""
    id = serializers.CharField()
    title = serializers.CharField(required=False)
    url = serializers.CharField(required=False)
    nb_hits = serializers.IntegerField(required=False)
    nb_visits = serializers.IntegerField(required=False)
    sum_time_spent = serializers.IntegerField(required=False)


class DownloadSerializer(serializers.Serializer):
    """Serializer for download data."""
    id = serializers.CharField()
    label = serializers.CharField()
    nb_hits = serializers.IntegerField(required=False)
    nb_visits = serializers.IntegerField(required=False)


class CountrySerializer(serializers.Serializer):
    """Serializer for country data."""
    label = serializers.CharField()
    nb_visits = serializers.IntegerField()
    nb_uniq_visitors = serializers.IntegerField(required=False)


class DeviceSerializer(serializers.Serializer):
    """Serializer for device data."""
    label = serializers.CharField()
    nb_visits = serializers.IntegerField()


class ReferrerSerializer(serializers.Serializer):
    """Serializer for referrer data."""
    label = serializers.CharField()
    nb_visits = serializers.IntegerField()


class TrendingArticleSerializer(serializers.Serializer):
    """Serializer for trending articles."""
    article_id = serializers.CharField()
    score = serializers.IntegerField()


class GeoDataSerializer(serializers.Serializer):
    """Serializer for geo data."""
    country = serializers.CharField()
    count = serializers.IntegerField()


class RealtimeVisitSerializer(serializers.Serializer):
    """Serializer for real-time visit data."""
    id = serializers.CharField()
    ip = serializers.CharField(required=False)
    country = serializers.CharField(required=False)
    city = serializers.CharField(required=False)
    device = serializers.CharField(required=False)
    browser = serializers.CharField(required=False)
    os = serializers.CharField(required=False)
    last_action_timestamp = serializers.IntegerField(required=False)
    page_title = serializers.CharField(required=False)
    page_url = serializers.CharField(required=False)


class LiveMetricsSerializer(serializers.Serializer):
    """Serializer for live metrics."""
    realtime_count = serializers.IntegerField()
    total_views = serializers.IntegerField()
    total_downloads = serializers.IntegerField()
    timestamp = serializers.DateTimeField()


class DashboardSerializer(serializers.Serializer):
    """Serializer for complete dashboard data."""
    kpi = KPIResponseSerializer(required=False)
    realtime_count = serializers.IntegerField(required=False)  # May be in live_metrics
    top_articles = ArticleMetricSerializer(many=True, required=False)
    downloads = DownloadSerializer(many=True, required=False)
    countries = CountrySerializer(many=True, required=False)
    devices = DeviceSerializer(many=True, required=False)
    referrers = ReferrerSerializer(many=True, required=False)
    trends = serializers.DictField(required=False)
    live_metrics = LiveMetricsSerializer(required=False)
    trending = TrendingArticleSerializer(many=True, required=False)


# OJS Serializers

class JournalSerializer(serializers.Serializer):
    """Serializer for OJS journal data."""
    id = serializers.IntegerField()
    url_path = serializers.CharField(required=False)
    name = serializers.CharField()
    description = serializers.CharField(required=False)


class IssueSerializer(serializers.Serializer):
    """Serializer for OJS issue data."""
    id = serializers.IntegerField()
    volume = serializers.IntegerField(required=False)
    number = serializers.CharField(required=False)
    year = serializers.IntegerField(required=False)
    date_published = serializers.CharField(required=False)
    title = serializers.CharField(required=False)


class SubmissionSerializer(serializers.Serializer):
    """Serializer for OJS submission/article data."""
    id = serializers.IntegerField()
    title = serializers.CharField()
    abstract = serializers.CharField(required=False)
    status = serializers.CharField()
    date_published = serializers.CharField(required=False)
    authors = serializers.ListField(required=False)


# Counter serializers

class ArticleCounterSerializer(serializers.Serializer):
    """Serializer for article counter."""
    article_id = serializers.CharField()
    views = serializers.IntegerField()
    downloads = serializers.IntegerField()


class JournalCounterSerializer(serializers.Serializer):
    """Serializer for journal counter."""
    journal_id = serializers.CharField()
    views = serializers.IntegerField()
