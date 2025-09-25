from django.core.management.base import BaseCommand
from django.db.models import Q

from opportunities.models import CrawledOpportunity
from opportunities.crawlers.utils import clean_description, extract_volunteer_events


class Command(BaseCommand):
    help = 'Clean up descriptions of already crawled opportunities'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be cleaned without saving'
        )
        parser.add_argument(
            '--source',
            type=str,
            help='Only clean opportunities from specific source'
        )
    
    def handle(self, *args, **options):
        dry_run = options.get('dry_run')
        source_name = options.get('source')
        
        # Get opportunities to clean
        queryset = CrawledOpportunity.objects.all()
        
        if source_name:
            queryset = queryset.filter(source__name__icontains=source_name)
        
        # Filter for ones that likely need cleaning (contain navigation text)
        nav_keywords = [
            'Skip to main content',
            'Open side bar',
            'Return to our Website',
            'Sign Up Login Help',
            'Get Connected Icon',
            'Facebook Facebook',
        ]
        
        query = Q()
        for keyword in nav_keywords:
            query |= Q(description__icontains=keyword)
        
        opportunities = queryset.filter(query)
        
        self.stdout.write(f'Found {opportunities.count()} opportunities with navigation text')
        
        cleaned_count = 0
        for opp in opportunities:
            old_desc = opp.description
            new_desc = clean_description(old_desc)
            
            if old_desc != new_desc:
                if dry_run:
                    self.stdout.write(f'\nWould clean: {opp.title}')
                    self.stdout.write(f'Old length: {len(old_desc)}')
                    self.stdout.write(f'New length: {len(new_desc)}')
                    if len(new_desc) < 200:
                        self.stdout.write(f'New description: {new_desc}')
                else:
                    opp.description = new_desc
                    opp.save(update_fields=['description'])
                    cleaned_count += 1
        
        if dry_run:
            self.stdout.write(f'\nDry run: Would clean {cleaned_count} descriptions')
        else:
            self.stdout.write(f'\nCleaned {cleaned_count} descriptions')