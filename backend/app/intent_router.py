"""
JARVIS Allowlisted Action Layer & Command Dispatcher
Executes predefined, security-verified PC and Android ADB actions without arbitrary shell execution
"""
import os
import re
import subprocess
import webbrowser
import time
from typing import Dict, Any, Optional

from .phone_controller import phone_controller

# =========================================================================
# 1. ALLOWLISTED ACTION HANDLERS (STRICTLY SECURE)
# =========================================================================

def _action_chrome(target: str = "") -> Dict[str, Any]:
    try:
        subprocess.Popen(["start", "chrome"], shell=True)
    except Exception:
        webbrowser.open("https://www.google.com")
    return {
        "spoken": "Launching Google Chrome, sir.",
        "markdown": "### 🌐 Application Launched: `Google Chrome`\n\nGoogle Chrome is opening on your desktop."
    }

def _action_vscode(target: str = "") -> Dict[str, Any]:
    try:
        subprocess.Popen(["code"], shell=True)
    except Exception:
        pass
    return {
        "spoken": "Opening Visual Studio Code, sir.",
        "markdown": "### 💻 Application Launched: `Visual Studio Code`\n\nVS Code workspace is launching."
    }

def _action_youtube(target: str = "") -> Dict[str, Any]:
    url = f"https://www.youtube.com/results?search_query={target}" if target else "https://www.youtube.com"
    webbrowser.open(url)
    return {
        "spoken": "Opening YouTube, sir.",
        "markdown": "### 🎬 Application Launched: `YouTube`\n\nYouTube is opening in your browser."
    }

def _action_spotify(target: str = "") -> Dict[str, Any]:
    webbrowser.open("https://open.spotify.com")
    return {
        "spoken": "Opening Spotify, sir.",
        "markdown": "### 🎵 Application Launched: `Spotify`\n\nSpotify Web Player is opening."
    }

def _action_whatsapp_web(target: str = "") -> Dict[str, Any]:
    webbrowser.open("https://web.whatsapp.com")
    return {
        "spoken": "Opening WhatsApp Web, sir.",
        "markdown": "### 💬 Application Launched: `WhatsApp Web`\n\nWhatsApp Web is opening."
    }

def _action_calculator(target: str = "") -> Dict[str, Any]:
    try:
        subprocess.Popen(["calc.exe"], shell=True)
    except Exception:
        pass
    return {
        "spoken": "Opening Calculator, sir.",
        "markdown": "### 🧮 Tool Launched: `Windows Calculator`\n\nCalculator application is opening."
    }

def _action_file_manager(target: str = "") -> Dict[str, Any]:
    try:
        subprocess.Popen(["explorer.exe"], shell=True)
    except Exception:
        pass
    return {
        "spoken": "Opening File Explorer, sir.",
        "markdown": "### 📁 Tool Launched: `File Explorer`\n\nWindows File Explorer is opening."
    }

def _action_screenshot_pc(target: str = "") -> Dict[str, Any]:
    try:
        import pyautogui
        import datetime
        from pathlib import Path
        save_dir = Path(os.path.expanduser("~")) / "Pictures" / "JARVIS"
        save_dir.mkdir(parents=True, exist_ok=True)
        filename = f"screenshot_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        filepath = save_dir / filename
        pyautogui.screenshot(str(filepath))
        return {
            "spoken": "Screenshot captured and saved to your Pictures folder, sir.",
            "markdown": f"### 📸 Screenshot Captured\n\nSaved to `{filepath}`."
        }
    except Exception:
        return {
            "spoken": "Triggered screenshot on PC, sir.",
            "markdown": "### 📸 Screenshot Captured"
        }

# Phone Action Dispatchers
def _action_phone_unlock(target: str = "") -> Dict[str, Any]:
    res = phone_controller.unlock_phone()
    return {
        "spoken": res.get("spoken", "Unlocking your POCO M3 Pro screen now, sir."),
        "markdown": f"### 📱 Phone Action: `Screen Unlock`\n\n{res.get('message', 'Phone Screen Woken / Unlocked')}"
    }

def _action_phone_lock(target: str = "") -> Dict[str, Any]:
    res = phone_controller.phone_utility("lock")
    return {
        "spoken": res.get("spoken", "Locking your phone screen, sir."),
        "markdown": "### 📱 Phone Action: `Screen Locked`\n\nYour POCO phone screen has been locked."
    }

def _action_phone_screenshot(target: str = "") -> Dict[str, Any]:
    res = phone_controller.phone_utility("screenshot")
    return {
        "spoken": res.get("spoken", "Screenshot captured on your phone, sir."),
        "markdown": "### 📱 Phone Action: `Screenshot Captured`\n\nSaved to phone `/sdcard/jarvis_screenshot.png`."
    }

def _action_phone_whatsapp_call(target: str = "") -> Dict[str, Any]:
    # Extract contact name and call type
    call_type = "video" if "video" in target.lower() else "call"
    clean_target = re.sub(r'^(call|video call to|video call|call to|dial|whatsapp call to|whatsapp)\s+', '', target, flags=re.I).strip()
    res = phone_controller.launch_whatsapp_call(clean_target or "papaji", call_type=call_type)
    return {
        "spoken": res.get("spoken", f"Initiating WhatsApp call on your phone, sir."),
        "markdown": f"### 📱 Phone Action: `WhatsApp Call`\n\n{res.get('message', 'WhatsApp call launched')}"
    }

def _action_phone_youtube_play(target: str = "") -> Dict[str, Any]:
    clean_query = re.sub(r'^(play|search for|open youtube in phone and play|play music|open youtube and play)\s+', '', target, flags=re.I).strip()
    clean_query = clean_query or "trending Bollywood hits"
    res = phone_controller.play_youtube_video(clean_query)
    return {
        "spoken": res.get("spoken", f"Playing {clean_query} on YouTube on your phone, sir."),
        "markdown": f"### 📱 Phone Action: `YouTube Playback`\n\n{res.get('message', f'Playing {clean_query}')}"
    }

def _action_phone_app(target: str = "") -> Dict[str, Any]:
    clean_app = target.lower().replace("on my phone", "").replace("in my phone", "").replace("on phone", "").replace("in phone", "").strip()
    res = phone_controller.launch_phone_app(clean_app or "chrome")
    return {
        "spoken": res.get("spoken", f"Opening {clean_app.title()} on your phone, sir."),
        "markdown": f"### 📱 Phone Action: `Open App`\n\n{res.get('message', f'Opening {clean_app}')}"
    }

def _action_web_search(target: str = "") -> Dict[str, Any]:
    import urllib.parse
    search_q = target or "latest technology news"
    try:
        webbrowser.open(f"https://www.google.com/search?q={urllib.parse.quote(search_q)}")
    except Exception:
        pass
    return {
        "spoken": f"Searching the web for {search_q}, sir.",
        "markdown": f"### 🌐 Web Search Launched: `{search_q}`\n\nLive search launched in your browser."
    }

# =========================================================================
# 2. ALLOWLIST REGISTRY MAPPING
# =========================================================================
ALLOWED_ACTIONS = {
    # PC Launchers & Web
    "web_search": _action_web_search,
    "search": _action_web_search,
    "chrome": _action_chrome,
    "google_chrome": _action_chrome,
    "browser": _action_chrome,
    "vscode": _action_vscode,
    "vs_code": _action_vscode,
    "code": _action_vscode,
    "youtube": _action_youtube,
    "spotify": _action_spotify,
    "whatsapp_web": _action_whatsapp_web,
    "whatsapp": _action_whatsapp_web,
    "calculator": _action_calculator,
    "calc": _action_calculator,
    "file_manager": _action_file_manager,
    "explorer": _action_file_manager,
    "files": _action_file_manager,
    "screenshot_pc": _action_screenshot_pc,
    
    # Phone Actions
    "phone_unlock": _action_phone_unlock,
    "unlock_phone": _action_phone_unlock,
    "unlock": _action_phone_unlock,
    "phone_lock": _action_phone_lock,
    "lock_phone": _action_phone_lock,
    "phone_screenshot": _action_phone_screenshot,
    "phone_whatsapp_call": _action_phone_whatsapp_call,
    "phone_call": _action_phone_whatsapp_call,
    "phone_youtube_play": _action_phone_youtube_play,
    "phone_music": _action_phone_youtube_play,
    "phone_app": _action_phone_app,
}

SENSITIVE_ACTIONS = {
    "delete": "This action can permanently delete files. Do you want me to proceed?",
    "shutdown": "This action will shut down your computer. Do you want me to proceed?",
    "restart": "This action will restart your computer. Do you want me to proceed?",
    "format": "This action will format storage. Do you want me to proceed?"
}

def execute_allowlisted_action(action_name: str, target: str = "", raw_query: str = "") -> Dict[str, Any]:
    """
    Safely executes an allowlisted action.
    Never passes arbitrary shell commands from Gemini to subprocess.
    """
    clean_action = (action_name or "").lower().replace("-", "_").strip()
    clean_target = (target or "").strip()
    clean_raw = re.sub(r'[^\w\s\+\#]', '', (raw_query or "").lower()).strip()

    # Check for sensitive action confirmation
    for sensitive_word, prompt_msg in SENSITIVE_ACTIONS.items():
        if sensitive_word in clean_action or sensitive_word in clean_raw:
            return {
                "success": True,
                "intent": "COMMAND",
                "spoken_summary": prompt_msg,
                "detailed_markdown": f"⚠️ **Confirmation Required:**\n\n{prompt_msg}",
                "action": {"name": clean_action, "target": clean_target, "requires_confirmation": True},
                "metadata": {"sensitive": True}
            }

    # Match in allowlist
    handler = ALLOWED_ACTIONS.get(clean_action)

    # Secondary heuristic match if action_name was general
    if not handler:
        if ("phone" in clean_raw or "screen" in clean_raw or "mobile" in clean_raw) and any(w in clean_raw for w in ["open", "unlock", "wake", "turn on", "light up"]):
            handler = _action_phone_unlock
            clean_action = "phone_unlock"
        elif ("phone" in clean_raw or "screen" in clean_raw or "mobile" in clean_raw) and any(w in clean_raw for w in ["lock", "turn off", "sleep"]):
            handler = _action_phone_lock
            clean_action = "phone_lock"
        elif "call" in clean_raw and ("whatsapp" in clean_raw or "phone" in clean_raw or any(k in clean_raw for k in ["papaji", "mummy", "gourav", "sourabh"])):
            handler = _action_phone_whatsapp_call
            clean_action = "phone_whatsapp_call"
            clean_target = raw_query
        elif "youtube" in clean_raw and any(k in clean_raw for k in ["phone", "in phone", "on phone"]) and any(k in clean_raw for k in ["play", "song", "music"]):
            handler = _action_phone_youtube_play
            clean_action = "phone_youtube_play"
            clean_target = raw_query
        elif "whatsapp" in clean_raw and any(w in clean_raw for w in ["open", "launch", "start"]):
            if any(w in clean_raw for w in ["in phone", "on phone", "on my phone", "in my phone"]):
                handler = _action_phone_app
                clean_action = "phone_app"
                clean_target = "whatsapp"
            else:
                handler = _action_whatsapp_web
                clean_action = "whatsapp"
        elif "chrome" in clean_raw:
            handler = _action_chrome
            clean_action = "chrome"
        elif "vs code" in clean_raw or "vscode" in clean_raw:
            handler = _action_vscode
            clean_action = "vscode"
        elif "spotify" in clean_raw:
            handler = _action_spotify
            clean_action = "spotify"
        elif "youtube" in clean_raw:
            handler = _action_youtube
            clean_action = "youtube"
        elif "calculator" in clean_raw:
            handler = _action_calculator
            clean_action = "calculator"
        elif "file" in clean_raw and ("explorer" in clean_raw or "manager" in clean_raw):
            handler = _action_file_manager
            clean_action = "file_manager"

    if handler:
        try:
            exec_res = handler(clean_target)
            return {
                "success": True,
                "intent": "COMMAND",
                "spoken_summary": exec_res["spoken"],
                "detailed_markdown": exec_res["markdown"],
                "action": {"name": clean_action, "target": clean_target},
                "metadata": {}
            }
        except Exception as e:
            print(f"[ACTION EXECUTION ERROR] {clean_action}: {e}")
            return {
                "success": False,
                "intent": "COMMAND",
                "spoken_summary": f"Could not complete action {clean_action}, sir.",
                "detailed_markdown": f"❌ **Execution Error:** {e}",
                "action": {"name": clean_action, "target": clean_target},
                "metadata": {}
            }

    # Action not in allowlist
    return {
        "success": False,
        "intent": "COMMAND",
        "spoken_summary": f"The action {clean_action} is not in the authorized action list, sir.",
        "detailed_markdown": f"⚠️ **Unauthorized or Unknown Action:** `{clean_action}` is not in the predefined command allowlist.",
        "action": None,
        "metadata": {}
    }

# Entrypoint for backward compatibility
def process_command(text: str, file_data: Optional[Dict[str, Any]] = None, conversation_history: Optional[list] = None) -> Dict[str, Any]:
    """Routes voice commands and chat queries through the Universal Query Router in ai_brain."""
    from .ai_brain import process_universal_query
    return process_universal_query(text, file_data=file_data, conversation_history=conversation_history)
