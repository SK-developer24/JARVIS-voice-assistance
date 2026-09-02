"""
JARVIS Web Search & Web RAG Package
"""
from .providers import SearchProvider, SearchResult, DuckDuckGoProvider, TavilySearchProvider, SerperSearchProvider, WikipediaProvider
from .search_engine import WebSearchEngine
from .web_fetcher import fetch_webpage_content, is_safe_url
from .content_extractor import extract_readable_text
from .web_pipeline import WebRAGPipeline

__all__ = [
    "SearchProvider",
    "SearchResult",
    "DuckDuckGoProvider",
    "TavilySearchProvider",
    "SerperSearchProvider",
    "WikipediaProvider",
    "WebSearchEngine",
    "fetch_webpage_content",
    "is_safe_url",
    "extract_readable_text",
    "WebRAGPipeline"
]
