"""
JARVIS Web Search Engine Orchestrator
Handles provider selection, failover, result deduplication, URL normalization, and ranking
"""
import time
import urllib.parse
from typing import List, Dict, Any, Optional

from ..config import settings
from .providers import (
    SearchProvider,
    SearchResult,
    DuckDuckGoProvider,
    TavilySearchProvider,
    SerperSearchProvider,
    WikipediaProvider
)

class WebSearchEngine:
    """
    Orchestrates web search across primary and fallback providers.
    Deduplicates results and ensures high-quality ranking.
    """
    def __init__(self):
        self.default_provider = DuckDuckGoProvider()
        self.wiki_provider = WikipediaProvider()

    def _get_active_provider(self) -> SearchProvider:
        provider_name = (getattr(settings, "SEARCH_PROVIDER", "") or "duckduckgo").lower().strip()
        api_key = getattr(settings, "SEARCH_API_KEY", "").strip()

        if provider_name == "tavily" and api_key:
            return TavilySearchProvider(api_key)
        elif provider_name == "serper" and api_key:
            return SerperSearchProvider(api_key)
        
        return self.default_provider

    def search(self, query: str, max_results: int = 8) -> List[SearchResult]:
        """
        Executes search with automatic failover and URL deduplication.
        """
        start_time = time.time()
        provider = self._get_active_provider()
        
        print(f"[SEARCH ENGINE] Executing search query: '{query}' via provider: {provider.name}")
        
        results: List[SearchResult] = []
        try:
            results = provider.search(query, max_results=max_results)
        except Exception as e:
            print(f"[SEARCH ENGINE ERROR] Primary provider {provider.name} failed: {e}")

        # Fallback to DuckDuckGo if primary provider returned empty results
        if len(results) < 2 and provider.name != "duckduckgo":
            print(f"[SEARCH ENGINE] Falling back to DuckDuckGo...")
            try:
                fb_results = self.default_provider.search(query, max_results=max_results)
                results.extend(fb_results)
            except Exception as e:
                print(f"[SEARCH ENGINE FALLBACK ERROR] {e}")

        # Deduplicate results by normalized URL
        seen_urls = set()
        unique_results: List[SearchResult] = []

        for r in results:
            clean_url = self._normalize_url(r.url)
            if clean_url and clean_url not in seen_urls:
                seen_urls.add(clean_url)
                r.rank = len(unique_results) + 1
                unique_results.append(r)
            if len(unique_results) >= max_results:
                break

        elapsed_ms = int((time.time() - start_time) * 1000)
        print(f"[SEARCH ENGINE] Retrieved {len(unique_results)} results in {elapsed_ms}ms")
        return unique_results

    def _normalize_url(self, url: str) -> str:
        """Normalizes URL by removing tracking params and trailing slashes."""
        try:
            parsed = urllib.parse.urlparse(url)
            # Filter query params (utm_, fbclid, etc.)
            clean_query = ""
            if parsed.query:
                params = urllib.parse.parse_qsl(parsed.query)
                clean_params = [(k, v) for k, v in params if not k.startswith("utm_") and k not in ["fbclid", "gclid", "ref"]]
                clean_query = urllib.parse.urlencode(clean_params)
            
            clean_path = parsed.path.rstrip("/")
            return urllib.parse.urlunparse((parsed.scheme, parsed.netloc.lower(), clean_path, "", clean_query, ""))
        except Exception:
            return url.strip().rstrip("/")
