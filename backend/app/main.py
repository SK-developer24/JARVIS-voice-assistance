"""
JARVIS FastAPI Backend Server
Provides WebSocket & REST endpoints for real-time dashboard telemetry, voice processing, phone control, and Universal Gemini Intelligence
"""
import asyncio
import json
import os
import subprocess
import webbrowser
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from .config import settings
from .system_monitor import get_system_telemetry
from .intent_router import process_command, execute_allowlisted_action
from .speech_engine import speech_engine
from .phone_controller import phone_controller
from .ai_brain import process_universal_query, set_gemini_api_key, get_gemini_api_key

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="JARVIS Voice Controlled AI Assistant Backend"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory activity history
activity_history = [
    {"id": 1, "time": "16:10:24", "text": "Opened YouTube", "type": "app"},
    {"id": 2, "time": "16:09:15", "text": "Searched Python tutorials", "type": "web"},
    {"id": 3, "time": "16:08:02", "text": "Opened VS Code", "type": "app"},
    {"id": 4, "time": "16:07:10", "text": "Played Music", "type": "media"},
    {"id": 5, "time": "16:06:45", "text": "System Scan Completed", "type": "system"},
]

def log_activity(text: str, act_type: str = "app"):
    now = datetime.now().strftime("%H:%M:%S")
    new_entry = {
        "id": len(activity_history) + 1,
        "time": now,
        "text": text,
        "type": act_type
    }
    activity_history.insert(0, new_entry)
    if len(activity_history) > 20:
        activity_history.pop()
    return new_entry

class CommandRequest(BaseModel):
    command: str
    file_data: Optional[Dict[str, Any]] = None
    conversation_history: Optional[List[Dict[str, str]]] = None

class ActionRequest(BaseModel):
    action: str
    target: str = ""

class ChatRequest(BaseModel):
    prompt: str
    file_data: Optional[Dict[str, Any]] = None
    conversation_history: Optional[List[Dict[str, str]]] = None

class SettingsUpdateRequest(BaseModel):
    gemini_api_key: Optional[str] = None
    gemini_model: Optional[str] = None
    search_provider: Optional[str] = None
    search_api_key: Optional[str] = None
    phone_ip: Optional[str] = None
    phone_pin: Optional[str] = None

@app.get("/api/settings")
def get_settings_api():
    return {
        "gemini_api_key": get_gemini_api_key(),
        "gemini_model": getattr(settings, "GEMINI_MODEL", "gemini-1.5-flash"),
        "search_provider": getattr(settings, "SEARCH_PROVIDER", "duckduckgo"),
        "search_api_key": getattr(settings, "SEARCH_API_KEY", ""),
        "phone_ip": settings.PHONE_IP,
        "phone_pin": getattr(settings, "PHONE_PIN", "")
    }

@app.post("/api/settings")
def update_settings_api(req: SettingsUpdateRequest):
    if req.gemini_api_key is not None:
        set_gemini_api_key(req.gemini_api_key)
    if req.gemini_model is not None:
        settings.GEMINI_MODEL = req.gemini_model.strip()
    if req.search_provider is not None:
        settings.SEARCH_PROVIDER = req.search_provider.strip()
    if req.search_api_key is not None:
        settings.SEARCH_API_KEY = req.search_api_key.strip()
    if req.phone_ip is not None:
        settings.PHONE_IP = req.phone_ip.strip()
    if req.phone_pin is not None:
        settings.PHONE_PIN = req.phone_pin.strip()
    return {"status": "success", "message": "Settings updated successfully"}

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "ONLINE",
        "student": settings.USER_NAME,
        "mentor": settings.MENTOR_NAME
    }

@app.get("/api/telemetry")
def get_telemetry():
    telemetry = get_system_telemetry()
    telemetry["phone"] = phone_controller.get_device_status()
    return telemetry

@app.get("/api/phone/status")
def get_phone_status():
    return phone_controller.get_device_status()

@app.get("/api/activities")
def get_activities():
    return activity_history

@app.post("/api/command")
def execute_command_api(req: CommandRequest):
    result = process_universal_query(
        prompt=req.command,
        file_data=req.file_data,
        conversation_history=req.conversation_history
    )
    if result.get("success"):
        act_type = "command" if result.get("intent") == "COMMAND" else "ai"
        log_activity(result.get("spoken_summary", req.command), act_type)
        if result.get("spoken_summary"):
            speech_engine.speak(result.get("spoken_summary", ""))
    return result

@app.post("/api/ai/chat")
def ai_chat_api(req: ChatRequest):
    result = process_universal_query(
        prompt=req.prompt,
        file_data=req.file_data,
        conversation_history=req.conversation_history
    )
    if result.get("success"):
        act_type = "command" if result.get("intent") == "COMMAND" else "ai"
        log_activity(result.get("spoken_summary", req.prompt), act_type)
        if result.get("spoken_summary"):
            speech_engine.speak(result.get("spoken_summary", ""))
    return result

@app.post("/api/actions/launch")
def launch_action(req: ActionRequest):
    res = execute_allowlisted_action(req.action, req.target)
    if res.get("success"):
        log_activity(res.get("spoken_summary", req.action), "app")
        speech_engine.speak(res.get("spoken_summary", ""))
    return res

# Active WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast_json(self, data: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except Exception:
                pass

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Broadcast live hardware metrics & phone status
            telemetry = get_system_telemetry()
            telemetry["phone"] = phone_controller.get_device_status()
            payload = {
                "type": "TELEMETRY_UPDATE",
                "data": telemetry,
                "activities": activity_history[:5]
            }
            await websocket.send_json(payload)
            
            # Listen for client WebSocket events with 1s timeout
            try:
                msg_raw = await asyncio.wait_for(websocket.receive_text(), timeout=1.0)
                msg_data = json.loads(msg_raw)
                event_type = msg_data.get("type")
                
                # 1. PROCESS VOICE OR TEXT COMMAND / AI CHAT
                if event_type in ["PROCESS_VOICE_COMMAND", "AI_CHAT"]:
                    transcript = msg_data.get("transcript") or msg_data.get("prompt", "")
                    file_data = msg_data.get("file_data")
                    conversation_history = msg_data.get("conversation_history")
                    
                    result = process_universal_query(
                        prompt=transcript,
                        file_data=file_data,
                        conversation_history=conversation_history
                    )
                    
                    if result.get("success"):
                        act_type = "command" if result.get("intent") == "COMMAND" else "ai"
                        log_activity(result.get("spoken_summary", transcript), act_type)
                        if result.get("spoken_summary"):
                            speech_engine.speak(result.get("spoken_summary", ""))

                    # Send immediate normalized response back to UI
                    resp_type = "COMMAND_RESULT" if event_type == "PROCESS_VOICE_COMMAND" else "AI_CHAT_RESULT"
                    await websocket.send_json({
                        "type": resp_type,
                        "transcript": transcript,
                        "prompt": transcript,
                        "result": result,
                        "activities": activity_history[:5]
                    })

                # 2. TRIGGER DIRECT ALLOWLISTED ACTION
                elif event_type == "TRIGGER_ACTION":
                    action_name = msg_data.get("action", "")
                    target = msg_data.get("target", "")
                    res = execute_allowlisted_action(action_name, target)
                    if res.get("success"):
                        log_activity(res.get("spoken_summary", action_name), "app")
                        speech_engine.speak(res.get("spoken_summary", ""))
                    await websocket.send_json({
                        "type": "ACTION_RESULT",
                        "action": action_name,
                        "result": res,
                        "activities": activity_history[:5]
                    })

            except asyncio.TimeoutError:
                pass

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
