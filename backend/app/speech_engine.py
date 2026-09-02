"""
JARVIS Speech Engine - Python TTS & STT services
"""
import threading
import queue

class SpeechEngine:
    def __init__(self):
        self._tts_queue = queue.Queue()
        self._is_speaking = False
        self._init_tts_thread()

    def _init_tts_thread(self):
        """Initializes TTS in a background thread to prevent blocking async loops."""
        def tts_worker():
            try:
                import pyttsx3
                engine = pyttsx3.init()
                # Configure speech rate and volume
                engine.setProperty('rate', 175)
                engine.setProperty('volume', 1.0)
                
                # Select a clean natural voice if available
                voices = engine.getProperty('voices')
                for voice in voices:
                    if "zira" in voice.name.lower() or "david" in voice.name.lower():
                        engine.setProperty('voice', voice.id)
                        break

                while True:
                    text = self._tts_queue.get()
                    if text is None:
                        break
                    try:
                        self._is_speaking = True
                        engine.say(text)
                        engine.runAndWait()
                    except Exception as e:
                        print(f"TTS Error: {e}")
                    finally:
                        self._is_speaking = False
                        self._tts_queue.task_done()
            except Exception as e:
                print(f"Pyttsx3 initialization note: {e}")

        self._thread = threading.Thread(target=tts_worker, daemon=True)
        self._thread.start()

    def speak(self, text: str):
        """Queue text to be spoken by JARVIS."""
        if text:
            self._tts_queue.put(text)

    @property
    def is_speaking(self) -> bool:
        return self._is_speaking

speech_engine = SpeechEngine()
