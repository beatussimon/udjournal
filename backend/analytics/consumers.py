"""
WebSocket consumers for real-time analytics.
"""

import json
import asyncio
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

logger = logging.getLogger(__name__)


class AnalyticsConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time analytics updates."""

    async def connect(self):
        self.room_group_name = "analytics"

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Send initial data
        await self.send_initial_data()

        logger.info(f"WebSocket connected: {self.channel_name}")

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        logger.info(f"WebSocket disconnected: {self.channel_name}")

    async def receive(self, text_data):
        """Handle incoming messages from WebSocket."""
        try:
            data = json.loads(text_data)
            message_type = data.get("type")

            if message_type == "ping":
                await self.send(text_data=json.dumps({"type": "pong"}))

        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
        except Exception as e:
            logger.error(f"Error processing message: {e}")

    async def send_initial_data(self):
        """Send initial data on connection."""
        from .services import redis_service, matomo_service

        try:
            # Get live metrics
            live_metrics = {
                "realtime_count": matomo_service.get_realtime_count() or 0,
                "total_views": redis_service.get_total_views(),
                "total_downloads": redis_service.get_total_downloads(),
            }

            await self.send(text_data=json.dumps({
                "type": "initial_data",
                "data": live_metrics
            }))
        except Exception as e:
            logger.error(f"Error sending initial data: {e}")

    # Handle messages from room group
    async def analytics_update(self, event):
        """Handle analytics update from room group."""
        await self.send(text_data=json.dumps(event["data"]))

    async def view_event(self, event):
        """Handle view event."""
        await self.send(text_data=json.dumps({
            "type": "view",
            "data": event["data"]
        }))

    async def download_event(self, event):
        """Handle download event."""
        await self.send(text_data=json.dumps({
            "type": "download",
            "data": event["data"]
        }))


class ServerSentEventsConsumer(AsyncWebsocketConsumer):
    """Simple SSE consumer using WebSocket."""

    async def send(self, text_data):
        """Send text data through WebSocket."""
        await super().send(text_data)


class SSEConsumer(AsyncWebsocketConsumer):
    """Consumer for Server-Sent Events."""

    async def connect(self):
        self.room_group_name = "analytics"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        logger.info(f"SSE connected: {self.channel_name}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def send_initial_data(self):
        """Send initial data."""
        from .services import redis_service, matomo_service

        live_metrics = {
            "realtime_count": matomo_service.get_realtime_count() or 0,
            "total_views": redis_service.get_total_views(),
            "total_downloads": redis_service.get_total_downloads(),
        }

        await self.send(text_data=f"data: {json.dumps(live_metrics)}\n\n")

    async def analytics_update(self, event):
        """Send analytics update."""
        await self.send(text_data=f"data: {json.dumps(event['data'])}\n\n")
