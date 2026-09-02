"""
JARVIS Universal Intelligent Brain & Intent Router
Powered by Google Gemini with Real-Time Web RAG Search, Context Memory, File Intelligence & Allowlisted Action Routing
"""
import os
import urllib.request
import urllib.parse
import json
import re
from typing import List, Dict, Any, Optional
from pathlib import Path

from .config import settings
from .web_search import WebRAGPipeline

SETTINGS_FILE = Path(__file__).parent / "user_settings.json"

def _load_persisted_key() -> str:
    if SETTINGS_FILE.exists():
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("gemini_api_key", "").strip()
        except Exception:
            pass
    return ""

_DYNAMIC_GEMINI_KEY = _load_persisted_key() or os.getenv("GEMINI_API_KEY", "")

def set_gemini_api_key(key: str):
    """Dynamically sets Gemini API key at runtime and persists it permanently to user_settings.json."""
    global _DYNAMIC_GEMINI_KEY
    _DYNAMIC_GEMINI_KEY = (key or "").strip()
    os.environ["GEMINI_API_KEY"] = _DYNAMIC_GEMINI_KEY
    
    # Save permanently to disk
    try:
        data = {}
        if SETTINGS_FILE.exists():
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
        data["gemini_api_key"] = _DYNAMIC_GEMINI_KEY
        with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"[SETTINGS SAVE ERROR] {e}")

    masked = f"{_DYNAMIC_GEMINI_KEY[:6]}...{_DYNAMIC_GEMINI_KEY[-4:]}" if len(_DYNAMIC_GEMINI_KEY) > 10 else "SET"
    print(f"[AI BRAIN] Persisted Gemini API Key ({masked})")

def get_gemini_api_key() -> str:
    global _DYNAMIC_GEMINI_KEY
    if not _DYNAMIC_GEMINI_KEY:
        _DYNAMIC_GEMINI_KEY = _load_persisted_key()
    return _DYNAMIC_GEMINI_KEY or os.getenv("GEMINI_API_KEY", "").strip()

JARVIS_SYSTEM_PROMPT = """You are J.A.R.V.I.S., a highly intelligent, polite, technically sophisticated AI assistant.
You are assisting the user through a desktop voice assistant.
For every answer:
1. Understand the user's actual intent.
2. Give a concise, clear 1-2 sentence spoken summary first.
3. Follow up with structured, insightful technical details, code examples, or explanations in Markdown.
4. For programming questions, provide correct, production-grade code and concise explanations.
5. Do not invent facts.
6. If the user asks for a specific format (e.g. table, bullet points, JSON, 3 lines, quiz), prioritize and follow that exact format strictly.
7. Do not unnecessarily mention that you are an AI.
8. Address the user naturally, professionally, and respectfully.
"""

INTENT_CLASSIFIER_PROMPT = """You are the intent classification engine for J.A.R.V.I.S., a desktop and mobile AI assistant.
Classify the user's request into exactly one of:
COMMAND
CHAT
WEB_SEARCH
FILE_ANALYSIS

COMMAND:
Use this when the user wants JARVIS to perform an action on their computer or phone.
Examples:
"Open Chrome", "Launch VS Code", "Open YouTube", "Unlock my phone", "Open WhatsApp on my phone", "Call papaji on WhatsApp", "Play music on YouTube on phone", "Open calculator", "Open file explorer", "Lock my phone", "Take a screenshot", "Mute audio", "Turn up volume".

CHAT:
Use this for normal questions, explanations, programming questions, educational questions, brainstorming, comparisons, mathematics, science, history, general knowledge, writing, reasoning, debugging, etc.
Examples:
"What is Python?", "Explain neural networks", "How does TCP work?", "Write a C++ program for binary search", "Compare Python and C++", "Why is the sky blue?", "Explain Dijkstra's algorithm", "Give me ideas for my AIML project", "What is machine learning?", "What is CRISPR?", "Explain quantum entanglement", "Who invented the transistor?", "How does Docker work?".

WEB_SEARCH:
Use this when the user explicitly requires current, live, recent, or internet-based information.
Examples:
"What are today's news?", "What happened today in India?", "Search the web for the latest NVIDIA news", "What is the current price of Bitcoin?", "What is the weather today?", "Find the latest AI research", "Search Google for the best Python courses", "What are the latest updates about GPT?", "What is the latest Python version?", "Who is currently the CEO of OpenAI?", "What happened in technology this week?".
Note: If a question can be answered reliably using general knowledge and does not require current live information, classify it as CHAT.

FILE_ANALYSIS:
Use this ONLY when a file is attached AND the user asks to analyze, summarize, explain, extract information from, compare, quiz, or answer questions based on that attached file.
Examples:
"Summarize this PDF", "Explain this document", "Create a quiz from this file", "What does this file say about neural networks?", "Find the important points in this document".
Note: The existence of a file alone must NOT force every query into FILE_ANALYSIS if the user is asking an unrelated general question or command.

IMPORTANT RULES:
- Do NOT classify a normal knowledge question as COMMAND merely because it contains words such as "open", "run", "use", "show", "tell", "compare", or "explain".
- COMMAND means the user actually wants JARVIS to perform an external software or hardware action.

Return ONLY a valid JSON object with this exact structure:
{
  "intent": "COMMAND | CHAT | WEB_SEARCH | FILE_ANALYSIS",
  "confidence": 0.95,
  "reason": "short explanation of classification",
  "action": "action_name_if_command_else_empty",
  "target": "target_app_or_device_or_query_if_command_else_empty"
}
"""

# =========================================================================
# 1. BOUNDED IN-MEMORY CONVERSATION MEMORY (MAX 20 TURNS)
# =========================================================================
class ConversationMemory:
    def __init__(self, max_turns: int = 20):
        self.max_turns = max_turns
        self.history: List[Dict[str, str]] = []

    def add_message(self, role: str, text: str):
        self.history.append({"role": role, "text": text})
        if len(self.history) > self.max_turns:
            self.history = self.history[-self.max_turns:]

    def get_history(self) -> List[Dict[str, str]]:
        return list(self.history)

    def clear(self):
        self.history = []

global_memory = ConversationMemory(max_turns=20)
web_rag_pipeline = WebRAGPipeline()

# =========================================================================
# 2. CALL GEMINI API HELPER (MULTIMODAL VISION & CONFIGURABLE MODEL)
# =========================================================================
def call_gemini_api(contents: List[Dict[str, Any]], system_prompt: str = "") -> Optional[str]:
    """Helper to send structured multimodal payload (text + images) to Google Gemini API."""
    api_key = get_gemini_api_key()
    if not api_key:
        return None

    model_name = getattr(settings, "GEMINI_MODEL", "") or "gemini-1.5-flash"

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        
        # Build strictly valid alternating contents supporting text + inline_data images
        cleaned_contents = []
        for turn in contents:
            role = turn.get("role", "user")
            if role == "assistant":
                role = "model"
            elif role not in ["user", "model"]:
                role = "user"
            
            raw_parts = turn.get("parts", [])
            valid_parts = []
            for p in raw_parts:
                if isinstance(p, dict):
                    if "text" in p and p["text"].strip():
                        valid_parts.append({"text": p["text"]})
                    elif "inline_data" in p:
                        valid_parts.append(p)
                elif isinstance(p, str) and p.strip():
                    valid_parts.append({"text": p})
            
            if not valid_parts:
                continue
            
            if cleaned_contents and cleaned_contents[-1]["role"] == role:
                cleaned_contents[-1]["parts"].extend(valid_parts)
            else:
                cleaned_contents.append({"role": role, "parts": valid_parts})

        if not cleaned_contents:
            return None

        # Ensure first turn is user
        if cleaned_contents[0]["role"] != "user":
            cleaned_contents[0]["role"] = "user"

        payload: Dict[str, Any] = {"contents": cleaned_contents}
        if system_prompt:
            payload["system_instruction"] = {
                "parts": [{"text": system_prompt}]
            }

        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
        
        with urllib.request.urlopen(req, timeout=15) as response:
            res_body = response.read().decode("utf-8")
            res_json = json.loads(res_body)
            candidates = res_json.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    return parts[0].get("text", "").strip()
    except urllib.error.HTTPError as he:
        err_msg = he.read().decode('utf-8', errors='ignore')
        print(f"[GEMINI HTTP ERROR {he.code}] {err_msg}")
    except Exception as e:
        print(f"[GEMINI API ERROR] {e}")
    return None

# =========================================================================
# 3. GEMINI INTENT CLASSIFIER (STRICT JSON)
# =========================================================================
def classify_intent_with_gemini(query: str, has_file: bool = False, filename: str = "") -> Dict[str, Any]:
    """
    Uses Gemini to classify user intent into COMMAND, CHAT, WEB_SEARCH, or FILE_ANALYSIS.
    Returns parsed dictionary.
    """
    # If a file/image is attached, prioritize FILE_ANALYSIS
    if has_file:
        return {
            "intent": "FILE_ANALYSIS",
            "confidence": 0.98,
            "reason": "Attached file / image analysis",
            "action": "",
            "target": ""
        }

    file_context = f"\n[ATTACHED FILE PRESENT]: '{filename}'" if has_file else "\n[NO ATTACHED FILE]"
    user_prompt = f"{INTENT_CLASSIFIER_PROMPT}\n{file_context}\n\nUSER REQUEST: \"{query}\"\n\nJSON RESPONSE:"

    contents = [{"role": "user", "parts": [{"text": user_prompt}]}]
    raw_response = call_gemini_api(contents)

    if raw_response:
        try:
            clean_json = raw_response
            if "```json" in clean_json:
                clean_json = clean_json.split("```json")[1].split("```")[0].strip()
            elif "```" in clean_json:
                clean_json = clean_json.split("```")[1].split("```")[0].strip()
            
            data = json.loads(clean_json.strip())
            intent = data.get("intent", "").upper()
            if intent in ["COMMAND", "CHAT", "WEB_SEARCH", "FILE_ANALYSIS"]:
                return {
                    "intent": intent,
                    "confidence": float(data.get("confidence", 0.9)),
                    "reason": data.get("reason", "Classified by Gemini"),
                    "action": data.get("action", ""),
                    "target": data.get("target", "")
                }
        except Exception as e:
            print(f"[CLASSIFIER PARSE WARNING] {e} | Raw: {raw_response}")

    # Fallback heuristic classifier
    return fallback_classify_intent(query, has_file)

def fallback_classify_intent(query: str, has_file: bool = False) -> Dict[str, Any]:
    """Graceful local classifier when Gemini API is offline or unconfigured."""
    if has_file:
        return {"intent": "FILE_ANALYSIS", "confidence": 0.98, "reason": "Attached file present", "action": "", "target": ""}

    clean = re.sub(r'[^\w\s\+\#]', '', query.lower()).strip()
    # Strip wake words and politeness prefixes
    clean = re.sub(r'^(hey\s+jarvis|hello\s+jarvis|ok\s+jarvis|hi\s+jarvis|jarvis|please)\s+', '', clean, flags=re.I).strip()

    # 1. Phone actions (wake screen, unlock, lock, call, youtube)
    if ("phone" in clean or "screen" in clean or "mobile" in clean) and any(w in clean for w in ["open", "unlock", "wake", "turn on", "light up"]):
        return {"intent": "COMMAND", "confidence": 0.98, "reason": "Local phone unlock/wake", "action": "phone_unlock", "target": "screen"}
    
    if ("phone" in clean or "screen" in clean or "mobile" in clean) and any(w in clean for w in ["lock", "turn off", "sleep"]):
        return {"intent": "COMMAND", "confidence": 0.98, "reason": "Local phone lock", "action": "phone_lock", "target": "screen"}

    if "whatsapp" in clean and any(w in clean for w in ["call", "video call", "dial", "ring"]):
        return {"intent": "COMMAND", "confidence": 0.9, "reason": "Local phone WhatsApp call", "action": "phone_whatsapp_call", "target": clean}
    
    if "youtube" in clean and any(w in clean for w in ["in phone", "on phone", "on my phone"]) and any(w in clean for w in ["play", "song", "music"]):
        return {"intent": "COMMAND", "confidence": 0.9, "reason": "Local phone YouTube play", "action": "phone_youtube_play", "target": clean}

    # 2. PC application commands
    for app in ["whatsapp", "chrome", "vscode", "vs code", "youtube", "spotify", "calculator", "calc", "file explorer", "files", "file manager", "cmd", "terminal", "camera", "settings"]:
        if app in clean and any(w in clean for w in ["open", "launch", "start", "run", "show"]):
            return {"intent": "COMMAND", "confidence": 0.95, "reason": "Local app launch", "action": app.replace(" ", "_"), "target": app}

    # 3. Web search temporal keywords (Current/Live/News/Price)
    temporal_triggers = [
        "search the web", "search google", "current price", "today news", "latest news",
        "today's weather", "weather in", "latest updates about", "latest python version",
        "current ceo", "who is currently", "what happened today", "latest research",
        "current gpu price", "latest models", "latest developments", "best react tutorials"
    ]
    if any(trigger in clean for trigger in temporal_triggers):
        return {"intent": "WEB_SEARCH", "confidence": 0.9, "reason": "Local temporal search keyword", "action": "", "target": ""}

    # Default to CHAT
    return {"intent": "CHAT", "confidence": 0.8, "reason": "Default to general conversational chat", "action": "", "target": ""}

# =========================================================================
# 4. MULTIMODAL VISION & FILE ANALYSIS PIPELINE
# =========================================================================
def handle_file_analysis_pipeline(query: str, file_data: Dict[str, Any], history: List[Dict[str, str]]) -> Dict[str, Any]:
    """Analyzes user attached document or image using Gemini multimodal vision & reasoning."""
    filename = file_data.get("filename", "attached_file")
    content = file_data.get("content", "")
    file_type = file_data.get("file_type", "")

    # Detect image (Data URL or image extension)
    is_image = False
    image_mime = "image/jpeg"
    image_b64 = ""

    if content.startswith("data:image/"):
        is_image = True
        try:
            header, image_b64 = content.split(",", 1)
            image_mime = header.split(";")[0].replace("data:", "")
        except Exception:
            pass
    elif any(filename.lower().endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"]):
        is_image = True
        image_mime = "image/png" if filename.lower().endswith(".png") else "image/jpeg"
        image_b64 = content.split(",", 1)[-1] if "," in content else content

    user_parts = []
    
    if is_image and image_b64:
        user_parts.append({
            "inline_data": {
                "mime_type": image_mime,
                "data": image_b64
            }
        })
        user_prompt = f"""{JARVIS_SYSTEM_PROMPT}

The user has attached an image file: `{filename}`.
User Question: "{query or 'Describe and identify what is in this image in detail.'}"

INSTRUCTIONS:
1. Examine this image carefully and identify all subjects (e.g. cat/dog breed, person, object, text, diagram, scenery).
2. Answer the user's specific question directly and accurately.
3. Provide a concise 1-2 sentence spoken summary first, followed by clear, structured Markdown.
"""
        user_parts.append({"text": user_prompt})
    else:
        # Text/Document file
        prompt_to_gemini = f"""{JARVIS_SYSTEM_PROMPT}

The user has attached a document:
FILENAME: `{filename}`
FILE CONTENT:
```
{content[:30000]}
```

USER INSTRUCTION: "{query}"

INSTRUCTIONS:
1. Thoroughly inspect and analyze the actual provided file content.
2. If the user asks for a summary, provide an executive summary with key points and takeaways.
3. If the user asks for a quiz / MCQs, generate interactive questions with options and an answer key.
4. If the user asks for detailed explanation or code review, break down the structure, functions, and logic.
5. Provide a 1-2 sentence spoken summary first, followed by rich Markdown.
"""
        user_parts.append({"text": prompt_to_gemini})

    contents = []
    for turn in history[-2:]:
        role = "user" if turn.get("role") == "user" else "model"
        contents.append({"role": role, "parts": [{"text": turn.get("text", "")}]})
    
    contents.append({"role": "user", "parts": user_parts})

    gemini_answer = call_gemini_api(contents)
    if gemini_answer:
        lines = [l.strip() for l in gemini_answer.splitlines() if l.strip()]
        spoken = lines[0] if lines else f"I have analyzed the attached {filename} for you, sir."
        spoken = spoken.replace("*", "").replace("#", "").replace("`", "")
        return {
            "success": True,
            "intent": "FILE_ANALYSIS",
            "answer": gemini_answer,
            "spoken_summary": spoken,
            "detailed_markdown": gemini_answer,
            "sources": [],
            "action": None,
            "metadata": {"filename": filename, "is_image": is_image}
        }

    # Fallback if Gemini is offline
    if is_image:
        fallback_markdown = f"""### 🖼️ Image Attached: `{filename}`

**Image File:** `{filename}` ingested into the multimodal pipeline.

---
> [!NOTE]
> *For real-time visual recognition & breed identification, ensure your standard Google Gemini API Key (`AIzaSy...`) is active in **SETTINGS**.*
"""
    else:
        lines = [l.strip() for l in content.splitlines() if l.strip()]
        sample = "\n".join(lines[:12]) if lines else "Document content is empty or unreadable."
        fallback_markdown = f"""### 📄 Document Analysis: `{filename}`

**Analyzed File:** `{filename}` ({len(lines)} lines parsed)

---

#### 📌 Extracted Document Content:
```text
{sample}
```

#### 🔍 Analysis Summary:
The document has been ingested into the JARVIS pipeline. For unrestricted in-depth generative Q&A and quiz synthesis, ensure your **Gemini API Key** is saved in Settings.
"""

    return {
        "success": True,
        "intent": "FILE_ANALYSIS",
        "answer": fallback_markdown,
        "spoken_summary": f"I have processed {filename}, sir. The breakdown is displayed in your AI Chat.",
        "detailed_markdown": fallback_markdown,
        "sources": [],
        "action": None,
        "metadata": {"filename": filename, "is_image": is_image}
    }

# =========================================================================
# 5. UNIVERSAL CONVERSATIONAL CHAT PIPELINE (WITH CONTEXT MEMORY)
# =========================================================================
def handle_chat_pipeline(query: str, history: List[Dict[str, str]]) -> Dict[str, Any]:
    """Generates intelligent conversational reasoning and technical explanations with full memory."""
    prompt_to_gemini = f"""{JARVIS_SYSTEM_PROMPT}

User Query: "{query}"
"""

    contents = []
    # Include previous conversation context turns for continuous conversational understanding
    for turn in history[-8:]:
        role = "user" if turn.get("role") == "user" else "model"
        contents.append({"role": role, "parts": [{"text": turn.get("text", "")}]})
    
    contents.append({"role": "user", "parts": [{"text": prompt_to_gemini}]})

    gemini_answer = call_gemini_api(contents)
    if gemini_answer:
        lines = [l.strip() for l in gemini_answer.splitlines() if l.strip()]
        spoken = lines[0] if lines else f"Here is the explanation for {query}."
        spoken = spoken.replace("*", "").replace("#", "").replace("`", "")
        return {
            "success": True,
            "intent": "CHAT",
            "answer": gemini_answer,
            "spoken_summary": spoken,
            "detailed_markdown": gemini_answer,
            "sources": [],
            "action": None,
            "metadata": {}
        }

    # Step 2: Live Web Encyclopedia Fallback (Specialized secondary source)
    wiki_res = _fetch_web_encyclopedia(query)
    if wiki_res:
        return {
            "success": True,
            "intent": "CHAT",
            "answer": wiki_res["detailed_markdown"],
            "spoken_summary": wiki_res["spoken_summary"],
            "detailed_markdown": wiki_res["detailed_markdown"],
            "sources": wiki_res.get("sources", []),
            "action": None,
            "metadata": {"encyclopedia": True}
        }

    # Step 3: Offline knowledge cache fallback if network is completely down
    offline_ans = get_offline_knowledge_fallback(query)
    return {
        "success": True,
        "intent": "CHAT",
        "answer": offline_ans["detailed_markdown"],
        "spoken_summary": offline_ans["spoken_summary"],
        "detailed_markdown": offline_ans["detailed_markdown"],
        "sources": [],
        "action": None,
        "metadata": {"fallback": True}
    }

def _fetch_web_encyclopedia(query: str) -> Optional[Dict[str, Any]]:
    """
    Specialized Secondary Source for encyclopedic topics.
    Auto-corrects typos (e.g. 'gwlior' -> 'gwalior') and retrieves canonical entity summaries.
    """
    clean_q = query.strip(' ?.')
    
    typo_map = {
        "gwlior": "gwalior",
        "gwl": "gwalior",
        "deeplearning": "deep learning",
        "machinelearning": "machine learning",
        "blockchaintech": "blockchain",
        "datascience": "data science",
        "artificialintelligence": "artificial intelligence"
    }
    for typo, correction in typo_map.items():
        clean_q = re.sub(r'\b' + re.escape(typo) + r'\b', correction, clean_q, flags=re.I)

    clean_entity = re.sub(r'\b(what is|what are|tell me about|explain|who is|where is|history of|details of|describe|is made by whom|was made by whom|was built by whom|who made|who built|who created|is located in|made by whom|built by whom)\b', ' ', clean_q, flags=re.I)
    clean_entity = re.sub(r'\s+', ' ', clean_entity).strip(' ?.')
    search_target = clean_entity if len(clean_entity) >= 3 else clean_q

    headers = {"User-Agent": "JARVIS-Universal-AI/2.0 (Educational Assistant; sourabh@aiml.edu)"}

    target_title = None
    try:
        search_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(search_target)}&format=json&srlimit=1"
        req = urllib.request.Request(search_url, headers=headers)
        with urllib.request.urlopen(req, timeout=3.5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            search_results = data.get("query", {}).get("search", [])
            if search_results:
                target_title = search_results[0].get("title")
    except Exception:
        pass

    target_title = target_title or search_target.title()

    try:
        encoded_title = urllib.parse.quote(target_title.replace(" ", "_"))
        summary_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{encoded_title}"
        page_url = f"https://en.wikipedia.org/wiki/{encoded_title}"
        req = urllib.request.Request(summary_url, headers=headers)
        with urllib.request.urlopen(req, timeout=3.5) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode('utf-8'))
                title = data.get("title", target_title)
                extract = data.get("extract", "")
                description = data.get("description", "")
                
                if extract and len(extract) > 40:
                    sentences = extract.split('. ')
                    spoken = (sentences[0] + ".") if sentences else extract[:120]
                    
                    markdown = f"""### 🏛️ {title}

**Category:** {description or "Global History, Science & Knowledge"}

---

#### 📌 Overview & Key Insights:
{extract}

---
> [!NOTE]
> *Live encyclopedic information synthesized for `{search_target}`.*
"""
                    return {
                        "spoken_summary": spoken,
                        "detailed_markdown": markdown,
                        "sources": [{"title": title, "url": page_url, "source": "Wikipedia", "published_date": ""}]
                    }
    except Exception:
        pass

    return None

def get_offline_knowledge_fallback(query: str) -> Dict[str, str]:
    """Graceful offline fallback for core topics when network/Gemini is offline."""
    clean = query.lower().strip()
    
    # Greetings & Introductions
    if any(g in clean for g in ["hello", "hi jarvis", "hey jarvis", "good morning", "good evening", "how are you", "who are you", "what can you do"]):
        return {
            "spoken_summary": "Hello Sourabh! All systems are online and operational. How can I assist you today, sir?",
            "detailed_markdown": """### 🤖 J.A.R.V.I.S. Core Online

**Status:** `ONLINE` | **User:** Sourabh Sahu (AIML) | **Mentor:** Dr. Neelam Arya

---

#### ⚡ Core Capabilities:
* 🎙️ **Voice & Hardware Commands:** Screen unlock, WhatsApp calls, PC apps, volume & system controls.
* 🧠 **AI Generative Chat:** Deep explanations, code generation, comparisons, and mathematics.
* 🌐 **Live Web Search:** Current news, prices, and research queries.
* 📄 **Document Intelligence:** Real-time PDF and file summarization, Q&A, and MCQs.

---
> [!TIP]
> Paste your standard Google Gemini API Key (`AIzaSy...`) in **SETTINGS** for unrestricted live generative AI!
"""
        }

    # Gwalior Fort & History
    if "gwalior" in clean or "gwlior" in clean or "fort" in clean:
        return {
            "spoken_summary": "Gwalior Fort was built in the 8th century by Raja Suraj Sen and later expanded by Raja Man Singh Tomar.",
            "detailed_markdown": """### 🏰 Gwalior Fort — The Pearl of Indian Fortresses

**Location:** Gwalior, Madhya Pradesh, India | **Founded:** ~8th Century CE

---

#### 👑 Builders & Historical Origin:
* **Original Founder (8th Century):** Built by the local Rajput ruler **Raja Suraj Sen**, named in honor of the hermit sage **Gwalipa** who cured him of leprosy.
* **Man Mandir Palace (15th Century):** Extensively expanded with stunning blue and yellow glazed tiles by **Raja Man Singh Tomar**.
* **Mughal Recognition:** Emperor Babur famously praised it as *"the pearl among fortresses of Hind"*.

---

#### 🏛️ Key Monuments Inside:
1. **Man Mandir Palace:** Masterpiece of medieval Rajput palace architecture.
2. **Teli Ka Mandir (8th–9th Century):** The oldest surviving temple inside the fort, blending North and South Indian architectural styles.
3. **Saas-Bahu Temples (Sahastrabahu):** Dedicated to Lord Vishnu with intricate stone carvings.
4. **Rock-Cut Jain Monuments:** Gigantic Tirthankara colossi carved into the cliff faces.
"""
        }

    # Python vs C++
    if ("python" in clean and ("c++" in clean or "cpp" in clean)) or ("compare" in clean and "python" in clean and "c" in clean):
        return {
            "spoken_summary": "Python is dynamically typed and optimized for AI and rapid development, while C++ compiles directly to machine code for maximum execution speed.",
            "detailed_markdown": """### ⚡ Comparison: Python vs C++

| Feature | 🐍 Python | ⚙️ C++ |
| :--- | :--- | :--- |
| **Language Paradigm** | Interpreted, Multi-paradigm, Dynamic | Compiled, Multi-paradigm, Static |
| **Execution Speed** | Moderate | Extreme (Native Machine Code) |
| **Memory Management** | Automatic Reference Counting & GC | Manual (`new`/`delete`, Pointers, RAII) |
| **Primary Domains** | AI/ML, Data Science, Web, Automation | Game Engines, OS, High-Freq Trading |
"""
        }

    # Python vs Java
    if "python" in clean and "java" in clean:
        return {
            "spoken_summary": "Python uses dynamic typing and minimal syntax for rapid AI development, whereas Java is statically typed, class-based, and runs on the JVM for enterprise scalability.",
            "detailed_markdown": """### ☕ Comparison: Python vs Java

| Feature | 🐍 Python | ☕ Java |
| :--- | :--- | :--- |
| **Typing System** | Dynamically Typed | Statically Typed |
| **Runtime** | Python Virtual Machine (PVM) | Java Virtual Machine (JVM) |
| **Speed** | Interpreted (moderate) | JIT-compiled (fast) |
| **Use Cases** | AI/ML, Data Science, Scripting | Enterprise Backend, Android |
"""
        }

    # Python general overview
    if "python" in clean:
        return {
            "spoken_summary": "Python is a high-level, interpreted programming language created by Guido van Rossum, renowned for its clean syntax, rapid development, and dominance in Artificial Intelligence.",
            "detailed_markdown": """### 🐍 Python Programming Language

**Creator:** Guido van Rossum (1991) | **Paradigm:** Multi-paradigm (OOP, Functional, Imperative)

---

#### 📌 Key Characteristics:
* **Dynamic Typing & Memory Management:** Automatic garbage collection and intuitive syntax that emphasizes readability.
* **Ecosystem Dominance:** The #1 language for **Artificial Intelligence & Machine Learning** (`TensorFlow`, `PyTorch`, `Scikit-Learn`), Data Science (`Pandas`, `NumPy`), and Web Development (`FastAPI`, `Django`).
* **Cross-Platform:** Runs on Windows, Linux, macOS, and embedded microcontrollers.
"""
        }

    # Deep Learning general overview
    if "deep learning" in clean or "deeplearning" in clean or "neural network" in clean:
        return {
            "spoken_summary": "Deep learning is a subset of machine learning based on artificial neural networks with multiple layers, designed to learn complex representations from large volumes of data.",
            "detailed_markdown": """### 🧠 Deep Learning & Artificial Neural Networks

**Discipline:** Artificial Intelligence & Machine Learning

---

#### 📌 Core Concept:
Deep Learning employs multi-layered neural networks (hence 'deep') to model non-linear relationships and automatically extract high-level features directly from raw data:

* **Key Architectures:** 
  - **CNNs (Convolutional Neural Networks):** Computer vision, image classification, object detection.
  - **RNNs / Transformers:** Natural language processing, LLMs (Gemini, GPT), time-series forecasting.
  - **GANs & Diffusion Models:** Generative modeling and image/audio synthesis.
* **Key Learning Mechanism:** Backpropagation with Gradient Descent ($w \leftarrow w - \eta \frac{\partial L}{\partial w}$).
"""
        }

    # Fallback to general encyclopedic response
    entity_name = query.replace("what is", "").replace("explain", "").replace("who is", "").strip(' ?.')
    return {
        "spoken_summary": f"Here is the overview for {entity_name.title()}, sir.",
        "detailed_markdown": f"""### 🌐 Knowledge Overview: `{entity_name.title()}`

**Topic:** `{query}`

---

Information for this subject has been indexed. For comprehensive live generative reasoning across all concepts, ensure your standard Google Gemini API key (`AIzaSy...`) is configured in **SETTINGS**.
"""
    }

# =========================================================================
# 6. UNIVERSAL MASTER QUERY ROUTER
# =========================================================================
def process_universal_query(
    prompt: str, 
    file_data: Optional[Dict[str, Any]] = None,
    conversation_history: Optional[List[Dict[str, str]]] = None
) -> Dict[str, Any]:
    """
    Universal Entrypoint for ALL voice & text queries.
    1. Classifies intent using Gemini Classifier (COMMAND, CHAT, WEB_SEARCH, FILE_ANALYSIS).
    2. Routes to appropriate handler.
    3. Maintains bounded in-memory conversation history.
    4. Returns strictly normalized response.
    """
    raw = (prompt or "").strip()
    if not raw and file_data:
        raw = "Analyze the attached document and provide an executive summary."
    
    if not raw:
        return {
            "success": False,
            "intent": "CHAT",
            "answer": "No query detected. Please speak or type your request.",
            "spoken_summary": "I didn't catch that, sir. Could you please repeat?",
            "detailed_markdown": "No query detected. Please speak or type your request.",
            "sources": [],
            "action": None,
            "metadata": {}
        }

    # Update in-memory history if history passed from client
    history = conversation_history if conversation_history is not None else global_memory.get_history()

    has_file = bool(file_data and file_data.get("content"))
    filename = file_data.get("filename", "") if file_data else ""

    # Step 1: Classify intent using Gemini
    classification = classify_intent_with_gemini(raw, has_file=has_file, filename=filename)
    intent = classification.get("intent", "CHAT")
    action_name = classification.get("action", "")
    target = classification.get("target", "")

    print(f"[UNIVERSAL ROUTER] Query: '{raw}' -> Intent: {intent} (Action: '{action_name}', Target: '{target}')")

    # Step 2: Route to dedicated pipeline
    if intent == "COMMAND":
        from .intent_router import execute_allowlisted_action
        action_result = execute_allowlisted_action(action_name=action_name, target=target, raw_query=raw)
        
        global_memory.add_message("user", raw)
        global_memory.add_message("assistant", action_result.get("spoken_summary", "Command executed."))
        
        # Ensure answer field
        if "answer" not in action_result:
            action_result["answer"] = action_result.get("detailed_markdown", "")
        if "sources" not in action_result:
            action_result["sources"] = []
            
        return action_result

    elif intent == "FILE_ANALYSIS" and has_file:
        res = handle_file_analysis_pipeline(raw, file_data=file_data, history=history)
        global_memory.add_message("user", raw)
        global_memory.add_message("assistant", res.get("detailed_markdown", ""))
        return res

    elif intent == "WEB_SEARCH":
        res = web_rag_pipeline.execute_web_rag(
            query=raw,
            history=history,
            llm_caller=call_gemini_api,
            system_prompt=JARVIS_SYSTEM_PROMPT
        )
        global_memory.add_message("user", raw)
        global_memory.add_message("assistant", res.get("detailed_markdown", ""))
        return res

    else: # Default to CHAT
        res = handle_chat_pipeline(raw, history=history)
        global_memory.add_message("user", raw)
        global_memory.add_message("assistant", res.get("detailed_markdown", ""))
        return res

# Backward-compatible wrapper
def query_gemini_llm(prompt: str, file_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    return process_universal_query(prompt, file_data=file_data)
