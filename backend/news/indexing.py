"""Search engine indexing notifications (IndexNow and Google Indexing API)."""

import logging
import os
from urllib.parse import quote

import requests
from decouple import config

logger = logging.getLogger(__name__)

INDEXNOW_KEY = "de8084d1e16e460cbcf1739f2285a137"
INDEXNOW_ENDPOINTS = [
    "https://www.bing.com/indexnow",
    "https://api.indexnow.org/indexnow",
    "https://yandex.com/indexnow",
]

SITE_URL = config("SITE_URL", default="https://thehotreports.com")


def notify_indexnow(url: str) -> bool:
    """Notify search engines via IndexNow protocol when a URL is updated.

    Args:
        url: Full URL of the page that was added/updated/deleted.

    Returns:
        True if at least one endpoint succeeded, False otherwise.
    """
    encoded_url = quote(url, safe="")
    success = False

    for endpoint in INDEXNOW_ENDPOINTS:
        try:
            request_url = f"{endpoint}?url={encoded_url}&key={INDEXNOW_KEY}"
            response = requests.get(request_url, timeout=10)
            if response.status_code == 200:
                logger.info(f"IndexNow success: {endpoint} for {url}")
                success = True
            else:
                logger.warning(f"IndexNow non-200 from {endpoint}: {response.status_code}")
        except Exception as e:
            logger.warning(f"IndexNow failed for {endpoint}: {e}")

    return success


def notify_google_indexing(url: str) -> bool:
    """Notify Google via Indexing API when a URL is updated.

    Note: This requires:
    1. A Google service account with Indexing API access
    2. The service account added as owner in Google Search Console
    3. GOOGLE_SERVICE_ACCOUNT_JSON env var set with the JSON key

    Args:
        url: Full URL of the page that was added/updated.

    Returns:
        True if successful, False otherwise.
    """
    service_account_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
    if not service_account_json:
        logger.warning("GOOGLE_SERVICE_ACCOUNT_JSON environment variable not set")
        return False

    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build

        credentials = service_account.Credentials.from_service_account_file(
            service_account_json,
            scopes=["https://www.googleapis.com/auth/indexing"],
        )
        service = build("indexing", "v3", credentials=credentials)

        body = {
            "url": url,
            "type": "URL_UPDATED",
        }

        response = service.urlNotifications().publish(body=body).execute()
        logger.info(f"Google Indexing API success: {url}")
        return True

    except ImportError:
        logger.warning("google-auth or google-api-python-client not installed")
        return False
    except Exception as e:
        logger.warning(f"Google Indexing API failed: {e}")
        return False


def notify_search_engines(slug: str, content_type: str = "article") -> dict:
    """Notify all configured search engines about a new/updated page.

    Args:
        slug: The URL slug (e.g., 'my-article').
        content_type: Type of content - 'article', 'story', 'episode', 'tourism', etc.

    Returns:
        Dict with status of each indexing service.
    """
    # Build the full URL based on content type
    path_map = {
        "article": f"/article/{slug}",
        "story": f"/stories/{slug}",
        "episode": f"/stories/episode/{slug}",
        "tourism": f"/tourism/{slug}",
    }
    path = path_map.get(content_type, f"/article/{slug}")
    full_url = f"{SITE_URL}{path}"

    results = {
        "url": full_url,
        "indexnow": notify_indexnow(full_url),
        "google": notify_google_indexing(full_url),
    }

    return results
