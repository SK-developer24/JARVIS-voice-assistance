import React, { useState, useEffect } from 'react';
import { MapPin, Cloud, Navigation, Settings, Check, RefreshCw } from 'lucide-react';

export function LocationCard({ telemetry }) {
  // Load saved real location or fallback to Gwalior, MP
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem('jarvis_real_location');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return {
      city: "Gwalior",
      region: "Madhya Pradesh",
      country: "India",
      coordinates: "LAT 26.2183° N  LONG 78.1828° E",
      source: "GPS Preset"
    };
  });

  const [isDetecting, setIsDetecting] = useState(false);
  const [gpsError, setGpsError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [manualCity, setManualCity] = useState(location.city);

  // Function to get real GPS Location via browser API (triangulation & GPS)
  const detectRealGpsLocation = () => {
    if (!('geolocation' in navigator)) {
      setGpsError(true);
      return;
    }

    setIsDetecting(true);
    setGpsError(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const latDir = latitude >= 0 ? "N" : "S";
        const lonDir = longitude >= 0 ? "E" : "W";
        const coordsStr = `LAT ${Math.abs(latitude).toFixed(4)}° ${latDir}  LONG ${Math.abs(longitude).toFixed(4)}° ${lonDir}`;

        try {
          // Reverse geocode with OpenStreetMap Nominatim
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, {
            headers: { 'Accept-Language': 'en' }
          });
          const data = await res.json();
          const address = data.address || {};
          
          const detectedCity = address.city || address.town || address.village || address.state_district || "Gwalior";
          const detectedRegion = address.state || "Madhya Pradesh";
          const detectedCountry = address.country || "India";

          const newLoc = {
            city: detectedCity,
            region: detectedRegion,
            country: detectedCountry,
            coordinates: coordsStr,
            source: "Real GPS Location"
          };

          setLocation(newLoc);
          setManualCity(detectedCity);
          localStorage.setItem('jarvis_real_location', JSON.stringify(newLoc));
          setIsDetecting(false);
        } catch (e) {
          // Fallback to coordinates
          const newLoc = {
            city: "Gwalior",
            region: "Madhya Pradesh",
            country: "India",
            coordinates: coordsStr,
            source: "GPS Coordinates"
          };
          setLocation(newLoc);
          localStorage.setItem('jarvis_real_location', JSON.stringify(newLoc));
          setIsDetecting(false);
        }
      },
      (error) => {
        setIsDetecting(false);
        setGpsError(true);
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
    );
  };

  // Attempt auto-detection once on mount if not yet saved
  useEffect(() => {
    if (!localStorage.getItem('jarvis_real_location')) {
      detectRealGpsLocation();
    }
  }, []);

  const handleManualSave = (e) => {
    e.preventDefault();
    if (!manualCity.trim()) return;
    const newLoc = {
      city: manualCity.trim(),
      region: "Madhya Pradesh",
      country: "India",
      coordinates: "LAT 26.2183° N  LONG 78.1828° E",
      source: "Manual Location"
    };
    setLocation(newLoc);
    localStorage.setItem('jarvis_real_location', JSON.stringify(newLoc));
    setIsEditing(false);
  };

  const openWindowsLocationSettings = () => {
    window.location.href = "ms-settings:privacy-location";
  };

  return (
    <div className="glass-panel rounded-xl p-3.5 relative overflow-hidden group font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between text-cyber-muted text-[11px] font-rajdhani font-bold tracking-widest uppercase mb-1">
        <span className="flex items-center gap-1.5">
          <span>LIVE LOCATION</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse"></span>
        </span>
        <button
          onClick={detectRealGpsLocation}
          title="Detect Real GPS Location"
          className="p-1 rounded hover:bg-white/5 text-cyber-muted hover:text-cyber-glow transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin text-cyber-glow' : ''}`} />
        </button>
      </div>

      {/* Location Details */}
      {isEditing ? (
        <form onSubmit={handleManualSave} className="flex items-center gap-1.5 my-1">
          <input
            type="text"
            value={manualCity}
            onChange={(e) => setManualCity(e.target.value)}
            placeholder="Enter City Name (e.g. Gwalior)"
            className="flex-1 bg-[#040d20] border border-cyber-border/60 rounded px-2 py-1 text-xs text-cyber-text focus:outline-none focus:border-cyber-glow"
          />
          <button
            type="submit"
            className="p-1 bg-cyber-glow text-[#030712] rounded hover:bg-white font-bold cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        </form>
      ) : (
        <div className="flex items-start justify-between mt-1">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-cyber-glow shrink-0 mt-0.5 animate-bounce" />
            <div>
              <div className="text-sm font-semibold text-cyber-text tracking-wide flex items-center gap-1.5">
                <span>{location.city}, {location.country}</span>
              </div>
              <div className="text-[11px] text-cyber-muted font-medium">
                {location.region} &bull; <span className="text-cyber-green text-[10px] font-mono">{location.source}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            title="Edit City Manually"
            className="text-[10px] text-cyber-muted hover:text-cyber-glow transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-white/5"
          >
            Edit
          </button>
        </div>
      )}

      {/* GPS Warning / Enable Location Banner */}
      {gpsError && (
        <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span>📍 Please enable Windows Location for exact GPS</span>
            <button
              onClick={openWindowsLocationSettings}
              className="underline font-bold hover:text-white cursor-pointer"
            >
              Open Settings
            </button>
          </div>
        </div>
      )}

      {/* Futuristic Skyline Graphic & Live GPS */}
      <div className="mt-2 pt-2 border-t border-cyber-border/20 flex items-center justify-between">
        <div className="text-[9px] font-mono text-cyber-glow/80 tracking-tight">
          {location.coordinates}
        </div>
        <div className="flex items-end gap-0.5 h-5 opacity-60">
          <div className="w-1 h-3 bg-cyber-glow/60"></div>
          <div className="w-1.5 h-5 bg-cyber-blue/80"></div>
          <div className="w-1 h-4 bg-cyber-glow/70"></div>
          <div className="w-2 h-2 bg-cyber-blue/50"></div>
          <div className="w-1 h-4.5 bg-cyber-glow"></div>
        </div>
      </div>
    </div>
  );
}
