import logging
from datetime import datetime, timedelta
from importlib import import_module

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from opportunities.models import CrawlerSource


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Crawl nonprofit websites for volunteer opportunities'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--source',
            type=str,
            help='Specific source name to crawl (crawls all active sources if not specified)'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force crawl even if recently crawled'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run crawler without saving results'
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=None,
            help='Limit number of pages to crawl'
        )
    
    def handle(self, *args, **options):
        source_name = options.get('source')
        force_crawl = options.get('force')
        dry_run = options.get('dry_run')
        limit = options.get('limit')
        
        # Configure logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No data will be saved'))
        
        # Get sources to crawl
        sources = self.get_sources_to_crawl(source_name, force_crawl)
        
        if not sources:
            self.stdout.write(self.style.WARNING('No sources to crawl'))
            return
        
        self.stdout.write(f'Found {len(sources)} sources to crawl')
        
        # Crawl each source
        total_stats = {
            'sources_crawled': 0,
            'opportunities_found': 0,
            'opportunities_saved': 0,
            'errors': 0,
        }
        
        for source in sources:
            self.stdout.write(f'\nCrawling {source.name}...')
            
            try:
                # Import and instantiate the crawler class
                crawler_class = self.get_crawler_class(source.crawler_class)
                if not crawler_class:
                    self.stdout.write(
                        self.style.ERROR(f'Crawler class not found: {source.crawler_class}')
                    )
                    continue
                
                crawler = crawler_class(source)
                
                # Apply limit if specified
                if limit:
                    source.max_pages_per_crawl = limit
                
                # Run crawler
                if dry_run:
                    # In dry-run mode, just run the crawl without saving
                    opportunities = crawler.crawl()
                    self.stdout.write(f'Found {len(opportunities)} opportunities (not saved)')
                    stats = {'opportunities_found': len(opportunities)}
                else:
                    stats = crawler.run()
                
                # Update totals
                total_stats['sources_crawled'] += 1
                total_stats['opportunities_found'] += stats.get('opportunities_found', 0)
                total_stats['opportunities_saved'] += stats.get('opportunities_saved', 0)
                total_stats['errors'] += stats.get('errors', 0)
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Completed: Found {stats.get("opportunities_found", 0)}, '
                        f'Saved {stats.get("opportunities_saved", 0)}'
                    )
                )
                
            except Exception as e:
                logger.exception(f'Error crawling {source.name}')
                self.stdout.write(
                    self.style.ERROR(f'Error crawling {source.name}: {str(e)}')
                )
                total_stats['errors'] += 1
        
        # Summary
        self.stdout.write('\n' + '=' * 50)
        self.stdout.write(self.style.SUCCESS('CRAWL SUMMARY:'))
        self.stdout.write(f'Sources crawled: {total_stats["sources_crawled"]}')
        self.stdout.write(f'Opportunities found: {total_stats["opportunities_found"]}')
        self.stdout.write(f'Opportunities saved: {total_stats["opportunities_saved"]}')
        if total_stats['errors'] > 0:
            self.stdout.write(
                self.style.ERROR(f'Errors encountered: {total_stats["errors"]}')
            )
    
    def get_sources_to_crawl(self, source_name=None, force=False):
        """Get list of sources that need crawling"""
        queryset = CrawlerSource.objects.filter(is_active=True)
        
        if source_name:
            queryset = queryset.filter(name__iexact=source_name)
            if not queryset.exists():
                raise CommandError(f'Source not found: {source_name}')
        
        sources = []
        for source in queryset:
            # Check if source needs crawling
            if force or self.source_needs_crawl(source):
                sources.append(source)
            else:
                hours_since = self.hours_since_last_crawl(source)
                self.stdout.write(
                    f'Skipping {source.name} - last crawled {hours_since:.1f} hours ago'
                )
        
        return sources
    
    def source_needs_crawl(self, source):
        """Check if source needs to be crawled based on frequency"""
        if not source.last_crawl_time:
            return True
        
        hours_since = self.hours_since_last_crawl(source)
        return hours_since >= source.crawl_frequency_hours
    
    def hours_since_last_crawl(self, source):
        """Calculate hours since last crawl"""
        if not source.last_crawl_time:
            return float('inf')
        
        time_diff = timezone.now() - source.last_crawl_time
        return time_diff.total_seconds() / 3600
    
    def get_crawler_class(self, class_path):
        """Import and return crawler class"""
        try:
            module_path, class_name = class_path.rsplit('.', 1)
            module = import_module(module_path)
            return getattr(module, class_name)
        except (ImportError, AttributeError) as e:
            logger.error(f'Failed to import crawler class {class_path}: {e}')
            return None