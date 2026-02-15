"""
Django management command to update citations for all articles.
This should be run daily via cron or celery beat.

Usage:
    python manage.py update_citations
    python manage.py update_citations --force  # Force refresh all citations
"""

import logging
from django.core.management.base import BaseCommand
from analytics.services.citation_service import citation_tracker

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Update citations for all articles in OJS'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force refresh all citations instead of using cache',
        )

    def handle(self, *args, **options):
        force = options.get('force', False)
        
        self.stdout.write('Starting citation update...')
        
        try:
            # Note: The tracker already forces refresh when called
            result = citation_tracker.update_all_citations()
            
            self.stdout.write(self.style.SUCCESS(
                f'\nCitation update complete!'
            ))
            self.stdout.write(f'  Updated: {len(result.get("updated", []))} articles')
            self.stdout.write(f'  Failed: {len(result.get("failed", []))} articles')
            self.stdout.write(f'  Total processed: {result.get("total", 0)}')
            self.stdout.write(f'  Timestamp: {result.get("timestamp")}')
            
            if result.get("failed"):
                self.stdout.write(self.style.WARNING(
                    f'\nFailed articles:'
                ))
                for title in result.get("failed", [])[:10]:
                    self.stdout.write(f'  - {title}')
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error updating citations: {e}'))
            logger.error(f'Citation update failed: {e}')
            raise
