import { useState, useEffect, useRef, useCallback } from 'react';

export function useWebSocket({ onCommandResult, onActionResult } = {}, url = 'ws://127.0.0.1:8000/ws') {
  const [isConnected, setIsConnected] = useState(false);
  const [telemetry, setTelemetry] = useState({
    cpu_usage: 42,
    cpu_cores: 8,
    ram_usage: 58,
    ram_used_gb: 9.2,
    ram_total_gb: 16.0,
    battery_percent: 86,
    is_charging: true,
    network_status: "Connected",
    uptime: "12h 45m",
    time: "16:16:24",
    date: "Sunday, Feb 6, 2024",
    weather: {
      temp: "30°C",
      condition: "Clear Sky",
      location: "Bengaluru, India"
    },
    system_health: "All systems are functioning normally.",
    status: "ONLINE"
  });
  const [activities, setActivities] = useState([
    { id: 1, time: "16:10:24", text: "Opened YouTube", type: "app" },
    { id: 2, time: "16:09:15", text: "Searched Python tutorials", type: "web" },
    { id: 3, time: "16:08:02", text: "Opened VS Code", type: "app" },
    { id: 4, time: "16:07:10", text: "Played Music", type: "media" },
    { id: 5, time: "16:06:45", text: "System Scan Completed", type: "system" },
  ]);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'TELEMETRY_UPDATE') {
            if (payload.data) setTelemetry(payload.data);
            if (payload.activities) setActivities(payload.activities);
          } else if (payload.type === 'ACTIVITY_UPDATE') {
            if (payload.activities) setActivities(payload.activities);
          } else if (payload.type === 'COMMAND_RESULT' || payload.type === 'AI_CHAT_RESULT') {
            if (payload.activities) setActivities(payload.activities);
            if (onCommandResult) onCommandResult(payload);
          } else if (payload.type === 'ACTION_RESULT') {
            if (payload.activities) setActivities(payload.activities);
            if (onActionResult) onActionResult(payload);
          }
        } catch (e) {
          console.error("Error parsing WS message", e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (e) {
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    }
  }, [url, onCommandResult, onActionResult]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connect]);

  const sendAction = useCallback((action, target = '') => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'TRIGGER_ACTION',
        action,
        target
      }));
    } else {
      fetch('http://127.0.0.1:8000/api/actions/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, target })
      }).catch(() => {});
    }
  }, []);

  const sendVoiceCommand = useCallback((transcript, fileData = null, conversationHistory = null) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'PROCESS_VOICE_COMMAND',
        transcript,
        file_data: fileData,
        conversation_history: conversationHistory
      }));
    } else {
      fetch('http://127.0.0.1:8000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: transcript, 
          file_data: fileData,
          conversation_history: conversationHistory 
        })
      }).then(res => res.json()).then(data => {
        if (onCommandResult) onCommandResult({ result: data, transcript, prompt: transcript });
      }).catch(() => {});
    }
  }, [onCommandResult]);

  return {
    isConnected,
    telemetry,
    activities,
    sendAction,
    sendVoiceCommand
  };
}
