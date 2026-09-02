"""
JARVIS System Configurations & Settings
"""
import os
import json
from pathlib import Path

SETTINGS_FILE = Path(__file__).parent / "user_settings.json"

def _load_user_settings() -> dict:
    if SETTINGS_FILE.exists():
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

user_cfg = _load_user_settings()

class Settings:
    PROJECT_NAME: str = "JARVIS AI Assistant"
    VERSION: str = "2.0.0"
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", 8000))
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]
    USER_NAME: str = "Sourabh Sahu"
    USER_ROLE: str = "AIML Student"
    MENTOR_NAME: str = "Dr. Neelam Arya"
    LOCATION_DEFAULT: str = "Gwalior, Madhya Pradesh, India"
    COORDINATES: str = "LAT 26.2183° N  LONG 78.1828° E"
    
    # Android Phone Wireless IP (Sourabh's Hotspot)
    PHONE_IP: str = user_cfg.get("phone_ip", "10.199.161.165")
    PHONE_PORT: int = 5555
    PHONE_PIN: str = user_cfg.get("phone_pin", "20050524")

    # Generative AI Model Configuration
    GEMINI_MODEL: str = user_cfg.get("gemini_model", os.getenv("GEMINI_MODEL", "gemini-1.5-flash"))
    
    # Web Search Configuration
    SEARCH_PROVIDER: str = user_cfg.get("search_provider", os.getenv("SEARCH_PROVIDER", "duckduckgo"))
    SEARCH_API_KEY: str = user_cfg.get("search_api_key", os.getenv("SEARCH_API_KEY", ""))

settings = Settings()
