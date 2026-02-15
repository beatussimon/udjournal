"""
Redis service for real-time analytics counters and pub/sub.
"""

import json
import logging
from typing import Optional, List, Dict, Any
from django.conf import settings

try:
    import redis
except ImportError:
    redis = None

logger = logging.getLogger(__name__)


class RedisService:
    """Service for Redis operations - counters, caching, and pub/sub."""

    def __init__(self):
        self._client = None
        self._pubsub = None

    @property
    def client(self):
        """Lazy initialization of Redis client."""
        if self._client is None and redis:
            try:
                self._client = redis.Redis(
                    host=settings.REDIS_HOST,
                    port=settings.REDIS_PORT,
                    db=settings.REDIS_DB,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                )
                # Test connection
                self._client.ping()
            except Exception as e:
                logger.error(f"Failed to connect to Redis: {e}")
                self._client = None
        return self._client

    def is_connected(self) -> bool:
        """Check if Redis is connected."""
        try:
            return self.client is not None and self.client.ping()
        except:
            return False

    # ============== Counter Operations ==============

    def increment_counter(self, key: str, amount: int = 1) -> int:
        """Increment a counter and return the new value."""
        try:
            if self.client:
                return self.client.incrby(key, amount)
        except Exception as e:
            logger.error(f"Failed to increment counter {key}: {e}")
        return 0

    def get_counter(self, key: str) -> int:
        """Get current counter value."""
        try:
            if self.client:
                value = self.client.get(key)
                return int(value) if value else 0
        except Exception as e:
            logger.error(f"Failed to get counter {key}: {e}")
        return 0

    def set_counter(self, key: str, value: int) -> bool:
        """Set counter value."""
        try:
            if self.client:
                self.client.set(key, value)
                return True
        except Exception as e:
            logger.error(f"Failed to set counter {key}: {e}")
        return False

    # ============== Article/Journal Counters ==============

    def get_article_views(self, article_id: str) -> int:
        """Get view count for an article."""
        return self.get_counter(f"article:{article_id}:views")

    def increment_article_views(self, article_id: str) -> int:
        """Increment view count for an article."""
        return self.increment_counter(f"article:{article_id}:views")

    def get_article_downloads(self, article_id: str) -> int:
        """Get download count for an article."""
        return self.get_counter(f"article:{article_id}:downloads")

    def increment_article_downloads(self, article_id: str) -> int:
        """Increment download count for an article."""
        return self.increment_counter(f"article:{article_id}:downloads")

    def get_journal_views(self, journal_id: str) -> int:
        """Get view count for a journal."""
        return self.get_counter(f"journal:{journal_id}:views")

    def increment_journal_views(self, journal_id: str) -> int:
        """Increment view count for a journal."""
        return self.increment_counter(f"journal:{journal_id}:views")

    # ============== Trending Content ==============

    def update_trending(self, article_id: str, score: float = 1.0) -> bool:
        """Update trending score for an article using sorted set."""
        try:
            if self.client:
                self.client.zincrby("trending:articles", score, article_id)
                # Keep only top 100 articles
                self.client.zremrangebyrank("trending:articles", 0, -101)
                return True
        except Exception as e:
            logger.error(f"Failed to update trending: {e}")
        return False

    def get_trending_articles(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get top trending articles."""
        try:
            if self.client:
                results = self.client.zrevrange(
                    "trending:articles", 0, limit - 1, withscores=True
                )
                return [
                    {"article_id": article_id, "score": int(score)}
                    for article_id, score in results
                ]
        except Exception as e:
            logger.error(f"Failed to get trending: {e}")
        return []

    # ============== Geo Data ==============

    def update_geo_count(self, country_code: str) -> bool:
        """Increment country visit count."""
        try:
            if self.client:
                self.client.hincrby("geo:countries", country_code, 1)
                return True
        except Exception as e:
            logger.error(f"Failed to update geo count: {e}")
        return False

    def get_geo_data(self) -> Dict[str, int]:
        """Get all country counts."""
        try:
            if self.client:
                data = self.client.hgetall("geo:countries")
                return {k: int(v) for k, v in data.items()}
        except Exception as e:
            logger.error(f"Failed to get geo data: {e}")
        return {}

    # ============== Caching ==============

    def cache_set(self, key: str, value: Any, ttl: int = 300) -> bool:
        """Set cached value with TTL."""
        try:
            if self.client:
                self.client.setex(key, ttl, json.dumps(value))
                return True
        except Exception as e:
            logger.error(f"Failed to cache set: {e}")
        return False

    def cache_get(self, key: str) -> Optional[Any]:
        """Get cached value."""
        try:
            if self.client:
                value = self.client.get(key)
                if value:
                    return json.loads(value)
        except Exception as e:
            logger.error(f"Failed to cache get: {e}")
        return None

    def cache_delete(self, key: str) -> bool:
        """Delete cached value."""
        try:
            if self.client:
                self.client.delete(key)
                return True
        except Exception as e:
            logger.error(f"Failed to cache delete: {e}")
        return False

    # ============== Pub/Sub for Real-time ==============

    def publish_event(self, channel: str, event: Dict[str, Any]) -> bool:
        """Publish event to channel."""
        try:
            if self.client:
                self.client.publish(channel, json.dumps(event))
                return True
        except Exception as e:
            logger.error(f"Failed to publish event: {e}")
        return False

    def subscribe(self, channel: str):
        """Subscribe to a channel."""
        try:
            if self.client:
                self._pubsub = self.client.pubsub()
                self._pubsub.subscribe(channel)
                return self._pubsub
        except Exception as e:
            logger.error(f"Failed to subscribe: {e}")
        return None

    # ============== Stats ==============

    def get_total_views(self) -> int:
        """Get total views across all articles."""
        try:
            if self.client:
                keys = self.client.keys("article:*:views")
                total = 0
                for key in keys:
                    value = self.client.get(key)
                    total += int(value) if value else 0
                return total
        except Exception as e:
            logger.error(f"Failed to get total views: {e}")
        return 0

    def get_total_downloads(self) -> int:
        """Get total downloads across all articles."""
        try:
            if self.client:
                keys = self.client.keys("article:*:downloads")
                total = 0
                for key in keys:
                    value = self.client.get(key)
                    total += int(value) if value else 0
                return total
        except Exception as e:
            logger.error(f"Failed to get total downloads: {e}")
        return 0

    def get_all_metrics(self) -> Dict[str, Any]:
        """Get all current metrics."""
        return {
            "total_views": self.get_total_views(),
            "total_downloads": self.get_total_downloads(),
            "trending": self.get_trending_articles(),
            "geo": self.get_geo_data(),
        }


# Singleton instance
redis_service = RedisService()
