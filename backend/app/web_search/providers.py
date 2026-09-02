"""
JARVIS Modular Web Search Providers
Abstract Search Provider interface with DuckDuckGo Organic, Tavily, Serper, Brave, and Wikipedia providers
"""
import urllib.request
import urllib.parse
import json
import re
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict

@dataclass
class SearchResult:
    title: str
    url: str
    snippet: str
    source: str
    published_date: str = ""
    rank: int = 1

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

class SearchProvider(ABC):
    """Abstract Base Class for all JARVIS Search Providers."""
    name: str = "base"

    @abstractmethod
    def search(self, query: str, max_results: int = 8) -> List[SearchResult]:
        pass

class DuckDuckGoProvider(SearchProvider):
    """
    General Web Search Provider using DuckDuckGo Organic Search.
    Extracts real web titles, snippets, and clean destination URLs without external API keys.
    """
    name = "duckduckgo"

    def search(self, query: str, max_results: int = 8) -> List[SearchResult]:
        results: List[SearchResult] = []
        clean_q = query.strip()
        if not clean_q:
            return results

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5"
        }

        # Step 1: Query DuckDuckGo HTML Search
        try:
            post_data = urllib.parse.urlencode({"q": clean_q, "b": ""}).encode("utf-8")
            req = urllib.request.Request("https://html.duckduckgo.com/html/", data=post_data, headers=headers)
            with urllib.request.urlopen(req, timeout=4.0) as resp:
                html = resp.read().decode("utf-8", errors="ignore")
                
                # Extract result blocks: <div class="result results_links results_links_deep web-result">
                # Or <a class="result__snippet" ...>
                blocks = re.findall(r'<div[^>]*class="[^"]*result__body[^"]*"[^>]*>(.*?)</div>\s*</div>', html, re.DOTALL)
                rank = 1

                for block in blocks:
                    if len(results) >= max_results:
                        break

                    # Extract URL
                    url_match = re.search(r'<a[^>]*class="result__url"[^>]*href="([^"]+)"', block)
                    if not url_match:
                        url_match = re.search(r'<a[^>]*class="result__a"[^>]*href="([^"]+)"', block)
                    if not url_match:
                        continue

                    raw_url = url_match.group(1)
                    # Unquote DuckDuckGo redirect wrapper: //duckduckgo.com/l/?uddg=https%3A%2F%2F...
                    actual_url = raw_url
                    if "uddg=" in raw_url:
                        uddg_param = re.search(r'uddg=([^&]+)', raw_url)
                        if uddg_param:
                            actual_url = urllib.parse.unquote(uddg_param.group(1))
                    elif raw_url.startswith("//"):
                        actual_url = "https:" + raw_url

                    # Filter ad/tracker links
                    if not actual_url.startswith("http") or "duckduckgo.com" in actual_url:
                        continue

                    # Extract Title
                    title_match = re.search(r'<a[^>]*class="result__a"[^>]*>(.*?)</a>', block, re.DOTALL)
                    title = re.sub(r'<[^>]+>', '', title_match.group(1)).strip() if title_match else "Web Page"

                    # Extract Snippet
                    snippet_match = re.search(r'<a[^>]*class="result__snippet"[^>]*>(.*?)</a>', block, re.DOTALL)
                    snippet = re.sub(r'<[^>]+>', '', snippet_match.group(1)).strip() if snippet_match else ""

                    if not snippet:
                        continue

                    # Extract domain for source name
                    domain = urllib.parse.urlparse(actual_url).netloc.replace("www.", "")

                    results.append(SearchResult(
                        title=title,
                        url=actual_url,
                        snippet=snippet,
                        source=domain,
                        published_date="",
                        rank=rank
                    ))
                    rank += 1

        except Exception as e:
            print(f"[DUCKDUCKGO SEARCH WARNING] HTML search: {e}")

        # Step 2: Instant Answer API Fallback / Augmentation
        if len(results) < 3:
            try:
                api_url = f"https://api.duckduckgo.com/?q={urllib.parse.quote(clean_q)}&format=json&no_html=1&skip_disambig=1"
                req = urllib.request.Request(api_url, headers=headers)
                with urllib.request.urlopen(req, timeout=3.0) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    abstract = data.get("AbstractText", "")
                    heading = data.get("Heading", clean_q.title())
                    abs_url = data.get("AbstractURL", "")
                    if abstract and abs_url:
                        results.insert(0, SearchResult(
                            title=heading,
                            url=abs_url,
                            snippet=abstract,
                            source=urllib.parse.urlparse(abs_url).netloc.replace("www.", "") or "DuckDuckGo",
                            published_date="",
                            rank=1
                        ))
            except Exception as e:
                print(f"[DUCKDUCKGO API WARNING] {e}")

        return results

class TavilySearchProvider(SearchProvider):
    """Tavily AI Search Provider (Specialized AI Search API)."""
    name = "tavily"

    def __init__(self, api_key: str):
        self.api_key = api_key

    def search(self, query: str, max_results: int = 8) -> List[SearchResult]:
        if not self.api_key:
            return []
        results: List[SearchResult] = []
        try:
            url = "https://api.tavily.com/search"
            payload = json.dumps({
                "api_key": self.api_key,
                "query": query,
                "search_depth": "basic",
                "include_answer": False,
                "max_results": max_results
            }).encode("utf-8")
            req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=5.0) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                for idx, item in enumerate(data.get("results", []), 1):
                    item_url = item.get("url", "")
                    results.append(SearchResult(
                        title=item.get("title", "Article"),
                        url=item_url,
                        snippet=item.get("content", ""),
                        source=urllib.parse.urlparse(item_url).netloc.replace("www.", "") or "Tavily",
                        published_date=item.get("published_date", ""),
                        rank=idx
                    ))
        except Exception as e:
            print(f"[TAVILY SEARCH ERROR] {e}")
        return results

class SerperSearchProvider(SearchProvider):
    """Google Serper API Provider (Google Web Search)."""
    name = "serper"

    def __init__(self, api_key: str):
        self.api_key = api_key

    def search(self, query: str, max_results: int = 8) -> List[SearchResult]:
        if not self.api_key:
            return []
        results: List[SearchResult] = []
        try:
            url = "https://google.serper.dev/search"
            payload = json.dumps({"q": query, "num": max_results}).encode("utf-8")
            req = urllib.request.Request(url, data=payload, headers={
                "X-API-KEY": self.api_key,
                "Content-Type": "application/json"
            })
            with urllib.request.urlopen(req, timeout=5.0) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                for idx, item in enumerate(data.get("organic", []), 1):
                    item_url = item.get("link", "")
                    results.append(SearchResult(
                        title=item.get("title", ""),
                        url=item_url,
                        snippet=item.get("snippet", ""),
                        source=urllib.parse.urlparse(item_url).netloc.replace("www.", "") or "Google",
                        published_date=item.get("date", ""),
                        rank=idx
                    ))
        except Exception as e:
            print(f"[SERPER SEARCH ERROR] {e}")
        return results

class WikipediaProvider(SearchProvider):
    """Specialized Secondary Source Provider for Encyclopedic and Historical entities."""
    name = "wikipedia"

    def search(self, query: str, max_results: int = 4) -> List[SearchResult]:
        results: List[SearchResult] = []
        headers = {"User-Agent": "JARVIS-Universal-AI/2.0 (Educational Assistant; sourabh@aiml.edu)"}
        try:
            search_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query)}&format=json&srlimit={max_results}"
            req = urllib.request.Request(search_url, headers=headers)
            with urllib.request.urlopen(req, timeout=3.5) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                for idx, item in enumerate(data.get("query", {}).get("search", []), 1):
                    title = item.get("title", "")
                    snippet = re.sub(r'<[^>]+>', '', item.get("snippet", ""))
                    page_url = f"https://en.wikipedia.org/wiki/{urllib.parse.quote(title.replace(' ', '_'))}"
                    results.append(SearchResult(
                        title=title,
                        url=page_url,
                        snippet=snippet,
                        source="Wikipedia",
                        published_date="",
                        rank=idx
                    ))
        except Exception as e:
            print(f"[WIKIPEDIA PROVIDER ERROR] {e}")
        return results
