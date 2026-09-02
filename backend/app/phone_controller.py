"""
JARVIS Android Phone Controller (ADB Bridge with Auto-Discovery & Zero-Config Reconnect)
Enables cross-device automation for Android phones (WhatsApp calls, apps, system controls, screen unlock)
"""
import os
import re
import time
import json
import shutil
import socket
import subprocess
import urllib.parse
from pathlib import Path

from .config import settings

CONTACTS_FILE = Path(__file__).parent / "contacts.json"

class PhoneController:
    def __init__(self):
        self._adb_bin = self._find_adb_binary()
        print(f"[PHONE CONTROLLER] Resolved ADB binary at: {self._adb_bin}")
        print(f"[PHONE CONTROLLER] Configured Phone Target: {settings.PHONE_IP}:{settings.PHONE_PORT}")

    def _find_adb_binary(self) -> str:
        """Finds the absolute path to adb.exe or defaults to 'adb'."""
        found = shutil.which("adb")
        if found:
            return f'"{found}"'

        local_app_data = os.getenv("LOCALAPPDATA", "")
        if local_app_data:
            winget_dir = Path(local_app_data) / "Microsoft" / "WinGet" / "Packages"
            if winget_dir.exists():
                for p in winget_dir.glob("**/adb.exe"):
                    return f'"{p}"'

            android_sdk = Path(local_app_data) / "Android" / "Sdk" / "platform-tools" / "adb.exe"
            if android_sdk.exists():
                return f'"{android_sdk}"'

        return "adb"

    def _load_contacts(self) -> dict:
        """Loads contacts dynamically on every call to support live edits."""
        if CONTACTS_FILE.exists():
            try:
                with open(CONTACTS_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return {}

    def get_active_device_id(self) -> str | None:
        """Finds the currently connected and active ADB device ID."""
        try:
            cmd = f"{self._adb_bin} devices"
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=3, shell=True)
            if res.returncode == 0 and res.stdout:
                lines = res.stdout.strip().splitlines()[1:]
                for line in lines:
                    parts = line.split()
                    if len(parts) >= 2 and parts[1] == "device":
                        return parts[0]
        except Exception as e:
            print(f"[ADB GET DEVICE ERROR] {e}")
        return None

    def _get_local_gateway_ip(self) -> str | None:
        """Finds the default gateway IP of the laptop's connected network (often the phone hotspot)."""
        try:
            res = subprocess.run("ipconfig", capture_output=True, text=True, timeout=3, shell=True)
            if res.returncode == 0:
                matches = re.findall(r'Default Gateway[ .:]+([\d\.]+)', res.stdout)
                for m in matches:
                    if m and m != "0.0.0.0":
                        return m
        except Exception:
            pass
        return None

    def _auto_discover_phone(self) -> str | None:
        """
        Auto-discovers and connects to the phone across changing Hotspot/Wi-Fi subnets.
        No manual IP editing required!
        """
        # 1. First check if device is already connected
        dev_id = self.get_active_device_id()
        if dev_id:
            return dev_id

        # 2. Build list of candidate IPs
        candidates = ["10.199.161.165"]
        if settings.PHONE_IP and settings.PHONE_IP not in candidates:
            candidates.append(settings.PHONE_IP)

        # Candidate 2: Local Default Gateway
        gw = self._get_local_gateway_ip()
        if gw and gw not in candidates:
            candidates.append(gw)

        # Candidate C: Common Android Hotspot Gateways
        for fallback in ["192.168.43.1", "10.199.161.165", "192.168.225.1", "192.168.1.1"]:
            if fallback not in candidates:
                candidates.append(fallback)

        # 3. Fast probe candidate IPs
        port = settings.PHONE_PORT or 5555
        for ip in candidates:
            try:
                target = f"{ip}:{port}"
                print(f"[PHONE PROBE] Trying auto-connect to {target}...")
                subprocess.run(f"{self._adb_bin} connect {target}", capture_output=True, text=True, timeout=2, shell=True)
                dev_id = self.get_active_device_id()
                if dev_id:
                    print(f"[PHONE CONNECTED] Successfully auto-linked to {dev_id}!")
                    settings.PHONE_IP = ip # Update in memory
                    return dev_id
            except Exception:
                continue

        return None

    def _ensure_connected(self) -> str | None:
        """Ensures phone is connected using auto-discovery."""
        return self._auto_discover_phone()

    def _run_adb_cmd(self, command_str: str) -> tuple[bool, str]:
        """Runs an ADB command targeting the active device with explicit logging."""
        dev_id = self._ensure_connected()
        prefix = f"{self._adb_bin} -s {dev_id} " if dev_id else f"{self._adb_bin} "
        full_command = f"{prefix}{command_str}"

        try:
            print(f"[ADB EXEC] {full_command}")
            result = subprocess.run(
                full_command,
                capture_output=True,
                text=True,
                timeout=6,
                shell=True
            )
            out = result.stdout.strip() or result.stderr.strip()
            print(f"[ADB RESULT] Code: {result.returncode} | Output: {out}")
            return (result.returncode == 0, out)
        except Exception as e:
            print(f"[ADB ERROR] {e}")
            return (False, str(e))

    def get_screen_size(self) -> tuple[int, int]:
        """Gets the device's physical screen dimensions (width, height)."""
        _, out = self._run_adb_cmd("shell wm size")
        match = re.search(r'Physical size:\s*(\d+)x(\d+)', out)
        if match:
            return (int(match.group(1)), int(match.group(2)))
        return (1080, 2400)

    def wake_screen(self):
        """Wakes up phone screen and unlocks PIN if configured."""
        self._run_adb_cmd("shell input keyevent 224") # Keyevent WAKEUP
        self._run_adb_cmd("shell wm dismiss-keyguard")
        
        # Swipe up to show PIN lockpad
        self._run_adb_cmd("shell input swipe 500 1600 500 400 200")
        
        # If user configured their PIN in config.py or settings, enter it
        pin = getattr(settings, "PHONE_PIN", "").strip()
        if pin:
            time.sleep(0.4)
            self._run_adb_cmd(f"shell input text {pin}")
            self._run_adb_cmd("shell input keyevent 66") # Keyevent ENTER
            time.sleep(0.3)
            self._run_adb_cmd("shell input keyevent 3")  # Keyevent HOME

    def unlock_phone(self, pin: str = "") -> dict:
        """Explicitly wakes up, swipes up, and enters the phone PIN to unlock screen."""
        self._ensure_connected()
        self._run_adb_cmd("shell input keyevent 224") # Keyevent WAKEUP
        self._run_adb_cmd("shell input keyevent 82")  # Keyevent MENU (Wakes & dismisses lockscreen on Xiaomi/POCO)
        self._run_adb_cmd("shell wm dismiss-keyguard")
        time.sleep(0.2)
        self._run_adb_cmd("shell input swipe 540 1900 540 300 120") # Swipe up from bottom on POCO screen
        
        active_pin = pin.strip() or getattr(settings, "PHONE_PIN", "").strip()
        if active_pin:
            time.sleep(0.4)
            self._run_adb_cmd(f"shell input text {active_pin}")
            self._run_adb_cmd("shell input keyevent 66") # Enter
            time.sleep(0.2)
            self._run_adb_cmd("shell input keyevent 3")  # Home
            return {
                "success": True,
                "message": "Screen unlocked on POCO M3 Pro 5G with PIN.",
                "spoken": "Unlocking your phone screen now, sir."
            }

        time.sleep(0.2)
        self._run_adb_cmd("shell input keyevent 82") # Menu key to unlock swipe-only lockscreen
        return {
            "success": True,
            "message": "Screen awakened and swiped up on POCO M3 Pro 5G.",
            "spoken": "Phone screen awakened and unlocked, sir."
        }

    def get_device_status(self) -> dict:
        """Checks if an Android phone is connected via ADB."""
        dev_id = self._ensure_connected()
        if dev_id:
            _, model = self._run_adb_cmd("shell getprop ro.product.model")
            return {
                "connected": True,
                "device_id": dev_id,
                "model": model.strip() or "POCO M3 PRO 5G",
                "status": "CONNECTED"
            }

        return {
            "connected": False,
            "device_id": None,
            "model": "POCO M3 PRO 5G (Searching...)",
            "status": "DISCONNECTED"
        }

    def launch_whatsapp_call(self, contact_query: str, call_type: str = "video") -> dict:
        """
        Launches WhatsApp and taps the Video Call or Audio Call button.
        """
        self.wake_screen()
        contacts = self._load_contacts()
        clean_q = contact_query.lower().strip()

        matched_contact = None
        for key, info in contacts.items():
            if key in clean_q or info.get("name", "").lower() in clean_q:
                matched_contact = info
                break

        if not matched_contact:
            matched_contact = contacts.get(clean_q)

        phone_num = matched_contact.get("phone", "") if matched_contact else ""
        display_name = matched_contact.get("name", contact_query.title()) if matched_contact else contact_query.title()

        if phone_num:
            clean_num = phone_num.replace("+", "").replace("-", "").replace(" ", "")
            # Open direct conversation via deep link
            self._run_adb_cmd(f'shell am start -a android.intent.action.VIEW -d "https://api.whatsapp.com/send?phone={clean_num}"')
            self._run_adb_cmd(f'shell am start -a android.intent.action.VIEW -d "whatsapp://send?phone={clean_num}"')
            
            # Wait for chat window to render
            time.sleep(1.5)
            
            width, height = self.get_screen_size()
            
            # Top Action Bar Call Button Coordinates
            if call_type == "video":
                tap_x = int(width * 0.81)
                tap_y = int(height * 0.072)
            else:
                tap_x = int(width * 0.93)
                tap_y = int(height * 0.072)
            
            print(f"[AUTO-CALL] Tapping {call_type} button at ({tap_x}, {tap_y}) on {width}x{height} screen...")
            self._run_adb_cmd(f"shell input tap {tap_x} {tap_y}")
            
            # Additional tap slightly adjusted in case of different status bar height
            time.sleep(0.4)
            self._run_adb_cmd(f"shell input tap {int(width * 0.80)} {int(height * 0.082)}")
            
            # Confirmation dialog handler ("Start video call? -> Call")
            time.sleep(0.8)
            confirm_x = int(width * 0.76)
            confirm_y = int(height * 0.58)
            self._run_adb_cmd(f"shell input tap {confirm_x} {confirm_y}")

            action_desc = "video call" if call_type == "video" else "call"
            return {
                "success": True,
                "action": "whatsapp_call",
                "contact": display_name,
                "phone": phone_num,
                "message": f"Calling {display_name} ({phone_num}) on WhatsApp now, sir.",
                "spoken": f"Calling {display_name} on WhatsApp now, sir."
            }

        self._run_adb_cmd("shell am start -n com.whatsapp/.Main")
        return {
            "success": True,
            "action": "whatsapp_open",
            "contact": display_name,
            "message": f"Opening WhatsApp for {display_name} on your phone, sir.",
            "spoken": f"Opening WhatsApp for {display_name} on your phone, sir."
        }

    def play_youtube_video(self, query: str = "") -> dict:
        """Searches for music/videos on YouTube on the phone and automatically starts playback."""
        self.wake_screen()
        clean_q = query.strip() or "trending music"
        encoded = urllib.parse.quote(clean_q)
        
        # 1. Open YouTube Search intent on phone
        self._run_adb_cmd(f'shell am start -a android.intent.action.VIEW -d "https://www.youtube.com/results?search_query={encoded}"')
        
        # 2. Wait for search results to render
        time.sleep(2.0)
        
        # 3. Tap the first video thumbnail to start playback
        width, height = self.get_screen_size()
        tap_x = int(width * 0.5)
        tap_y = int(height * 0.28) # First result thumbnail on POCO screen
        self._run_adb_cmd(f"shell input tap {tap_x} {tap_y}")
        
        # Backup tap slightly lower in case of search filter header
        time.sleep(0.4)
        self._run_adb_cmd(f"shell input tap {tap_x} {int(height * 0.32)}")

        return {
            "success": True,
            "action": "youtube_play",
            "query": clean_q,
            "message": f"Playing '{clean_q}' on YouTube on your phone, sir.",
            "spoken": f"Playing {clean_q} on YouTube on your phone now, sir."
        }

    def launch_phone_app(self, app_name: str) -> dict:
        """Launches standard apps on the Android phone."""
        self.wake_screen()
        app_map = {
            "youtube": "shell am start -n com.google.android.youtube/com.google.android.apps.youtube.app.WatchWhileActivity",
            "whatsapp": "shell am start -n com.whatsapp/.Main",
            "chrome": "shell am start -n com.android.chrome/com.google.android.apps.chrome.Main",
            "spotify": "shell monkey -p com.spotify.music -c android.intent.category.LAUNCHER 1",
            "camera": "shell am start -a android.media.action.IMAGE_CAPTURE",
            "settings": "shell am start -a android.settings.SETTINGS",
            "dialer": "shell am start -a android.intent.action.DIAL"
        }

        clean_app = app_name.lower().strip()
        cmd = app_map.get(clean_app)

        if cmd:
            self._run_adb_cmd(cmd)
            return {
                "success": True,
                "app": clean_app.title(),
                "message": f"Opening {clean_app.title()} on your Android phone, sir.",
                "spoken": f"Opening {clean_app.title()} on your phone, sir."
            }

        # Fallback generic package start
        self._run_adb_cmd(f"shell monkey -p {clean_app} -c android.intent.category.LAUNCHER 1")
        return {
            "success": True,
            "app": clean_app.title(),
            "message": f"Opening {clean_app.title()} on your phone, sir.",
            "spoken": f"Opening {clean_app.title()} on your phone, sir."
        }

    def phone_utility(self, action: str) -> dict:
        """Performs hardware/system utility actions on phone."""
        act = action.lower()
        if "unlock" in act:
            return self.unlock_phone()
        elif "screenshot" in act:
            self._run_adb_cmd("shell screencap -p /sdcard/jarvis_screenshot.png")
            return {
                "success": True,
                "message": "Screenshot captured on your Android phone, sir.",
                "spoken": "Screenshot captured on your phone, sir."
            }
        elif "lock" in act or "power" in act:
            self._run_adb_cmd("shell input keyevent 26")
            return {
                "success": True,
                "message": "Screen locked on your Android phone, sir.",
                "spoken": "Locking your phone screen, sir."
            }
        elif "volume up" in act:
            self._run_adb_cmd("shell input keyevent 24")
            return {"success": True, "message": "Increased phone volume.", "spoken": "Increasing phone volume, sir."}
        elif "volume down" in act:
            self._run_adb_cmd("shell input keyevent 25")
            return {"success": True, "message": "Decreased phone volume.", "spoken": "Decreasing phone volume, sir."}

        return {"success": False, "message": "Unknown phone utility action."}

phone_controller = PhoneController()
