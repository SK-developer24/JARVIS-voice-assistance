import React, { useState, useRef, useEffect } from 'react';
import { X, GraduationCap, User, Award, Smartphone, Github, Linkedin, Mail, Camera, Edit2, Check, ExternalLink, Globe } from 'lucide-react';

export function AboutModal({ onClose }) {
  const fileInputRef = useRef(null);

  // Profile details stored in localStorage
  const [avatar, setAvatar] = useState(() => {
    return localStorage.getItem('jarvis_profile_avatar') || null;
  });
  const [name, setName] = useState(() => {
    return localStorage.getItem('jarvis_profile_name') || 'Sourabh Sahu';
  });
  const [department, setDepartment] = useState(() => {
    return localStorage.getItem('jarvis_profile_dept') || 'Artificial Intelligence & Machine Learning';
  });
  const [role, setRole] = useState(() => {
    return localStorage.getItem('jarvis_profile_role') || 'Full Stack AI Developer';
  });
  const [github, setGithub] = useState(() => {
    return localStorage.getItem('jarvis_profile_github') || 'sourabhsahu';
  });
  const [linkedin, setLinkedin] = useState(() => {
    return localStorage.getItem('jarvis_profile_linkedin') || 'sourabhsahu';
  });
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('jarvis_profile_email') || 'sourabh@aiml.edu';
  });

  const [isEditing, setIsEditing] = useState(false);

  // Handle Photo Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (base64) {
        setAvatar(base64);
        localStorage.setItem('jarvis_profile_avatar', base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    localStorage.setItem('jarvis_profile_name', name);
    localStorage.setItem('jarvis_profile_dept', department);
    localStorage.setItem('jarvis_profile_role', role);
    localStorage.setItem('jarvis_profile_github', github);
    localStorage.setItem('jarvis_profile_linkedin', linkedin);
    localStorage.setItem('jarvis_profile_email', email);
    setIsEditing(false);
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <div className="glass-panel rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-cyber-glow/50 shadow-neon-blue overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-cyber-border/40 bg-[#061536]/90">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyber-blue/30 border border-cyber-glow flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-cyber-glow" />
            </div>
            <div>
              <h3 className="text-base font-orbitron font-bold tracking-wider text-cyber-glow">
                PROJECT CREDENTIALS & DEVELOPER PROFILE
              </h3>
              <p className="text-[10px] font-rajdhani font-semibold text-cyber-muted tracking-wider">
                AIML MAJOR ENGINEERING PROJECT
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (isEditing) handleSaveProfile();
                else setIsEditing(true);
              }}
              className="px-3 py-1 rounded-lg bg-cyber-blue/20 hover:bg-cyber-blue/50 border border-cyber-glow/40 text-xs font-rajdhani font-bold text-cyber-glow flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
              <span>{isEditing ? "SAVE PROFILE" : "EDIT PROFILE"}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-cyber-muted hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          
          {/* ========================================================================= */}
          {/* DEVELOPER PROFILE BANNER (MATCHING REFERENCE MOCKUP)                      */}
          {/* ========================================================================= */}
          <div className="relative rounded-2xl p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 shadow-neon-blue border border-white/20 overflow-hidden flex flex-col md:flex-row items-center gap-5">
            {/* Background Glow Effect */}
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* Circular Profile Avatar with Photo Upload */}
            <div className="relative group shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white/90 shadow-2xl overflow-hidden bg-[#0a1636] flex items-center justify-center cursor-pointer group-hover:border-cyber-glow transition-all relative"
                title="Click to Upload Profile Photo"
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Developer Avatar"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-2 text-white/80">
                    <User className="w-10 h-10 text-white/90 mb-1" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Upload Photo</span>
                  </div>
                )}

                {/* Hover Camera Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                  <Camera className="w-6 h-6 text-cyber-glow" />
                  <span className="text-[9px] font-bold mt-0.5">Change Photo</span>
                </div>
              </div>
            </div>

            {/* Profile Info Details */}
            <div className="flex-1 text-center md:text-left text-white space-y-1">
              
              {/* Name */}
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-black/30 border border-white/40 rounded-lg px-2 py-1 text-lg font-bold text-white w-full max-w-sm"
                  placeholder="Your Full Name"
                />
              ) : (
                <h4 className="text-2xl md:text-3xl font-extrabold tracking-wide text-white drop-shadow-md">
                  {name}
                </h4>
              )}

              {/* Department / Branch */}
              {isEditing ? (
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="bg-black/30 border border-white/40 rounded-lg px-2 py-0.5 text-xs text-white/90 w-full max-w-sm mt-1"
                  placeholder="Your Department / Branch"
                />
              ) : (
                <p className="text-sm md:text-base font-semibold text-white/95">
                  {department}
                </p>
              )}

              {/* Sub-role */}
              {isEditing ? (
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-black/30 border border-white/40 rounded-lg px-2 py-0.5 text-xs text-white/80 w-full max-w-sm mt-1"
                  placeholder="Your Role / Specialization"
                />
              ) : (
                <p className="text-xs text-white/80 font-medium">
                  {role}
                </p>
              )}

              {/* Social Pill Badges (GitHub, LinkedIn, Email) */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                
                {/* GitHub Pill */}
                <a
                  href={`https://github.com/${github.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-xs text-white flex items-center gap-1.5 backdrop-blur-sm transition-all shadow-md cursor-pointer"
                >
                  <Github className="w-3.5 h-3.5 text-white shrink-0" />
                  <span className="font-medium text-[11px]">{github}</span>
                </a>

                {/* LinkedIn Pill */}
                <a
                  href={`https://linkedin.com/in/${linkedin.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-xs text-white flex items-center gap-1.5 backdrop-blur-sm transition-all shadow-md cursor-pointer"
                >
                  <Linkedin className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                  <span className="font-medium text-[11px]">{linkedin}</span>
                </a>

                {/* Email Pill */}
                <a
                  href={`mailto:${email}`}
                  className="px-3 py-1 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-xs text-white flex items-center gap-1.5 backdrop-blur-sm transition-all shadow-md cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span className="font-medium text-[11px]">{email}</span>
                </a>

              </div>
            </div>
          </div>

          {/* Academic Mentor & Hardware Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* Mentor Card */}
            <div className="p-3.5 rounded-xl bg-[#061430]/70 border border-cyber-border/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/40 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-[9px] font-rajdhani font-bold tracking-wider text-cyber-muted uppercase">
                  PROJECT MENTOR
                </div>
                <div className="text-sm font-bold text-cyber-text">
                  Dr. Neelam Arya
                </div>
                <div className="text-[10.5px] font-semibold text-amber-400/90">
                  Professor & Faculty Advisor
                </div>
              </div>
            </div>

            {/* Connected Phone Card */}
            <div className="p-3.5 rounded-xl bg-[#061430]/70 border border-cyber-border/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyber-green/10 border border-cyber-green/40 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-cyber-green animate-pulse" />
                </div>
                <div>
                  <div className="text-[9px] font-rajdhani font-bold tracking-wider text-cyber-muted uppercase">
                    MOBILE BRIDGE
                  </div>
                  <div className="text-xs font-bold text-cyber-glow">
                    POCO M3 PRO 5G
                  </div>
                  <div className="text-[10px] font-mono text-cyber-green">
                    Auto-Discovered
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Architecture Pipeline Summary */}
          <div>
            <div className="text-[11px] font-rajdhani font-bold tracking-widest text-cyber-muted uppercase mb-2">
              SYSTEM ARCHITECTURE PIPELINE
            </div>
            <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
              <div className="p-2 rounded-lg bg-[#07173b] border border-cyber-border/20">
                <div className="text-cyber-glow font-bold mb-0.5">1. Voice</div>
                <div className="text-cyber-muted">Web Speech STT</div>
              </div>
              <div className="p-2 rounded-lg bg-[#07173b] border border-cyber-border/20">
                <div className="text-cyber-glow font-bold mb-0.5">2. Brain</div>
                <div className="text-cyber-muted">Intent Router</div>
              </div>
              <div className="p-2 rounded-lg bg-[#07173b] border border-cyber-border/20">
                <div className="text-cyber-glow font-bold mb-0.5">3. LLM</div>
                <div className="text-cyber-muted">Gemini Engine</div>
              </div>
              <div className="p-2 rounded-lg bg-[#07173b] border border-cyber-border/20">
                <div className="text-cyber-glow font-bold mb-0.5">4. Execute</div>
                <div className="text-cyber-muted">PC & POCO ADB</div>
              </div>
              <div className="p-2 rounded-lg bg-[#07173b] border border-cyber-border/20">
                <div className="text-cyber-glow font-bold mb-0.5">5. Speak</div>
                <div className="text-cyber-muted">Audio Synthesis</div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-cyber-border/30 bg-[#051026] flex items-center justify-between">
          <span className="text-[10px] font-mono text-cyber-muted">
            JARVIS v1.0.0 — AIML Major Project
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyber-blue/30 hover:bg-cyber-blue/60 border border-cyber-glow/50 text-xs font-rajdhani font-bold text-cyber-glow hover:text-white transition-all cursor-pointer"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
}
