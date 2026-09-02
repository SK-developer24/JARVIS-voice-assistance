"""
JARVIS HTML Content Extractor
Extracts clean, readable body text from HTML by removing boilerplate, navigation chrome, scripts, and ads
"""
import re
import html

# Tags to strip entirely along with their inner contents
STRIP_TAGS = [
    r'<script\b[^>]*>.*?</script>',
    r'<style\b[^>]*>.*?</style>',
    r'<noscript\b[^>]*>.*?</noscript>',
    r'<iframe\b[^>]*>.*?</iframe>',
    r'<svg\b[^>]*>.*?</svg>',
    r'<canvas\b[^>]*>.*?</canvas>',
    r'<nav\b[^>]*>.*?</nav>',
    r'<footer\b[^>]*>.*?</footer>',
    r'<header\b[^>]*>.*?</header>',
    r'<aside\b[^>]*>.*?</aside>',
    r'<form\b[^>]*>.*?</form>',
    r'<!--.*?-->'
]

def extract_readable_text(html_raw: str, max_chars: int = 10000) -> str:
    """
    Parses raw HTML and extracts clean readable article text.
    Limits text output to max_chars to avoid overloading LLM context.
    """
    if not html_raw:
        return ""

    text = html_raw

    # 1. Remove non-content tags and comments
    for pattern in STRIP_TAGS:
        text = re.sub(pattern, ' ', text, flags=re.DOTALL | re.IGNORECASE)

    # 2. Insert line breaks for block-level elements
    text = re.sub(r'<(p|div|br|li|h[1-6]|tr|blockquote)[^>]*>', '\n', text, flags=re.IGNORECASE)

    # 3. Strip all remaining HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)

    # 4. Unescape HTML entities (&amp; -> &, &quot; -> ", etc.)
    text = html.unescape(text)

    # 5. Clean up redundant whitespace and empty lines
    lines = [line.strip() for line in text.splitlines()]
    clean_lines = [l for l in lines if len(l) > 10 and not re.match(r'^(cookie|privacy|terms|sign in|log in|subscribe|all rights reserved|menu)$', l, re.IGNORECASE)]

    result = "\n".join(clean_lines)
    result = re.sub(r'\n{3,}', '\n\n', result).strip()

    # 6. Truncate to maximum allowed character budget
    if len(result) > max_chars:
        result = result[:max_chars] + "\n... [Content truncated for length]"

    return result
