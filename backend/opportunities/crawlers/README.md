# MishMob Web Crawler System

## Overview

The MishMob web crawler system is designed to automatically discover and import volunteer opportunities from nonprofit websites and volunteer platforms. It respects robots.txt, implements rate limiting, and only accesses publicly available information.

## Architecture

### Core Components

1. **Base Crawler** (`base.py`): Abstract base class providing common functionality
2. **Platform Crawlers**: Specialized crawlers for major volunteer platforms
   - `volunteermatch.py`: Crawler for VolunteerMatch.org
3. **Generic Crawler** (`generic.py`): Heuristic-based crawler for individual nonprofit sites
4. **Utilities** (`utils.py`): Helper functions for data extraction and normalization

### Data Models

- **CrawlerSource**: Defines sources to crawl and their configuration
- **CrawledOpportunity**: Stores raw crawled data for review
- **Opportunity**: Final approved opportunities (existing model)

## Usage

### Running the Crawler

```bash
# Crawl all active sources
python manage.py crawl_nonprofits

# Crawl a specific source
python manage.py crawl_nonprofits --source "VolunteerMatch"

# Force crawl (ignore frequency settings)
python manage.py crawl_nonprofits --force

# Dry run (don't save results)
python manage.py crawl_nonprofits --dry-run

# Limit pages crawled
python manage.py crawl_nonprofits --limit 5
```

### Setting Up Crawler Sources

1. **Via Django Admin**: 
   - Navigate to `/admin/opportunities/crawlersource/`
   - Add new crawler sources with appropriate configuration

2. **Via Fixtures**:
   ```bash
   python manage.py loaddata opportunities/fixtures/crawler_sources.json
   ```

### Creating Custom Crawlers

1. Create a new file in `opportunities/crawlers/`
2. Inherit from `BaseCrawler`
3. Implement required methods:

```python
from .base import BaseCrawler

class MyCustomCrawler(BaseCrawler):
    def crawl(self):
        # Return list of opportunity dictionaries
        pass
    
    def parse_opportunity(self, item):
        # Parse single opportunity item
        pass
```

## Admin Interface

The Django admin provides comprehensive management tools:

### CrawlerSource Admin
- View all crawler sources and their status
- Enable/disable sources
- Configure crawl frequency and rate limits
- View crawl statistics
- Manually trigger crawls

### CrawledOpportunity Admin
- Review crawled opportunities
- Filter by status, quality score, source
- Bulk approve/reject opportunities
- Mark duplicates
- View raw crawled data
- Import approved opportunities

## Workflow

1. **Crawling**: Automated or manual crawl collects opportunities
2. **Quality Scoring**: System assigns quality scores based on data completeness
3. **Review**: Admin users review pending opportunities
4. **Approval**: Approved opportunities can be imported to main platform
5. **Publishing**: Imported opportunities become visible to volunteers

## Configuration

### CrawlerSource Configuration

```json
{
  "keywords": "environment conservation",
  "location": "San Francisco, CA",
  "radius": "25"
}
```

### Rate Limiting
- Default: 1 request per second
- Configurable per source
- Respects robots.txt

## Best Practices

1. **Respect Website Policies**
   - Always check robots.txt
   - Use appropriate User-Agent
   - Implement rate limiting
   - Only access public information

2. **Data Quality**
   - Validate extracted data
   - Check for duplicates
   - Maintain quality scores
   - Review before importing

3. **Error Handling**
   - Log all errors
   - Implement retries with backoff
   - Monitor crawler health
   - Alert on failures

## Monitoring

Check crawler status:
- Last crawl time
- Success/error status
- Opportunities found
- Import statistics

View logs:
```bash
tail -f logs/crawler.log
```

## Troubleshooting

### Common Issues

1. **No opportunities found**
   - Check if website structure changed
   - Verify selectors in crawler
   - Check robots.txt compliance

2. **Rate limiting errors**
   - Increase delay between requests
   - Check if IP is blocked
   - Use rotating user agents

3. **Parsing errors**
   - Update selectors
   - Handle edge cases
   - Add error logging

### Debug Mode

Run with increased logging:
```bash
python manage.py crawl_nonprofits --verbosity 2
```

## Extending the System

### Adding New Platforms

1. Study platform's HTML structure
2. Create platform-specific crawler
3. Map data to MishMob schema
4. Add source to database
5. Test and monitor

### Improving Data Extraction

- Use NLP for better text analysis
- Implement ML for categorization
- Add geocoding for addresses
- Enhance skill extraction

## Ethical Considerations

- Only crawl public information
- Respect opt-out requests
- Maintain transparency
- Provide value to nonprofits
- Support the volunteer ecosystem