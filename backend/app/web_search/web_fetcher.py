"""
JARVIS Safe Web Page Fetcher with Hardened SSRF Protection
Pre-resolves DNS and blocks private/loopback/link-local/cloud-metadata IP ranges before opening connections
"""
import socket
import ipaddress
import urllib.request
import urllib.parse
from typing import Optional

BLOCKED_HOSTNAMES = {
    "localhost",
    "127.0.0.1",
    "::1",
    "0.0.0.0",
    "metadata.google.internal",
    "instance-data",
}

def is_safe_url(url: str) -> bool:
    """
    Hardened SSRF Validator:
    Verifies that the URL scheme is strictly http/https and that all resolved IPs
    are publicly routable global addresses (never loopback, private, link-local, or cloud metadata).
    """
    try:
        parsed = urllib.parse.urlparse(url)
        if parsed.scheme not in ["http", "https"]:
            return False

        hostname = parsed.hostname
        if not hostname:
            return False

        # 1. Block known dangerous hostnames
        if hostname.lower() in BLOCKED_HOSTNAMES:
            return False

        port = parsed.port or (443 if parsed.scheme == "https" else 80)

        # 2. Pre-resolve DNS to all associated IP addresses
        addr_info = socket.getaddrinfo(hostname, port, socket.AF_UNSPEC, socket.SOCK_STREAM)
        if not addr_info:
            return False

        for family, socktype, proto, canonname, sockaddr in addr_info:
            ip_str = sockaddr[0]
            ip = ipaddress.ip_address(ip_str)

            # Check for loopback, private, link-local, reserved, multicast, or metadata
            if ip.is_loopback or ip.is_private or ip.is_link_local or ip.is_reserved or ip.is_multicast or ip.is_unspecified:
                print(f"[SSRF BLOCKED] Disallowed private/loopback IP: {ip_str} for host '{hostname}'")
                return False

            # Block specific cloud metadata addresses (169.254.169.254)
            if ip_str in ["169.254.169.254", "100.100.100.200", "0.0.0.0"]:
                return False

        return True
    except Exception as e:
        print(f"[SSRF VALIDATION ERROR] URL '{url}': {e}")
        return False

def fetch_webpage_content(url: str, timeout_seconds: float = 3.5, max_bytes: int = 500 * 1024) -> Optional[str]:
    """
    Safely fetches public webpage HTML content with strict size limits and timeout.
    Returns HTML string or None if unreadable/unsafe.
    """
    if not is_safe_url(url):
        return None

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "identity" # Avoid compressed binaries
    }

    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=timeout_seconds) as resp:
            content_type = resp.headers.get("Content-Type", "").lower()
            
            # Verify Content-Type is text/html
            if not any(t in content_type for t in ["text/html", "text/plain", "application/xhtml+xml", "text/xml"]):
                return None

            # Read up to max_bytes to prevent memory exhaustion
            raw_bytes = resp.read(max_bytes)
            
            # Detect encoding
            encoding = "utf-8"
            if "charset=" in content_type:
                encoding = content_type.split("charset=")[-1].split(";")[0].strip()
            
            return raw_bytes.decode(encoding, errors="ignore")
    except Exception as e:
        print(f"[PAGE FETCH WARNING] '{url}': {e}")
        return None
