import { useState, useCallback, useEffect } from 'react';

const SAVED_VOICE_KEY = 'jarvis_selected_voice_id';
const SAVED_RATE_KEY = 'jarvis_speech_rate';
const SAVED_PITCH_KEY = 'jarvis_speech_pitch';

export function useVoiceSpeaker() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState(() => {
    return localStorage.getItem(SAVED_VOICE_KEY) || 'default_male';
  });
  const [speechRate, setSpeechRate] = useState(() => {
    return parseFloat(localStorage.getItem(SAVED_RATE_KEY) || '1.05');
  });
  const [speechPitch, setSpeechPitch] = useState(() => {
    return parseFloat(localStorage.getItem(SAVED_PITCH_KEY) || '0.95');
  });

  // Load and categorize voices from browser
  useEffect(() => {
    const loadVoices = () => {
      if (!('speechSynthesis' in window)) return;
      const allVoices = window.speechSynthesis.getVoices();
      if (allVoices.length > 0) {
        // Filter English and primary languages
        const enVoices = allVoices.filter(v => v.lang.startsWith('en') || v.lang.startsWith('hi'));
        setAvailableVoices(enVoices.length > 0 ? enVoices : allVoices);
      }
    };

    loadVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Save preferences
  const updateSelectedVoice = useCallback((voiceId) => {
    setSelectedVoiceId(voiceId);
    localStorage.setItem(SAVED_VOICE_KEY, voiceId);
  }, []);

  const updateSpeechRate = useCallback((rate) => {
    const r = parseFloat(rate);
    setSpeechRate(r);
    localStorage.setItem(SAVED_RATE_KEY, r.toString());
  }, []);

  const updateSpeechPitch = useCallback((pitch) => {
    const p = parseFloat(pitch);
    setSpeechPitch(p);
    localStorage.setItem(SAVED_PITCH_KEY, p.toString());
  }, []);

  // Find the matching speech synthesis voice
  const getActiveVoice = useCallback(() => {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // 1. If user selected a specific voice name/URI
    if (selectedVoiceId && selectedVoiceId !== 'default_male' && selectedVoiceId !== 'default_female') {
      const match = voices.find(v => v.name === selectedVoiceId || v.voiceURI === selectedVoiceId);
      if (match) return match;
    }

    // 2. Persona: Default Male (JARVIS style: Deep English/US Male)
    if (selectedVoiceId === 'default_male' || !selectedVoiceId) {
      const maleVoice = voices.find(v => 
        (v.name.includes('David') || v.name.includes('Mark') || v.name.includes('George') || v.name.includes('Google UK English Male') || v.name.includes('Male')) && v.lang.startsWith('en')
      );
      if (maleVoice) return maleVoice;
    }

    // 3. Persona: Default Female (Sleek AI Female: Zira / Heera / Samantha)
    if (selectedVoiceId === 'default_female') {
      const femaleVoice = voices.find(v => 
        (v.name.includes('Zira') || v.name.includes('Heera') || v.name.includes('Samantha') || v.name.includes('Google UK English Female') || v.name.includes('Female')) && v.lang.startsWith('en')
      );
      if (femaleVoice) return femaleVoice;
    }

    // Fallback to any English voice
    return voices.find(v => v.lang.startsWith('en')) || voices[0];
  }, [selectedVoiceId]);

  const speak = useCallback((text, onEndCallback) => {
    if (!text || !('speechSynthesis' in window)) {
      if (onEndCallback) onEndCallback();
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text of markdown asterisks and code formatting for speech
    const cleanSpeech = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/```[\s\S]*?```/g, 'Code block output.')
      .replace(/`/g, '')
      .replace(/#{1,6}\s?/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = speechRate || 1.05;
    utterance.pitch = speechPitch || 0.95;

    const voice = getActiveVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
  }, [speechRate, speechPitch, getActiveVoice]);

  const testVoice = useCallback((customVoiceId = null, sampleText = null) => {
    const text = sampleText || "All systems online. J.A.R.V.I.S. voice synthesis module is fully calibrated and operational, sir.";
    speak(text);
  }, [speak]);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    isSpeaking,
    availableVoices,
    selectedVoiceId,
    setSelectedVoiceId: updateSelectedVoice,
    speechRate,
    setSpeechRate: updateSpeechRate,
    speechPitch,
    setSpeechPitch: updateSpeechPitch,
    speak,
    testVoice,
    stop
  };
}
