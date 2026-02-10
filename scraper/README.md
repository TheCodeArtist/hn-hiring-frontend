# HN Job Scraper

A lightweight script for scraping job postings from Hacker News "Who's hiring?" threads using the official Hacker News API.

## Overview

### `hn-api-scraper.py` - API-Based Scraper

This script uses the official Hacker News API to fetch job postings. It focuses purely on data collection without any AI/LLM processing.

**Features:**
- ✅ Uses official HN API (no HTML parsing)
- ✅ Async/concurrent requests for speed
- ✅ Comprehensive logging to file
- ✅ Configurable rate limiting
- ✅ Single JSON file output
- ✅ Support for both URL and thread ID input

## Installation

```bash
pip install -r requirements.txt
```

## Usage

```bash
# Basic usage with URL
python hn-api-scraper.py https://news.ycombinator.com/item?id=46857488

# Using just the thread ID
python hn-api-scraper.py 46857488

# Custom output file
python hn-api-scraper.py 46857488 --output jobs.json

# With rate limiting and concurrency control
python hn-api-scraper.py 46857488 --max-concurrent 20 --delay 0.05

# Limit number of posts (for testing)
python hn-api-scraper.py 46857488 --limit 50

# Verbose logging
python hn-api-scraper.py 46857488 -v

# All options
python hn-api-scraper.py 46857488 \
  --output my_jobs.json \
  --limit 100 \
  --max-concurrent 15 \
  --delay 0.1 \
  --log-file my_scraper.log \
  -v
```

### Command-line Arguments
- `url_or_id` (required): HN thread URL or thread ID
- `-o, --output`: Output JSON file path (default: `scraped_jobs.json`)
- `--limit`: Limit number of comments to fetch (for testing)
- `--max-concurrent`: Maximum concurrent API requests (default: 10)
- `--delay`: Delay between requests in seconds (default: 0.1)
- `--log-file`: Log file path (default: `scraper.log`)
- `-v, --verbose`: Enable verbose logging to console

### Output Format

The script saves all job postings to a single JSON file:

```json
[
  {
    "id": 43206327,
    "by": "username",
    "time": 1704067200,
    "text": "Full job posting text with HTML formatting...",
    "type": "comment",
    "parent": 43206326
  },
  ...
]
```

### Logging

All operations are logged to a file (default: `scraper.log`) including:
- Thread information
- Scraping progress
- Success/error rates
- Timing information
- Any errors encountered


## Examples

### Finding Latest Hiring Thread

Visit [Hacker News](https://news.ycombinator.com/) and search for "Ask HN: Who is hiring?" to find the latest thread.

### Quick Test

```bash
# Scrape just 10 posts for testing
python hn-api-scraper.py 46857488 --limit 10 -v
```

### Production Use

```bash
# Scrape with moderate rate limiting
python hn-api-scraper.py 46857488 \
  --output "jobs_$(date +%Y%m%d).json" \
  --max-concurrent 15 \
  --delay 0.1 \
  --log-file "scraper_$(date +%Y%m%d).log"
```

---

## License

MIT
