"""
Server-Sent Events endpoint for real-time updates.
"""

import json
import logging
from django.http import StreamingHttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .services import redis_service, matomo_service

logger = logging.getLogger(__name__)


def sse_format(data: dict) -> str:
    """Format data as SSE message."""
    return f"data: {json.dumps(data)}\n\n"


@api_view(['GET'])
def sse_stream(request):
    """
    Server-Sent Events endpoint for real-time analytics.

    Clients connect to this endpoint to receive live updates
    on views, downloads, and other metrics.
    """

    def event_stream():
        """Generator for SSE stream."""
        try:
            # Send initial data
            live_metrics = {
                "realtime_count": matomo_service.get_realtime_count() or 0,
                "total_views": redis_service.get_total_views(),
                "total_downloads": redis_service.get_total_downloads(),
            }
            yield sse_format({"type": "initial", "data": live_metrics})

            # Keep connection open and periodically send updates
            import time
            while True:
                # Get fresh data
                live_metrics = {
                    "realtime_count": matomo_service.get_realtime_count() or 0,
                    "total_views": redis_service.get_total_views(),
                    "total_downloads": redis_service.get_total_downloads(),
                    "timestamp": __import__('datetime').datetime.utcnow().isoformat(),
                }
                yield sse_format({"type": "metrics", "data": live_metrics})

                # Wait before next update (5 seconds)
                time.sleep(5)

        except GeneratorExit:
            logger.info("SSE client disconnected")
        except Exception as e:
            logger.error(f"SSE error: {e}")
            yield sse_format({"type": "error", "message": str(e)})

    response = StreamingHttpResponse(
        event_stream(),
        content_type='text/event-stream'
    )
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'

    return response


@api_view(['GET'])
def events_stream(request):
    """
    Alternative SSE endpoint that also subscribes to Redis pub/sub.
    """

    def event_stream():
        """Generator for SSE stream with Redis pub/sub."""
        import time

        try:
            # Send initial data
            live_metrics = {
                "realtime_count": matomo_service.get_realtime_count() or 0,
                "total_views": redis_service.get_total_views(),
                "total_downloads": redis_service.get_total_downloads(),
            }
            yield sse_format({"type": "initial", "data": live_metrics})

            # Poll for updates (since we're using streaming HTTP)
            last_metrics = live_metrics.copy()

            while True:
                time.sleep(5)

                # Get current metrics
                current_metrics = {
                    "realtime_count": matomo_service.get_realtime_count() or 0,
                    "total_views": redis_service.get_total_views(),
                    "total_downloads": redis_service.get_total_downloads(),
                    "timestamp": __import__('datetime').datetime.utcnow().isoformat(),
                }

                # Only send if changed
                if current_metrics != last_metrics:
                    yield sse_format({"type": "metrics", "data": current_metrics})
                    last_metrics = current_metrics

        except GeneratorExit:
            logger.info("SSE client disconnected")
        except Exception as e:
            logger.error(f"SSE error: {e}")
            yield sse_format({"type": "error", "message": str(e)})

    response = StreamingHttpResponse(
        event_stream(),
        content_type='text/event-stream'
    )
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'

    return response
