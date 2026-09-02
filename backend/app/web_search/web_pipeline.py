"""
JARVIS Web RAG Pipeline
Orchestrates Search Query Optimization, Safe Multi-Page Retrieval, Content Extraction, Anti-Hallucination Synthesis, and Inline Citations
"""
import time
import re
from typing import List, Dict, Any, Optional

from .search_engine import WebSearchEngine
from .web_fetcher import fetch_webpage_content
from .content_extractor import extract_readable_text

class WebRAGPipeline:
    """
    End-to-End Web Retrieval-Augmented Generation (Web RAG) Pipeline.
    Synthesizes live internet knowledge using Gemini with strict factual grounding.
    """
    def __init__(self):
        self.search_engine = WebSearchEngine()

    def generate_search_query(self, user_query: str, history: List[Dict[str, str]], llm_caller) -> str:
        """
        Extracts optimized search keywords from conversational questions.
        e.g. 'What are the latest developments in AI agents?' -> 'latest AI agents developments 2026'
        """
        # If query is already concise, return directly
        words = user_query.strip().split()
        if len(words) <= 4:
            return user_query.strip(' ?.')

        prompt = f"""Generate a concise, highly effective web search engine keyword query for the user's question.
Do NOT include punctuation, search operators, or conversational phrases.
Focus on core entities, topics, and recency terms (e.g. 2026, latest, price).

User Question: "{user_query}"
Search Query:"""

        try:
            res = llm_caller([{"role": "user", "parts": [{"text": prompt}]}])
            if res:
                clean_kw = res.strip().replace('"', '').replace("Search Query:", "").strip()
                if len(clean_kw) > 3:
                    return clean_kw
        except Exception:
            pass

        # Heuristic query cleanup fallback
        clean_kw = re.sub(r'^(what is the latest|what are the latest|can you search for|search the web for|what happened today in|tell me about the current)\s+', '', user_query, flags=re.I).strip(' ?.')
        return clean_kw or user_query

    def execute_web_rag(
        self,
        query: str,
        history: List[Dict[str, str]],
        llm_caller,
        system_prompt: str
    ) -> Dict[str, Any]:
        """
        Executes the full Web RAG lifecycle:
        1. Search Query Optimization
        2. Multi-Result Retrieval (5-10 sources)
        3. Safe Page Fetching (Top 3-5 sources with SSRF prevention)
        4. Content Extraction
        5. Grounded Gemini Synthesis with Anti-Hallucination & [1], [2] Citations
        """
        pipeline_start = time.time()
        
        # Step 1: Optimize search query
        search_kw = self.generate_search_query(query, history, llm_caller)
        print(f"[WEB RAG] Optimized Query: '{search_kw}' (Original: '{query}')")

        # Step 2: Multi-Result Web Search (5-10 results)
        search_results = self.search_engine.search(search_kw, max_results=8)

        if not search_results:
            # Try searching with raw query as backup
            search_results = self.search_engine.search(query, max_results=6)

        # Step 3: Fetch Top 3-5 Relevant Pages safely
        fetched_pages: List[Dict[str, Any]] = []
        for idx, result in enumerate(search_results[:5], 1):
            page_html = fetch_webpage_content(result.url, timeout_seconds=3.0)
            if page_html:
                clean_text = extract_readable_text(page_html, max_chars=6000)
                if len(clean_text) > 80:
                    fetched_pages.append({
                        "index": idx,
                        "title": result.title,
                        "url": result.url,
                        "source": result.source,
                        "content": clean_text
                    })

        # Step 4: Build Grounded Web RAG Context
        context_blocks = []
        for idx, result in enumerate(search_results[:6], 1):
            # Check if full page content was fetched
            matched_page = next((p for p in fetched_pages if p["url"] == result.url), None)
            snippet_text = matched_page["content"][:2500] if matched_page else result.snippet
            
            context_blocks.append(
                f"[{idx}] Source: {result.source} | Title: {result.title}\n"
                f"URL: {result.url}\n"
                f"Content:\n{snippet_text}"
            )

        rag_context_str = "\n\n---\n\n".join(context_blocks)

        # Step 5: Gemini Anti-Hallucination Synthesis Prompt
        rag_prompt = f"""{system_prompt}

You are answering a live user question using real-time web search results.

USER QUESTION: "{query}"

SEARCH RESULTS & RETRIEVED SOURCE CONTENT:
{rag_context_str}

STRICT GROUNDING & CITATION RULES:
1. Answer the user's question directly, accurately, and thoroughly using the provided search sources.
2. Cite your sources inline using bracketed citation numbers (e.g. [1], [2]).
3. Provide a concise, 1-2 sentence spoken summary at the very beginning.
4. Distinguish facts from inferences. If sources contain conflicting reports, state that information is inconsistent.
5. Do NOT invent facts or URLs. Only cite URLs provided in the search results above.
6. At the end of your response, list the sources consulted under a '### 📚 Sources' section with clickable Markdown links: `[Title](url)`.
"""

        contents = []
        for turn in history[-4:]:
            role = "user" if turn.get("role") == "user" else "model"
            contents.append({"role": role, "parts": [{"text": turn.get("text", "")}]})
        
        contents.append({"role": "user", "parts": [{"text": rag_prompt}]})

        gemini_answer = llm_caller(contents)
        elapsed_ms = int((time.time() - pipeline_start) * 1000)

        # Normalized sources array
        sources_list = [
            {
                "title": r.title,
                "url": r.url,
                "source": r.source,
                "published_date": r.published_date
            }
            for r in search_results[:6]
        ]

        if gemini_answer:
            lines = [l.strip() for l in gemini_answer.splitlines() if l.strip()]
            spoken = lines[0] if lines else f"Here is the latest information regarding {query}."
            spoken = re.sub(r'\[\d+\]', '', spoken).replace("*", "").replace("#", "").replace("`", "")
            
            return {
                "success": True,
                "intent": "WEB_SEARCH",
                "answer": gemini_answer,
                "spoken_summary": spoken,
                "detailed_markdown": gemini_answer,
                "sources": sources_list,
                "action": None,
                "metadata": {
                    "search_query": search_kw,
                    "result_count": len(search_results),
                    "fetched_pages": len(fetched_pages),
                    "search_time_ms": elapsed_ms,
                    "status": "COMPLETE"
                }
            }

        # Fallback if Gemini LLM was unreachable
        snippets_fallback = "\n\n".join([f"**[{i}] [{r['title']}]({r['url']})** ({r['source']}):\n{r['snippet']}" for i, r in enumerate(search_results[:4], 1)])
        fallback_markdown = f"""### 🌐 Web Search Results: `{query}`

---

{snippets_fallback}

---
### 📚 Sources:
""" + "\n".join([f"- [{r['title']}]({r['url']}) ({r['source']})" for r in search_results[:4]])

        return {
            "success": True,
            "intent": "WEB_SEARCH",
            "answer": fallback_markdown,
            "spoken_summary": f"I found several live sources regarding {query}, sir.",
            "detailed_markdown": fallback_markdown,
            "sources": sources_list,
            "action": None,
            "metadata": {
                "search_query": search_kw,
                "result_count": len(search_results),
                "fetched_pages": 0,
                "search_time_ms": elapsed_ms,
                "status": "FALLBACK"
            }
        }
