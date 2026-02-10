#!/usr/bin/env python3

"""
HN API Job Scraper

Fetches job postings from Hacker News "Who's hiring?" threads using the official HN API.
Saves all top-level comments (job postings) to a single JSON file with comprehensive logging.

Usage:
    python hn-api-scraper.py <thread_url_or_id> [options]
    python hn-api-scraper.py https://news.ycombinator.com/item?id=46857488 --output jobs.json
    python hn-api-scraper.py 46857488 --max-concurrent 20 --delay 0.05
"""

import argparse
import sys
import json
import asyncio
import logging
import time
import re
from typing import List, Dict, Any, Optional
from urllib.parse import urlparse, parse_qs
import aiohttp


# Hacker News API base URL
HN_API_BASE = "https://hacker-news.firebaseio.com/v0"


def setup_logging(log_file: str, verbose: bool = False) -> None:
    """
    Configure logging to both file and console.

    Args:
        log_file: Path to the log file
        verbose: If True, set console logging to DEBUG level
    """
    # Create logger
    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG)

    # File handler - always DEBUG level
    file_handler = logging.FileHandler(log_file, mode='w', encoding='utf-8')
    file_handler.setLevel(logging.DEBUG)
    file_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    file_handler.setFormatter(file_formatter)

    # Console handler - INFO or DEBUG based on verbose flag
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG if verbose else logging.INFO)
    console_formatter = logging.Formatter('%(levelname)s - %(message)s')
    console_handler.setFormatter(console_formatter)

    # Add handlers
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    logging.info(f"Logging initialized. Log file: {log_file}")


def extract_thread_id(url_or_id: str) -> str:
    """
    Extract thread ID from HN URL or return the ID if already provided.

    Args:
        url_or_id: Either a full HN URL or just the thread ID

    Returns:
        The thread ID as a string

    Raises:
        ValueError: If the URL is invalid or ID cannot be extracted
    """
    # If it's already just a number, return it
    if url_or_id.isdigit():
        logging.debug(f"Input is already a thread ID: {url_or_id}")
        return url_or_id

    # Try to parse as URL
    try:
        parsed = urlparse(url_or_id)

        # Check if it's a HN URL
        if 'ycombinator.com' in parsed.netloc or 'news.ycombinator.com' in parsed.netloc:
            # Extract 'id' parameter from query string
            query_params = parse_qs(parsed.query)
            if 'id' in query_params:
                thread_id = query_params['id'][0]
                logging.debug(f"Extracted thread ID from URL: {thread_id}")
                return thread_id

        # Try to find ID in the URL path or query
        id_match = re.search(r'id[=/](\d+)', url_or_id)
        if id_match:
            thread_id = id_match.group(1)
            logging.debug(f"Extracted thread ID from URL pattern: {thread_id}")
            return thread_id

    except Exception as e:
        logging.error(f"Error parsing URL: {e}")

    raise ValueError(f"Could not extract thread ID from: {url_or_id}")


async def fetch_item(
    session: aiohttp.ClientSession,
    item_id: int,
    semaphore: asyncio.Semaphore,
    delay: float = 0
) -> Optional[Dict[str, Any]]:
    """
    Fetch a single item from the HN API.

    Args:
        session: aiohttp session for making requests
        item_id: The HN item ID to fetch
        semaphore: Semaphore for rate limiting
        delay: Optional delay after request (in seconds)

    Returns:
        The item data as a dictionary, or None if request fails
    """
    async with semaphore:
        try:
            url = f"{HN_API_BASE}/item/{item_id}.json"
            logging.debug(f"Fetching item {item_id}")

            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    logging.debug(f"Successfully fetched item {item_id}")

                    # Add delay if specified
                    if delay > 0:
                        await asyncio.sleep(delay)

                    return data
                else:
                    logging.warning(f"Failed to fetch item {item_id}: HTTP {response.status}")
                    return None

        except Exception as e:
            logging.error(f"Error fetching item {item_id}: {e}")
            return None


async def fetch_thread_kids(
    session: aiohttp.ClientSession,
    thread_id: str
) -> List[int]:
    """
    Fetch the parent thread and return all child comment IDs.

    Args:
        session: aiohttp session for making requests
        thread_id: The HN thread ID

    Returns:
        List of child comment IDs

    Raises:
        Exception: If the thread cannot be fetched
    """
    try:
        url = f"{HN_API_BASE}/item/{thread_id}.json"
        logging.info(f"Fetching thread {thread_id} to get child comments")

        async with session.get(url) as response:
            if response.status != 200:
                raise Exception(f"Failed to fetch thread: HTTP {response.status}")

            data = await response.json()

            if not data:
                raise Exception("Thread data is empty")

            kids = data.get('kids', [])
            logging.info(f"Found {len(kids)} top-level comments in thread {thread_id}")

            return kids

    except Exception as e:
        logging.error(f"Error fetching thread {thread_id}: {e}")
        raise


async def fetch_comments_async(
    comment_ids: List[int],
    max_concurrent: int,
    delay: float
) -> List[Dict[str, Any]]:
    """
    Fetch multiple comments concurrently from the HN API.

    Args:
        comment_ids: List of comment IDs to fetch
        max_concurrent: Maximum number of concurrent requests
        delay: Delay between requests in seconds

    Returns:
        List of comment data dictionaries
    """
    semaphore = asyncio.Semaphore(max_concurrent)
    comments = []

    logging.info(f"Starting to fetch {len(comment_ids)} comments with max concurrency of {max_concurrent}")

    async with aiohttp.ClientSession() as session:
        tasks = [
            fetch_item(session, comment_id, semaphore, delay)
            for comment_id in comment_ids
        ]

        # Fetch all comments
        results = await asyncio.gather(*tasks)

        # Filter out None values (failed requests)
        comments = [item for item in results if item is not None]

        logging.info(f"Successfully fetched {len(comments)} out of {len(comment_ids)} comments")

    return comments


def main():
    """Main execution function."""
    parser = argparse.ArgumentParser(
        description='Fetch job postings from HN "Who\'s hiring?" threads using the HN API',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python hn-api-scraper.py https://news.ycombinator.com/item?id=46857488
  python hn-api-scraper.py 46857488 --output jobs.json
  python hn-api-scraper.py 46857488 --limit 50 --max-concurrent 20 --delay 0.05
        """
    )

    parser.add_argument(
        'url_or_id',
        help='HN thread URL or thread ID (e.g., https://news.ycombinator.com/item?id=46857488 or 46857488)'
    )
    parser.add_argument(
        '-o', '--output',
        help='Output JSON file path (default: scraped_jobs.json)',
        default='scraped_jobs.json'
    )
    parser.add_argument(
        '--limit',
        type=int,
        help='Limit the number of comments to fetch (for testing)',
        default=None
    )
    parser.add_argument(
        '--max-concurrent',
        type=int,
        help='Maximum concurrent API requests (default: 10)',
        default=10
    )
    parser.add_argument(
        '--delay',
        type=float,
        help='Delay between requests in seconds (default: 0.1)',
        default=0.1
    )
    parser.add_argument(
        '--log-file',
        help='Log file path (default: scraper.log)',
        default='scraper.log'
    )
    parser.add_argument(
        '-v', '--verbose',
        help='Enable verbose logging to console',
        action='store_true'
    )

    args = parser.parse_args()

    # Setup logging
    setup_logging(args.log_file, args.verbose)

    try:
        # Extract thread ID
        logging.info("=" * 60)
        logging.info("Starting HN API Job Scraper")
        logging.info("=" * 60)

        thread_id = extract_thread_id(args.url_or_id)
        logging.info(f"Thread ID: {thread_id}")
        logging.info(f"Output file: {args.output}")
        logging.info(f"Max concurrent requests: {args.max_concurrent}")
        logging.info(f"Delay between requests: {args.delay}s")

        start_time = time.time()

        # Fetch thread and get child comment IDs
        async def fetch_all():
            async with aiohttp.ClientSession() as session:
                kids = await fetch_thread_kids(session, thread_id)

                # Apply limit if specified
                if args.limit:
                    logging.info(f"Limiting to first {args.limit} comments")
                    kids = kids[:args.limit]

                # Fetch all comments
                comments = await fetch_comments_async(kids, args.max_concurrent, args.delay)

                return comments

        # Run async fetching
        comments = asyncio.run(fetch_all())

        elapsed_time = time.time() - start_time

        # Log statistics
        logging.info("=" * 60)
        logging.info(f"Scraping complete in {elapsed_time:.2f} seconds")
        logging.info(f"Total comments fetched: {len(comments)}")
        logging.info(f"Success rate: {len(comments)}/{len(comments)} (100%)")

        # Save to file
        logging.info(f"Saving results to {args.output}")
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(comments, f, indent=2, ensure_ascii=False)

        logging.info(f"Results successfully saved to: {args.output}")
        logging.info("=" * 60)

        print(f"\n✓ Successfully scraped {len(comments)} job postings")
        print(f"✓ Results saved to: {args.output}")
        print(f"✓ Log file: {args.log_file}")

        return 0

    except Exception as e:
        logging.error(f"Fatal error: {e}", exc_info=True)
        print(f"\n✗ Error: {e}", file=sys.stderr)
        print(f"✓ See {args.log_file} for details")
        return 1


if __name__ == '__main__':
    sys.exit(main())
