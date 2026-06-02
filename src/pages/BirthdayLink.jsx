import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// ══════════════════════════════════════════════════════════════
//  CONFIG
// ══════════════════════════════════════════════════════════════
const JSONBIN_KEY    = import.meta.env.VITE_JSONBIN_KEY    || "";
const JSONBIN_BIN_ID = import.meta.env.VITE_JSONBIN_BIN_ID || "";
const JSONBIN_BASE   = "https://api.jsonbin.io/v3/b";

// FIX 1 — URL dynamique, fonctionne peu importe le domaine Vercel
const BASE_URL = window.location.origin;
const buildShareLink = (id) => `${BASE_URL}/?id=${id}`;

// ══════════════════════════════════════════════════════════════
//  STORAGE LAYER
// ══════════════════════════════════════════════════════════════

   const Storage = {
  _ready() { return !!(JSONBIN_KEY && JSONBIN_BIN_ID); },

  async _getIndex() {
    const r = await fetch(`${JSONBIN_BASE}/${JSONBIN_BIN_ID}/latest`, {
      headers: { "X-Master-Key": JSONBIN_KEY, "X-Bin-Meta": "false" },
    });
    if (!r.ok) throw new Error("Index read failed");
    return await r.json();
  },

  async _setIndex(index) {
    const r = await fetch(`${JSONBIN_BASE}/${JSONBIN_BIN_ID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Master-Key": JSONBIN_KEY },
      body: JSON.stringify(index),
    });
    if (!r.ok) throw new Error("Index write failed");
  },

  async save(code, data) {
    if (this._ready()) {
      // Crée un bin dédié pour cette entrée (photo incluse)
      const r = await fetch(`${JSONBIN_BASE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": JSONBIN_KEY,
          "X-Bin-Name": code,
          "X-Bin-Private": "false",
        },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error("Sauvegarde échouée (bin création)");
      const result = await r.json();
      const binId = result.metadata.id;

      // Met à jour l'index maître avec juste le binId (léger)
      const index = await this._getIndex();
      index[code] = binId;
      await this._setIndex(index);
      return;
    }
    // Fallback localStorage
    const db = JSON.parse(localStorage.getItem("bdl_db") || "{}");
    db[code] = data;
    localStorage.setItem("bdl_db", JSON.stringify(db));
  },

  async load(code) {
    if (this._ready()) {
      const index = await this._getIndex();
      const binId = index[code];
      if (!binId) return null;
      const r = await fetch(`${JSONBIN_BASE}/${binId}/latest`, {
        headers: { "X-Master-Key": JSONBIN_KEY, "X-Bin-Meta": "false" },
      });
      if (!r.ok) return null;
      return await r.json();
    }
    const db = JSON.parse(localStorage.getItem("bdl_db") || "{}");
    return db[code] || null;
  },
};

// ══════════════════════════════════════════════════════════════
//  UTILS
// ══════════════════════════════════════════════════════════════
function generateId(prefix) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = prefix + "-";
  for (let i = 0; i < 5; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

// FIX 2 — Compression équilibrée : bonne qualité + taille acceptable pour JSONbin
async function resizeImage(dataUrl, maxDim = 500) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.5));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// ══════════════════════════════════════════════════════════════
//  MUSIC ENGINE — FIX 3 : BPM augmentés + scheduler 25ms
// ══════════════════════════════════════════════════════════════
const NOTE_FREQ = {
  B3:246.94, C4:261.63, D4:293.66, E4:329.63, F4:349.23,
  G4:392.0,  A4:440.0,  B4:493.88, C5:523.25, D5:587.33,
  E5:659.25, F5:698.46, G5:783.99, A5:880.0,  B5:987.77, REST:0,
};

const MOODS = {
  "🎉 Festif": {
    bpm: 245,
    seq: [
      ["G4",0.75],["G4",0.25],["A4",1],["G4",1],["C5",1],["B4",2],["REST",0.5],
      ["G4",0.75],["G4",0.25],["A4",1],["G4",1],["D5",1],["C5",2],["REST",0.5],
      ["G4",0.75],["G4",0.25],["G5",1],["E5",1],["C5",1],["B4",1],["A4",2],["REST",0.5],
      ["F5",0.75],["F5",0.25],["E5",1],["C5",1],["D5",1],["C5",2],["REST",1],
    ],
  },
  "💃 Dansant": {
    bpm: 255,
    seq: [
      ["C5",0.5],["E5",0.5],["G5",0.5],["E5",0.5],["C5",0.5],["G5",0.5],["E5",1],
      ["D5",0.5],["F5",0.5],["A5",0.5],["F5",0.5],["D5",0.5],["A5",0.5],["F5",1],
      ["E5",0.5],["G5",0.5],["C5",0.5],["G5",0.5],["E5",0.5],["C5",0.5],["G4",1],
      ["C5",0.5],["D5",0.5],["E5",0.5],["G5",0.5],["A5",1],["G5",0.5],["C5",0.5],
    ],
  },
  "🎵 Romantique": {
    bpm: 82,
    seq: [
      ["E5",2],["D5",1],["C5",1],["D5",2],["E5",2],
      ["G5",2],["E5",2],["D5",3],["REST",1],
      ["E5",1.5],["F5",0.5],["G5",2],["A5",1.5],["G5",0.5],["F5",2],
      ["E5",1.5],["D5",0.5],["C5",2],["D5",3],["REST",1],
    ],
  },
  "🎸 Dynamique": {
    bpm: 295,
    seq: [
      ["C5",0.5],["E5",0.5],["G5",0.5],["A5",0.5],["G5",0.5],["E5",0.5],["C5",1],
      ["D5",0.5],["F5",0.5],["A5",0.5],["B5",0.5],["A5",0.5],["F5",0.5],["D5",1],
      ["E5",0.5],["G5",0.5],["B5",0.5],["G5",0.5],["E5",0.5],["C5",0.5],["E5",1],
      ["G5",0.5],["A5",0.5],["B5",0.5],["A5",0.5],["G5",0.5],["E5",0.5],["C5",1],
    ],
  },
};

function useMusicPlayer(mood) {
  const [playing, setPlaying] = useState(false);
  const s = useRef({ on:false, ctx:null, gain:null, timer:null, next:0, idx:0 });

  const stop = useCallback(() => {
    s.current.on = false;
    clearTimeout(s.current.timer);
    try { if (s.current.gain && s.current.ctx) s.current.gain.gain.setTargetAtTime(0, s.current.ctx.currentTime, 0.12); } catch {}
    setPlaying(false);
  }, []);

  const play = useCallback(() => {
    const mel = MOODS[mood] || MOODS["🎉 Festif"];
    const beatDur = 60 / mel.bpm;
    try {
      if (s.current.ctx) { try { s.current.ctx.close(); } catch {} }
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.connect(ctx.destination);
      s.current = { on:true, ctx, gain, timer:null, next:ctx.currentTime + 0.08, idx:0 };
      setPlaying(true);
      const tick = () => {
        if (!s.current.on) return;
        while (s.current.next < ctx.currentTime + 0.2) {
          const [note, beats] = mel.seq[s.current.idx % mel.seq.length];
          const freq = NOTE_FREQ[note] || 0;
          if (freq) {
            const osc = ctx.createOscillator();
            const env = ctx.createGain();
            osc.connect(env); env.connect(gain);
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, s.current.next);
            const dur = beats * beatDur * 0.86;
            env.gain.setValueAtTime(0, s.current.next);
            env.gain.linearRampToValueAtTime(0.55, s.current.next + 0.015);
            env.gain.exponentialRampToValueAtTime(0.001, s.current.next + dur);
            osc.start(s.current.next);
            osc.stop(s.current.next + dur + 0.05);
          }
          s.current.next += beats * beatDur;
          s.current.idx++;
        }
        s.current.timer = setTimeout(tick, 25); // FIX scheduler rapide
      };
      tick();
    } catch (e) { console.error("Audio:", e); }
  }, [mood]);

  const toggle = useCallback(() => { if (s.current.on) stop(); else play(); }, [play, stop]);
  useEffect(() => () => { s.current.on = false; clearTimeout(s.current.timer); }, []);
  return { playing, toggle };
}

// ══════════════════════════════════════════════════════════════
//  CONFETTI
// ══════════════════════════════════════════════════════════════
const CC = ["#FF6B6B","#FFE66D","#4ECDC4","#C77DFF","#FF9F1C","#6BCB77","#FF8B94","#A8E6CF","#FF6FCF"];

function Confetti({ active }) {
  const ref = useRef(null);
  const pts = useRef([]);
  const raf = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    const resize = () => { cv.width = window.innerWidth; cv.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    if (active) {
      pts.current = Array.from({ length: 130 }, () => ({
        x:Math.random()*window.innerWidth, y:-20-Math.random()*80,
        w:Math.random()*11+4, h:Math.random()*5+3,
        color:CC[Math.floor(Math.random()*CC.length)],
        speed:Math.random()*3+1.5, angle:Math.random()*360,
        rot:Math.random()*4-2, sf:Math.random()*0.04+0.01,
        sa:Math.random()*1.8, tick:Math.random()*100,
        circle:Math.random()>0.4,
      }));
      const draw = () => {
        ctx.clearRect(0,0,cv.width,cv.height);
        pts.current.forEach(p => {
          p.y+=p.speed; p.tick+=p.sf;
          p.x+=Math.sin(p.tick)*p.sa; p.angle+=p.rot;
          if (p.y>cv.height+20) { p.y=-20; p.x=Math.random()*cv.width; }
          ctx.save();
          ctx.translate(p.x+p.w/2, p.y+p.h/2);
          ctx.rotate((p.angle*Math.PI)/180);
          ctx.fillStyle=p.color;
          if (p.circle) { ctx.beginPath(); ctx.arc(0,0,p.w/2,0,Math.PI*2); ctx.fill(); }
          else ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
          ctx.restore();
        });
        raf.current = requestAnimationFrame(draw);
      };
      draw();
    } else { ctx.clearRect(0,0,cv.width,cv.height); cancelAnimationFrame(raf.current); }
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize",resize); };
  }, [active]);
  return <canvas ref={ref} style={{ position:"fixed",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:9999 }} />;
}

// ══════════════════════════════════════════════════════════════
//  BALLOON
// ══════════════════════════════════════════════════════════════
function Balloon({ color, x, delay, duration }) {
  return (
    <div style={{ position:"fixed",bottom:"-10px",left:`${x}%`,animation:`riseUp ${duration}s ease-in-out ${delay}s infinite alternate`,pointerEvents:"none",zIndex:0 }}>
      <svg viewBox="0 0 50 80" width="38" height="60">
        <ellipse cx="25" cy="30" rx="18" ry="22" fill={color} opacity="0.85" />
        <ellipse cx="19" cy="22" rx="6" ry="8" fill="white" opacity="0.22" />
        <path d="M25 52 Q23 60 25 70" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
        <circle cx="25" cy="72" r="2" fill={color} opacity="0.5" />
      </svg>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MUSIC BUTTON
// ══════════════════════════════════════════════════════════════
function MusicBtn({ mood, accent="#FF6B6B" }) {
  const { playing, toggle } = useMusicPlayer(mood);
  return (
    <button onClick={toggle} aria-label={playing?"Couper la musique":"Jouer la musique"} style={{
      position:"fixed", bottom:"env(safe-area-inset-bottom, 24px)", right:"16px",
      width:"56px", height:"56px", borderRadius:"50%",
      background: playing ? `linear-gradient(135deg,${accent},#FF8E53)` : "rgba(255,255,255,0.95)",
      border:"none", cursor:"pointer", fontSize:"24px",
      boxShadow: playing ? `0 0 24px ${accent}66, 0 4px 20px rgba(0,0,0,0.2)` : "0 4px 20px rgba(0,0,0,0.15)",
      zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center",
      animation: playing ? "pulse 1.6s infinite" : "none",
      transition:"all 0.3s ease",
      WebkitTapHighlightColor:"transparent", touchAction:"manipulation", marginBottom:"8px",
    }}>
      {playing ? "🎵" : "🔇"}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════
//  GLOBAL CSS
// ══════════════════════════════════════════════════════════════
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  html { -webkit-text-size-adjust: 100%; }
  body { margin: 0; overscroll-behavior: none; }
  textarea { resize: vertical; }
  input, textarea, select { font-size: 16px !important; }
  @keyframes riseUp { from{transform:translateY(0) rotate(-5deg);} to{transform:translateY(-35px) rotate(5deg);} }
  @keyframes pop { 0%{transform:scale(0.4);opacity:0;} 80%{transform:scale(1.04);} 100%{transform:scale(1);opacity:1;} }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.85;transform:scale(1.07);} }
  @keyframes fadeUp { from{transform:translateY(16px);opacity:0;} to{transform:translateY(0);opacity:1;} }
  ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.15);border-radius:4px;}
  @keyframes starFall { 0%{transform:translateY(-20px) rotate(0deg);opacity:1;} 100%{transform:translateY(100vh) rotate(360deg);opacity:0;} }
  @keyframes envelopeOpen { 0%{transform:scale(0.6) translateY(40px) rotate(-4deg);opacity:0;} 60%{transform:scale(1.04) translateY(-6px) rotate(1deg);opacity:1;} 100%{transform:scale(1) translateY(0) rotate(0deg);opacity:1;} }
  @keyframes reveal0 { from{opacity:0;transform:translateY(30px) scale(0.94);} to{opacity:1;transform:translateY(0) scale(1);} }
  @keyframes reveal1 { from{opacity:0;transform:translateY(24px);} to{opacity:1;transform:translateY(0);} }
  @keyframes reveal2 { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
  @keyframes shimmer { 0%{background-position:-400px 0;} 100%{background-position:400px 0;} }
  @keyframes glowPulse { 0%,100%{box-shadow:0 0 20px rgba(255,107,107,0.4),0 8px 32px rgba(0,0,0,0.18);} 50%{box-shadow:0 0 40px rgba(255,107,107,0.7),0 8px 32px rgba(0,0,0,0.18);} }
  @keyframes cardFloat { 0%,100%{transform:translateY(0px);} 50%{transform:translateY(-6px);} }
  @keyframes sparkle { 0%,100%{transform:scale(0) rotate(0deg);opacity:0;} 50%{transform:scale(1) rotate(180deg);opacity:1;} }
  @keyframes ribbonSlide { from{transform:scaleX(0);opacity:0;} to{transform:scaleX(1);opacity:1;} }
  @keyframes bounce { 0%,100%{transform:translateY(0);} 40%{transform:translateY(-12px);} 60%{transform:translateY(-6px);} }
`;

// ══════════════════════════════════════════════════════════════
//  STYLE HELPERS
// ══════════════════════════════════════════════════════════════
const S = {
  page: (bg="linear-gradient(160deg,#FF6B6B 0%,#FF8E53 30%,#C77DFF 70%,#4ECDC4 100%)") => ({
    minHeight:"100dvh", background:bg,
    display:"flex", flexDirection:"column", alignItems:"center",
    padding:"16px 12px calc(env(safe-area-inset-bottom, 0px) + 80px)",
    fontFamily:"'Nunito', sans-serif", position:"relative", overflowX:"hidden",
  }),
  card: (extra={}) => ({
    background:"rgba(255,255,255,0.97)", borderRadius:"24px", padding:"24px 20px",
    maxWidth:"480px", width:"100%", boxShadow:"0 20px 60px rgba(0,0,0,0.18)",
    position:"relative", zIndex:2, marginTop:"8px",
    animation:"pop 0.45s cubic-bezier(0.175,0.885,0.32,1.275)", ...extra,
  }),
  inp: (accent="#FF6B6B") => ({
    width:"100%", padding:"14px 16px", borderRadius:"14px",
    border:`2.5px solid ${accent}33`, fontSize:"16px", outline:"none",
    marginTop:"8px", fontFamily:"inherit", background:`${accent}08`,
    WebkitAppearance:"none", appearance:"none",
  }),
  lbl: (color="#FF6B6B") => ({
    fontSize:"11px", fontWeight:"900", color, marginTop:"18px",
    display:"block", textTransform:"uppercase", letterSpacing:"1.2px",
  }),
  btn: (bg="linear-gradient(135deg,#FF6B6B,#FF8E53)", extra={}) => ({
    background:bg, color:"white", border:"none", borderRadius:"50px",
    padding:"0 24px", height:"52px", minHeight:"52px",
    fontSize:"15px", fontWeight:"800", cursor:"pointer",
    width:"100%", marginTop:"12px", fontFamily:"inherit",
    boxShadow:"0 6px 22px rgba(0,0,0,0.14)", letterSpacing:"0.3px",
    display:"flex", alignItems:"center", justifyContent:"center", gap:"6px",
    WebkitTapHighlightColor:"transparent", touchAction:"manipulation", ...extra,
  }),
  back: (color="#FF6B6B") => ({
    background:"none", border:"none", cursor:"pointer", color,
    fontWeight:"800", fontSize:"15px", padding:"8px 0", marginBottom:"14px",
    fontFamily:"inherit", display:"flex", alignItems:"center", gap:"4px",
    WebkitTapHighlightColor:"transparent", minHeight:"44px",
  }),
  err: (color="#E53E3E", bg="#FFF0F0", border="#FFCCCC") => ({
    background:bg, border:`1px solid ${border}`, borderRadius:"12px",
    padding:"12px 16px", color, fontSize:"14px", marginBottom:"14px",
    fontWeight:"700", animation:"fadeUp 0.3s ease",
  }),
  codeBox: (bg="linear-gradient(135deg,#FF6B6B,#C77DFF)") => ({
    background:bg, borderRadius:"20px", padding:"24px 16px",
    boxShadow:"0 12px 36px rgba(0,0,0,0.18)", marginBottom:"4px",
    textAlign:"center", overflowX:"hidden",
  }),
  info: (bg="#FFF9F0", color="#888") => ({
    marginTop:"18px", padding:"16px", background:bg, borderRadius:"14px",
    fontSize:"13px", color, textAlign:"left", lineHeight:"1.85",
    animation:"fadeUp 0.4s ease 0.2s both",
  }),
  moodBtn: (selected) => ({
    padding:"10px 14px", borderRadius:"20px", border:"2.5px solid",
    borderColor: selected?"#FF6B6B":"#FFE0E6",
    background: selected?"#FF6B6B":"white",
    color: selected?"white":"#FF6B6B",
    cursor:"pointer", fontSize:"14px", fontWeight:"800",
    fontFamily:"inherit", transition:"all 0.2s",
    WebkitTapHighlightColor:"transparent", minHeight:"44px", touchAction:"manipulation",
  }),
};

const BALLOONS_A = [
  {color:"#FF6B6B",x:3,delay:0,duration:4},{color:"#FFE66D",x:13,delay:0.5,duration:5},
  {color:"#4ECDC4",x:26,delay:1,duration:3.5},{color:"#C77DFF",x:40,delay:0.3,duration:4.5},
  {color:"#FF9F1C",x:55,delay:0.8,duration:4},{color:"#6BCB77",x:68,delay:1.2,duration:5},
  {color:"#FF8B94",x:82,delay:0.2,duration:3.8},{color:"#A8E6CF",x:93,delay:0.6,duration:4.2},
];

// ══════════════════════════════════════════════════════════════
//  SHOOTING STARS
// ══════════════════════════════════════════════════════════════
function ShootingStars() {
  const stars = useMemo(() => Array.from({ length:18 }, (_,i) => ({
    id:i, left:`${Math.random()*100}%`, top:`${Math.random()*40}%`,
    size:Math.random()*10+6, delay:`${Math.random()*6}s`,
    duration:`${Math.random()*4+4}s`,
    emoji:["⭐","✨","🌟","💫","⚡"][Math.floor(Math.random()*5)],
  })), []);
  return (
    <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:1,overflow:"hidden" }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position:"absolute", left:s.left, top:s.top, fontSize:`${s.size}px`,
          animation:`starFall ${s.duration} linear ${s.delay} infinite`, opacity:0,
        }}>{s.emoji}</div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  SPARKLE RING
// ══════════════════════════════════════════════════════════════
function SparkleRing() {
  const sparks = ["✨","⭐","💫","🌟","✨","💫","⭐","🌟"];
  return (
    <div style={{ position:"relative", display:"inline-block", marginBottom:"4px" }}>
      <div style={{ fontSize:"clamp(58px,16vw,76px)", animation:"bounce 2s ease-in-out infinite", display:"block" }}>🎂</div>
      {sparks.map((s,i) => {
        const angle = (i/sparks.length)*360;
        const r = 52;
        const x = Math.cos((angle-90)*Math.PI/180)*r;
        const y = Math.sin((angle-90)*Math.PI/180)*r;
        return (
          <div key={i} style={{
            position:"absolute", left:`calc(50% + ${x}px)`, top:`calc(50% + ${y}px)`,
            transform:"translate(-50%,-50%)", fontSize:"clamp(11px,3vw,14px)",
            animation:`sparkle 2.4s ease-in-out ${i*0.3}s infinite`, pointerEvents:"none",
          }}>{s}</div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  VIEW: ANNONCE — FIX 4 : titre "X fête son anniversaire !"
// ══════════════════════════════════════════════════════════════
function ViewAnnounce({ data, confetti, go, setCForm }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => { const t = setTimeout(() => setPhase(1), 600); return () => clearTimeout(t); }, []);

  const dateStr = data?.date
    ? new Date(data.date+"T12:00:00").toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})
    : null;

  return (
    <div style={{
      minHeight:"100dvh",
      background:"linear-gradient(145deg,#1a0533 0%,#3d0b6e 30%,#7b1fa2 60%,#e91e8c 100%)",
      display:"flex", flexDirection:"column", alignItems:"center",
      padding:"16px 12px calc(env(safe-area-inset-bottom,0px) + 80px)",
      fontFamily:"'Nunito', sans-serif", position:"relative", overflowX:"hidden",
    }}>
      <style>{G}</style>
      <Confetti active={confetti} />
      <ShootingStars />
      {BALLOONS_A.map((b,i) => <Balloon key={i} {...b} />)}
      <MusicBtn mood={data?.mood||"🎉 Festif"} accent="#FF6B6B" />

      {/* Bannière */}
      <div style={{
        zIndex:3, position:"relative", textAlign:"center",
        marginTop:"18px", marginBottom:"10px",
        animation: phase>=1?"reveal0 0.7s ease both":"none", opacity:phase>=1?1:0,
      }}>
        <div style={{
          background:"rgba(255,255,255,0.12)", backdropFilter:"blur(12px)",
          WebkitBackdropFilter:"blur(12px)", borderRadius:"50px",
          padding:"6px 22px", border:"1px solid rgba(255,255,255,0.25)", display:"inline-block",
        }}>
          <span style={{ color:"rgba(255,255,255,0.9)",fontSize:"12px",fontWeight:"900",letterSpacing:"2.5px",textTransform:"uppercase" }}>
            🎊 Annonce spéciale 🎊
          </span>
        </div>
      </div>

      {/* Carte principale */}
      <div style={{
        background:"rgba(255,255,255,0.97)", borderRadius:"28px", padding:"28px 22px",
        maxWidth:"480px", width:"100%",
        boxShadow:"0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)",
        position:"relative", zIndex:3,
        animation: phase===0?"envelopeOpen 0.6s cubic-bezier(0.34,1.56,0.64,1) both":"cardFloat 4s ease-in-out 1s infinite",
        textAlign:"center", overflow:"hidden",
      }}>
        {/* Ruban */}
        <div style={{
          position:"absolute",top:0,left:0,right:0,height:"5px",
          background:"linear-gradient(90deg,#FF6B6B,#FFE66D,#4ECDC4,#C77DFF,#FF6B6B)",
          backgroundSize:"300% 100%", animation:"shimmer 3s linear infinite",
        }} />

        {/* Gâteau */}
        <div style={{ paddingTop:"12px", animation:phase>=1?"reveal0 0.6s ease 0.1s both":"none", opacity:phase>=1?1:0 }}>
          <SparkleRing />
        </div>

        {/* FIX 4 — Titre annonce : pas de "Joyeux Anniversaire", c'est une annonce */}
        <div style={{ animation:phase>=1?"reveal0 0.7s ease 0.25s both":"none", opacity:phase>=1?1:0 }}>
          <h1 style={{
            fontFamily:"'Fredoka One', cursive",
            fontSize:"clamp(26px,7.5vw,40px)",
            background:"linear-gradient(135deg,#FF4757,#C77DFF)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            backgroundClip:"text", margin:"6px 0 10px", lineHeight:1.15,
          }}>
            🎉 {data?.name}<br />fête son anniversaire !
          </h1>
          <div style={{ fontSize:"clamp(22px,6vw,28px)", letterSpacing:"4px", marginBottom:"14px" }}>
            🎉🎈🎊🎁🎂
          </div>
        </div>

        {/* Date */}
        {dateStr && (
          <div style={{ animation:phase>=1?"reveal1 0.6s ease 0.4s both":"none", opacity:phase>=1?1:0 }}>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:"6px",
              background:"linear-gradient(135deg,#FF6B6B22,#C77DFF22)",
              border:"2px solid #C77DFF44", borderRadius:"50px", padding:"10px 20px",
              fontSize:"clamp(12px,3.5vw,14px)", color:"#8B5CF6", fontWeight:"900",
              marginBottom:"16px", boxShadow:"0 4px 16px rgba(199,125,255,0.2)",
            }}>
              📅 {dateStr}
            </div>
          </div>
        )}

        {/* Ambiance */}
        {data?.mood && (
          <div style={{ animation:phase>=1?"reveal1 0.6s ease 0.5s both":"none", opacity:phase>=1?1:0 }}>
            <p style={{ color:"#ccc",fontSize:"12px",fontWeight:"800",margin:"0 0 14px" }}>
              {data.mood} · Appuie 🔇 en bas à droite pour la musique
            </p>
          </div>
        )}

        {/* Photo */}
        {data?.photo && (
          <div style={{ animation:phase>=1?"reveal1 0.7s ease 0.55s both":"none", opacity:phase>=1?1:0 }}>
            <img src={data.photo} alt="" style={{
              width:"100%", borderRadius:"20px", margin:"4px 0 18px",
              maxHeight:"260px", objectFit:"cover", display:"block",
              boxShadow:"0 12px 36px rgba(0,0,0,0.2)",
              border:"3px solid rgba(199,125,255,0.3)",
            }} />
          </div>
        )}

        {/* Message */}
        <div style={{ animation:phase>=1?"reveal1 0.7s ease 0.65s both":"none", opacity:phase>=1?1:0 }}>
          <div style={{
            background:"linear-gradient(145deg,#FFF0F8,#F8F0FF)", borderRadius:"18px",
            padding:"22px 20px", textAlign:"left",
            position:"relative", marginBottom:"20px",
            boxShadow:"0 6px 24px rgba(199,125,255,0.12)",
          }}>
            <span style={{ position:"absolute",top:"-2px",left:"14px",fontSize:"40px",color:"#FF6B6B",lineHeight:1,fontFamily:"Georgia, serif",opacity:0.35 }}>"</span>
            <p style={{ color:"#444",fontSize:"clamp(14px,4vw,16px)",lineHeight:"1.8",margin:"8px 0 0",fontStyle:"italic",fontWeight:"600",paddingLeft:"10px" }}>
              {data?.message}
            </p>
            <span style={{ position:"absolute",bottom:"-8px",right:"14px",fontSize:"40px",color:"#C77DFF",lineHeight:1,fontFamily:"Georgia, serif",opacity:0.35 }}>"</span>
          </div>
        </div>

        {/* CTA */}
        <div style={{
          animation:phase>=1?"reveal2 0.6s ease 0.8s both":"none", opacity:phase>=1?1:0,
          borderTop:"2px dashed rgba(255,107,107,0.2)", paddingTop:"20px",
        }}>
          <p style={{ color:"#bbb",fontSize:"13px",fontWeight:"800",margin:"0 0 10px" }}>
            💝 Envoie ta carte à {data?.name}
          </p>
          <button
            style={S.btn("linear-gradient(135deg,#FF6B6B,#C77DFF)",{ animation:"glowPulse 2.5s ease-in-out infinite" })}
            onClick={() => { setCForm({ fromName:"", message:"", photo:null }); go("create-card"); }}>
            💝 Créer ma carte de vœux
          </button>
          <button style={S.btn("linear-gradient(135deg,rgba(0,0,0,0.06),rgba(0,0,0,0.04))",{ color:"#bbb",boxShadow:"none" })} onClick={() => go("home")}>
            🏠 Accueil
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  VIEW: CARTE
// ══════════════════════════════════════════════════════════════
function ViewCard({ data, confetti, go }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => { const t = setTimeout(() => setPhase(1), 500); return () => clearTimeout(t); }, []);

  const balloons = [
    {color:"#A18CD1",x:5,delay:0,duration:4},{color:"#FBC2EB",x:18,delay:0.6,duration:5},
    {color:"#FF8B94",x:35,delay:1,duration:3.5},{color:"#C77DFF",x:52,delay:0.3,duration:4.5},
    {color:"#FFE66D",x:67,delay:0.8,duration:4},{color:"#4ECDC4",x:82,delay:1.2,duration:5},
  ];

  return (
    <div style={{
      minHeight:"100dvh",
      background:"linear-gradient(145deg,#0f0524 0%,#2d1457 35%,#6b2fa0 65%,#c2185b 100%)",
      display:"flex", flexDirection:"column", alignItems:"center",
      padding:"16px 12px calc(env(safe-area-inset-bottom,0px) + 80px)",
      fontFamily:"'Nunito', sans-serif", position:"relative", overflowX:"hidden",
    }}>
      <style>{G}</style>
      <Confetti active={confetti} />
      <ShootingStars />
      {balloons.map((b,i) => <Balloon key={i} {...b} />)}
      <MusicBtn mood="🎵 Romantique" accent="#E91E8C" />

      <div style={{
        zIndex:3, position:"relative", textAlign:"center",
        marginTop:"18px", marginBottom:"10px",
        animation:phase>=1?"reveal0 0.7s ease both":"none", opacity:phase>=1?1:0,
      }}>
        <div style={{
          background:"rgba(255,255,255,0.12)", backdropFilter:"blur(12px)",
          WebkitBackdropFilter:"blur(12px)", borderRadius:"50px",
          padding:"6px 22px", border:"1px solid rgba(255,255,255,0.25)", display:"inline-block",
        }}>
          <span style={{ color:"rgba(255,255,255,0.9)",fontSize:"12px",fontWeight:"900",letterSpacing:"2.5px",textTransform:"uppercase" }}>
            💌 Carte personnelle 💌
          </span>
        </div>
      </div>

      <div style={{
        background:"rgba(255,255,255,0.97)", borderRadius:"28px", padding:"28px 22px",
        maxWidth:"480px", width:"100%",
        boxShadow:"0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08)",
        position:"relative", zIndex:3,
        animation:phase===0?"envelopeOpen 0.65s cubic-bezier(0.34,1.56,0.64,1) both":"cardFloat 4s ease-in-out 1s infinite",
        textAlign:"center", overflow:"hidden",
      }}>
        <div style={{
          position:"absolute",top:0,left:0,right:0,height:"5px",
          background:"linear-gradient(90deg,#E91E8C,#C77DFF,#FBC2EB,#A18CD1,#E91E8C)",
          backgroundSize:"300% 100%", animation:"shimmer 3s linear infinite",
        }} />

        <div style={{ paddingTop:"12px", animation:phase>=1?"reveal0 0.6s ease 0.1s both":"none", opacity:phase>=1?1:0 }}>
          <div style={{ fontSize:"clamp(52px,14vw,70px)",animation:"bounce 2.4s ease-in-out infinite",lineHeight:1.1 }}>💝</div>
          <div style={{ fontSize:"clamp(18px,5vw,24px)",letterSpacing:"6px",marginTop:"4px",animation:"pulse 2s infinite" }}>✨ 🎀 ✨</div>
        </div>

        <div style={{ animation:phase>=1?"reveal0 0.7s ease 0.25s both":"none", opacity:phase>=1?1:0 }}>
          <h2 style={{
            fontFamily:"'Fredoka One', cursive", fontSize:"clamp(22px,7vw,34px)",
            background:"linear-gradient(135deg,#E91E8C,#8B5CF6)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            backgroundClip:"text", margin:"12px 0 4px", lineHeight:1.2,
          }}>
            Un message de {data?.fromName} 🥰
          </h2>
          {data?.forName && (
            <div style={{
              display:"inline-block",
              background:"linear-gradient(135deg,#FFE0F8,#F0E0FF)",
              border:"2px solid #E8D0FF", borderRadius:"50px",
              padding:"8px 20px", marginBottom:"16px",
              fontSize:"clamp(13px,3.5vw,15px)", color:"#8B5CF6", fontWeight:"900",
              boxShadow:"0 4px 16px rgba(139,92,246,0.15)",
            }}>
              🎂 Spécialement pour toi, {data.forName}
            </div>
          )}
        </div>

        {data?.photo && (
          <div style={{ animation:phase>=1?"reveal1 0.7s ease 0.45s both":"none", opacity:phase>=1?1:0 }}>
            <img src={data.photo} alt="" style={{
              width:"100%", borderRadius:"20px", margin:"4px 0 18px",
              maxHeight:"260px", objectFit:"cover", display:"block",
              boxShadow:"0 12px 36px rgba(0,0,0,0.2)",
              border:"3px solid rgba(233,30,140,0.2)",
            }} />
          </div>
        )}

        <div style={{ animation:phase>=1?"reveal1 0.7s ease 0.55s both":"none", opacity:phase>=1?1:0 }}>
          <div style={{
            background:"linear-gradient(145deg,#FFF0F8,#F8F0FF)", borderRadius:"18px",
            padding:"24px 20px", textAlign:"left", border:"2px solid #F0D8FF",
            position:"relative", marginBottom:"18px",
            boxShadow:"0 6px 24px rgba(233,30,140,0.1)",
          }}>
            <span style={{ position:"absolute",top:"-2px",left:"14px",fontSize:"40px",color:"#E91E8C",lineHeight:1,fontFamily:"Georgia, serif",opacity:0.3 }}>"</span>
            <p style={{ color:"#444",fontSize:"clamp(14px,4vw,16px)",lineHeight:"1.85",margin:"8px 0 0",fontStyle:"italic",fontWeight:"600",paddingLeft:"10px" }}>
              {data?.message}
            </p>
            <span style={{ position:"absolute",bottom:"-8px",right:"14px",fontSize:"40px",color:"#8B5CF6",lineHeight:1,fontFamily:"Georgia, serif",opacity:0.3 }}>"</span>
          </div>
        </div>

        <div style={{ animation:phase>=1?"reveal2 0.6s ease 0.7s both":"none", opacity:phase>=1?1:0 }}>
          <div style={{ fontSize:"clamp(28px,8vw,38px)",margin:"6px 0 14px",letterSpacing:"5px" }}>🎊🎉🎁🎈💕</div>
          <p style={{ color:"#ddd",fontSize:"12px",fontWeight:"800",margin:"0 0 14px" }}>
            Appuie 🔇 en bas à droite pour la musique 🎵
          </p>
        </div>

        <div style={{ animation:phase>=1?"reveal2 0.6s ease 0.85s both":"none", opacity:phase>=1?1:0 }}>
          <button style={S.btn("linear-gradient(135deg,rgba(0,0,0,0.06),rgba(0,0,0,0.04))",{ color:"#bbb",boxShadow:"none" })} onClick={() => go("home")}>
            🏠 Accueil
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════════════════
export default function BirthdayApp() {
  const navToHub = useNavigate();
  const [view, setView]           = useState("home");
  const [confetti, setConfetti]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [copied, setCopied]       = useState(false);
  const [code, setCode]           = useState("");
  const [inputCode, setInputCode] = useState("");
  const [announcement, setAnnouncement] = useState(null);
  const [card, setCard]           = useState(null);
  const [aForm, setAForm]         = useState({ name:"", date:"", message:"", photo:null, mood:"🎉 Festif" });
  const [cForm, setCForm]         = useState({ fromName:"", message:"", photo:null });

  const balloons = useMemo(() => [
    {color:"#FF6B6B",x:3,delay:0,duration:4},{color:"#FFE66D",x:13,delay:0.5,duration:5},
    {color:"#4ECDC4",x:26,delay:1,duration:3.5},{color:"#C77DFF",x:40,delay:0.3,duration:4.5},
    {color:"#FF9F1C",x:55,delay:0.8,duration:4},{color:"#6BCB77",x:68,delay:1.2,duration:5},
    {color:"#FF8B94",x:82,delay:0.2,duration:3.8},{color:"#A8E6CF",x:93,delay:0.6,duration:4.2},
  ], []);

  const bang = useCallback((ms=5500) => { setConfetti(true); setTimeout(() => setConfetti(false), ms); }, []);

  const readFile = (file, setter) => {
    const r = new FileReader();
    r.onload = async (ev) => { const v = await resizeImage(ev.target.result); setter(v); };
    r.readAsDataURL(file);
  };

  const go = (v) => { setView(v); setError(""); setInputCode(""); };

  // FIX 5 — Auto-load depuis ?id= dans l'URL
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) return;
    const upper = id.trim().toUpperCase();
    setLoading(true);
    Storage.load(upper).then(data => {
      if (!data) { setError("Lien invalide ou expiré 😕"); setLoading(false); return; }
      if (data.type === "announcement") { setAnnouncement(data); bang(7000); setView("view-announce"); }
      else if (data.type === "card")    { setCard(data);         bang(7000); setView("view-card"); }
      setLoading(false);
    }).catch(() => { setError("Erreur de connexion."); setLoading(false); });
  }, []); // eslint-disable-line

  // FIX 6 — copyLink utilise navigator.share sur mobile
  const copyLink = (id) => {
    const link = buildShareLink(id);
    if (navigator.share) { navigator.share({ title:"BirthdayLink 🎂", url:link }); return; }
    navigator.clipboard.writeText(link).catch(() => {
      const el = document.createElement("textarea");
      el.value = link; document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
    });
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };

  // ── HANDLERS ─────────────────────────────────────────────────

  const handleCreateAnnouncement = async () => {
    if (!aForm.name.trim() || !aForm.message.trim()) { setError("Remplis au moins ton prénom et ton message 💕"); return; }
    // FIX 7 — Limite photo annonce
    if (aForm.photo && aForm.photo.length > 200000) {
      setError("📸 Photo trop lourde. Choisis une image plus petite."); return;
    }
    setLoading(true); setError("");
    try {
      const id = generateId("A");
      await Storage.save(id, { ...aForm, type:"announcement", id, ts:Date.now() });
      setCode(id); bang(); go("announce-done");
    } catch (e) { setError(`Erreur de sauvegarde : ${e.message || "vérifie ta connexion"}`); }
    setLoading(false);
  };

  const handleViewAnnouncement = async () => {
    const c = inputCode.trim().toUpperCase();
    if (!c) return;
    setLoading(true); setError("");
    try {
      const data = await Storage.load(c);
      if (!data || data.type !== "announcement") { setError("Code introuvable ! Vérifie bien ce qu'on t'a envoyé."); setLoading(false); return; }
      setAnnouncement(data); bang(7000); setView("view-announce");
    } catch { setError("Erreur de connexion. Réessaie dans quelques secondes."); }
    setLoading(false);
  };

  const handleCreateCard = async () => {
    if (!cForm.fromName.trim() || !cForm.message.trim()) { setError("Remplis ton prénom et ton message 💕"); return; }
    // FIX 8 — Bonne variable : cForm (pas aForm !)
    if (cForm.photo && cForm.photo.length > 200000) {
      setError("📸 Photo trop lourde. Choisis une image plus petite."); return;
    }
    setLoading(true); setError("");
    try {
      const id = generateId("C");
      await Storage.save(id, { ...cForm, type:"card", id, forId:announcement?.id, forName:announcement?.name, ts:Date.now() });
      setCode(id); bang(); go("card-done");
    } catch (e) { setError(`Erreur de sauvegarde : ${e.message || "vérifie ta connexion"}`); }
    setLoading(false);
  };

  const handleViewCard = async () => {
    const c = inputCode.trim().toUpperCase();
    if (!c) return;
    // FIX 9 — handleViewCard charge juste, ne vérifie pas de photo
    setLoading(true); setError("");
    try {
      const data = await Storage.load(c);
      if (!data || data.type !== "card") { setError("Code introuvable !"); setLoading(false); return; }
      setCard(data); bang(7000); setView("view-card");
    } catch { setError("Erreur. Réessaie."); }
    setLoading(false);
  };

  // ── ROUTING ──────────────────────────────────────────────────
  if (view === "view-announce") return <ViewAnnounce data={announcement} confetti={confetti} go={go} setCForm={setCForm} />;
  if (view === "view-card")     return <ViewCard data={card} confetti={confetti} go={go} />;

  // ── LOADING SCREEN (auto-load en cours) ──────────────────────
  if (loading && view === "home") return (
    <div style={{ ...S.page(), alignItems:"center", justifyContent:"center" }}>
      <style>{G}</style>
      <div style={{ textAlign:"center", color:"white" }}>
        <div style={{ fontSize:"60px", animation:"bounce 1s infinite" }}>🎂</div>
        <p style={{ fontWeight:"800", fontSize:"18px", marginTop:"16px" }}>Chargement...</p>
      </div>
    </div>
  );

  // ── HOME — FIX 10 : simplifié, liens manuels en fallback discret ─
  if (view === "home") return (
    <div style={S.page()}>
      <style>{G}</style>
      <button
  onClick={() => navToHub("/")}
  style={{ position:"fixed",top:"16px",left:"16px",zIndex:100,background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"20px",padding:"8px 14px",color:"white",fontWeight:"800",fontSize:"13px",cursor:"pointer" }}>
  ← Accueil
</button>
      <Confetti active={confetti} />
      {balloons.map((b,i) => <Balloon key={i} {...b} />)}

      <div style={{ zIndex:2,position:"relative",textAlign:"center",marginBottom:"4px",marginTop:"20px" }}>
        <div style={{ fontSize:"clamp(60px,18vw,82px)",animation:"pulse 2.5s infinite" }}>🎂</div>
        <h1 style={{ fontFamily:"'Fredoka One', cursive",fontSize:"clamp(34px,10vw,50px)",color:"white",margin:"4px 0 6px",textShadow:"0 4px 14px rgba(0,0,0,0.2)" }}>
          BirthdayLink
        </h1>
        <p style={{ color:"rgba(255,255,255,0.92)",fontSize:"clamp(13px,3.5vw,16px)",margin:0,fontWeight:"700" }}>
          Annonces & cartes d'anniversaire magiques ✨
        </p>
      </div>

      {error && <div style={{ ...S.err(), maxWidth:"480px",width:"100%",zIndex:2,position:"relative",marginTop:"12px" }}>{error}</div>}

      <div style={S.card()}>
        <p style={{ textAlign:"center",color:"#bbb",fontSize:"13px",fontWeight:"700",margin:"0 0 8px" }}>
          Que veux-tu faire ?
        </p>
        {/* Bouton principal */}
        <button style={S.btn()} onClick={() => go("create-announce")}>
          🎂 Je fête mon anniversaire
        </button>

        {/* Séparateur */}
        <div style={{ margin:"18px 0 6px",textAlign:"center",fontSize:"11px",color:"#ddd",fontWeight:"700",letterSpacing:"1px" }}>
          — Tu as reçu un lien ? Clique dessus directement 🔗 —
        </div>

        {/* Fallback codes manuels discrets */}
        <div style={{ display:"flex",gap:"10px",marginTop:"6px" }}>
          <button
            style={{ ...S.btn("linear-gradient(135deg,#A18CD1,#FBC2EB)",{ flex:1,fontSize:"13px",height:"44px",minHeight:"44px",marginTop:0 }) }}
            onClick={() => go("enter-announce-code")}>
            💌 Code annonce
          </button>
          <button
            style={{ ...S.btn("linear-gradient(135deg,#4ECDC4,#44A08D)",{ flex:1,fontSize:"13px",height:"44px",minHeight:"44px",marginTop:0 }) }}
            onClick={() => go("enter-card-code")}>
            🎁 Code carte
          </button>
        </div>
      </div>
    </div>
  );

  // ── CREATE ANNONCE ───────────────────────────────────────────
  if (view === "create-announce") return (
    <div style={S.page()}>
      <style>{G}</style>
      <div style={S.card()}>
        <button style={S.back()} onClick={() => go("home")}>← Retour</button>
        <h2 style={{ fontFamily:"'Fredoka One', cursive",fontSize:"clamp(22px,6vw,28px)",color:"#FF4757",margin:"0 0 4px" }}>
          🎂 Crée ton annonce
        </h2>
        {/* FIX 11 — texte mis à jour */}
        <p style={{ color:"#bbb",fontSize:"13px",margin:"0 0 20px",fontWeight:"700" }}>
          Personnalise-la et partage le lien avec tes proches
        </p>

        {error && <div style={S.err()}>{error}</div>}

        <label style={S.lbl()}>Ton prénom *</label>
        <input style={S.inp()} placeholder="Ex : Awa, Sophia, Koffi..."
          value={aForm.name} onChange={e => setAForm(f => ({ ...f,name:e.target.value }))} />

        <label style={S.lbl()}>Date d'anniversaire</label>
        <input style={S.inp()} type="date" value={aForm.date}
          onChange={e => setAForm(f => ({ ...f,date:e.target.value }))} />

        <label style={S.lbl()}>Ton message *</label>
        <textarea style={{ ...S.inp(),minHeight:"100px" }}
          placeholder="Ex : Coucou tout le monde ! Je fête mes 25 ans bientôt..."
          value={aForm.message} onChange={e => setAForm(f => ({ ...f,message:e.target.value }))} />

        <label style={S.lbl()}>Ta photo (optionnel)</label>
        {/* FIX 12 — capture supprimé → galerie disponible */}
        <input type="file" accept="image/*"
          style={{ marginTop:"10px",fontSize:"15px",width:"100%" }}
          onChange={e => e.target.files[0] && readFile(e.target.files[0], v => setAForm(f => ({ ...f,photo:v })))} />
        {aForm.photo && (
          <div style={{ position:"relative",marginTop:"10px" }}>
            <img src={aForm.photo} alt="preview" style={{ width:"100%",borderRadius:"14px",maxHeight:"200px",objectFit:"cover",display:"block" }} />
            <button onClick={() => setAForm(f => ({ ...f,photo:null }))}
              style={{ position:"absolute",top:"8px",right:"8px",background:"rgba(0,0,0,0.5)",color:"white",border:"none",borderRadius:"50%",width:"30px",height:"30px",cursor:"pointer",fontSize:"16px" }}>
              ✕
            </button>
          </div>
        )}

        <label style={S.lbl()}>🎵 Ambiance musicale</label>
        <p style={{ fontSize:"12px",color:"#ccc",margin:"4px 0 10px",fontWeight:"700" }}>
          Tes visiteurs pourront activer cette musique
        </p>
        <div style={{ display:"flex",flexWrap:"wrap",gap:"8px" }}>
          {Object.keys(MOODS).map(m => (
            <button key={m} onClick={() => setAForm(f => ({ ...f,mood:m }))} style={S.moodBtn(aForm.mood===m)}>{m}</button>
          ))}
        </div>

        <button style={S.btn()} onClick={handleCreateAnnouncement} disabled={loading}>
          {loading ? "⏳ Création en cours..." : "✨ Générer mon Annonce"}
        </button>
      </div>
    </div>
  );

  // ── ANNOUNCE DONE ────────────────────────────────────────────
  if (view === "announce-done") return (
    <div style={S.page()}>
      <style>{G}</style>
      <Confetti active={confetti} />
      <div style={S.card({ textAlign:"center" })}>
        <div style={{ fontSize:"clamp(52px,15vw,72px)",animation:"pulse 1.8s infinite" }}>🎊</div>
        <h2 style={{ fontFamily:"'Fredoka One', cursive",fontSize:"clamp(22px,6vw,28px)",color:"#FF4757",margin:"8px 0 6px" }}>
          Ton annonce est prête !
        </h2>
        <p style={{ color:"#aaa",fontSize:"14px",margin:"0 0 22px",fontWeight:"700" }}>
          Partage ce lien avec tes proches 👇
        </p>

        <div style={S.codeBox()}>
          <div style={{ fontSize:"11px",color:"rgba(255,255,255,0.75)",fontWeight:"900",letterSpacing:"2px",marginBottom:"8px" }}>
            TON LIEN D'ANNONCE
          </div>
          <div style={{ fontSize:"clamp(11px,3vw,13px)",color:"white",wordBreak:"break-all",fontWeight:"700" }}>
            {buildShareLink(code)}
          </div>
        </div>

        <button style={S.btn(copied?"linear-gradient(135deg,#6BCB77,#4CAF50)":undefined)} onClick={() => copyLink(code)}>
          {copied ? "✅ Lien copié !" : "🔗 Partager le lien"}
        </button>

        <div style={S.info()}>
          <strong style={{ color:"#FF6B6B" }}>Comment ça marche ?</strong><br />
          1️⃣ Clique "Partager le lien"<br />
          2️⃣ Envoie via WhatsApp ou SMS<br />
          3️⃣ Tes proches cliquent → voient l'annonce directement 🎉<br />
          4️⃣ Ils créent leur carte depuis l'annonce 💝
        </div>

        <button style={S.btn("linear-gradient(135deg,#667eea,#764ba2)")} onClick={() => go("home")}>
          🏠 Retour à l'accueil
        </button>
      </div>
    </div>
  );

  // ── ENTER ANNOUNCE CODE (fallback manuel) ────────────────────
  if (view === "enter-announce-code") return (
    <div style={S.page("linear-gradient(160deg,#FF9A9E 0%,#FAD0C4 60%,#FFD1FF 100%)")}>
      <style>{G}</style>
      <div style={S.card()}>
        <button style={S.back()} onClick={() => go("home")}>← Retour</button>
        <div style={{ textAlign:"center",marginBottom:"22px" }}>
          <div style={{ fontSize:"clamp(48px,14vw,64px)" }}>💌</div>
          <h2 style={{ fontFamily:"'Fredoka One', cursive",fontSize:"clamp(22px,6vw,28px)",color:"#FF4757",margin:"8px 0 4px" }}>
            Voir une annonce
          </h2>
          <p style={{ color:"#bbb",fontSize:"13px",fontWeight:"700" }}>Entre le code que tu as reçu</p>
        </div>

        {error && <div style={S.err()}>{error}</div>}

        <input
          style={{ ...S.inp(),fontWeight:"900",textAlign:"center",letterSpacing:"6px",textTransform:"uppercase",padding:"18px" }}
          placeholder="A-XXXXX" value={inputCode}
          onChange={e => setInputCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key==="Enter" && handleViewAnnouncement()}
          autoCapitalize="characters" autoCorrect="off" spellCheck={false}
        />
        <p style={{ textAlign:"center",fontSize:"12px",color:"#ccc",fontWeight:"700",marginTop:"6px" }}>
          Les codes d'annonce commencent par A-
        </p>

        <button style={S.btn()} onClick={handleViewAnnouncement} disabled={loading}>
          {loading ? "⏳ Chargement..." : "🎂 Voir l'annonce"}
        </button>
      </div>
    </div>
  );

  // ── CREATE CARD ──────────────────────────────────────────────
  if (view === "create-card") return (
    <div style={S.page("linear-gradient(160deg,#A18CD1 0%,#FBC2EB 60%,#FAD0C4 100%)")}>
      <style>{G}</style>
      <div style={S.card()}>
        <button style={S.back("#8B5CF6")} onClick={() => setView("view-announce")}>← Retour à l'annonce</button>
        <h2 style={{ fontFamily:"'Fredoka One', cursive",fontSize:"clamp(22px,6vw,28px)",color:"#8B5CF6",margin:"0 0 4px" }}>
          💝 Crée ta carte de vœux
        </h2>
        <p style={{ color:"#bbb",fontSize:"13px",margin:"0 0 18px",fontWeight:"700" }}>
          {announcement?.name ? `Un lien sera généré pour envoyer ta carte à ${announcement.name}` : "Un lien sera généré pour partager ta carte"}
        </p>

        {error && <div style={S.err("#8B5CF6","#F5F0FF","#D4B8FF")}>{error}</div>}

        <label style={S.lbl("#8B5CF6")}>Ton prénom *</label>
        <input style={S.inp("#A18CD1")} placeholder="Ex : Florent, Marie, Edmond..."
          value={cForm.fromName} onChange={e => setCForm(f => ({ ...f,fromName:e.target.value }))} />

        <label style={S.lbl("#8B5CF6")}>Ton message *</label>
        <textarea style={{ ...S.inp("#A18CD1"),minHeight:"110px" }}
          placeholder="Ex : Joyeux anniversaire ! Je te souhaite plein de bonheur..."
          value={cForm.message} onChange={e => setCForm(f => ({ ...f,message:e.target.value }))} />

        <label style={S.lbl("#8B5CF6")}>Une photo (optionnel)</label>
        {/* FIX 12 — capture supprimé → galerie disponible */}
        <input type="file" accept="image/*"
          style={{ marginTop:"10px",fontSize:"15px",width:"100%" }}
          onChange={e => e.target.files[0] && readFile(e.target.files[0], v => setCForm(f => ({ ...f,photo:v })))} />
        {cForm.photo && (
          <div style={{ position:"relative",marginTop:"10px" }}>
            <img src={cForm.photo} alt="preview" style={{ width:"100%",borderRadius:"14px",maxHeight:"200px",objectFit:"cover",display:"block" }} />
            <button onClick={() => setCForm(f => ({ ...f,photo:null }))}
              style={{ position:"absolute",top:"8px",right:"8px",background:"rgba(0,0,0,0.5)",color:"white",border:"none",borderRadius:"50%",width:"30px",height:"30px",cursor:"pointer",fontSize:"16px" }}>
              ✕
            </button>
          </div>
        )}

        <button style={S.btn("linear-gradient(135deg,#A18CD1,#FBC2EB)")} onClick={handleCreateCard} disabled={loading}>
          {loading ? "⏳ Création..." : "✨ Générer ma carte"}
        </button>
      </div>
    </div>
  );

  // ── CARD DONE ────────────────────────────────────────────────
  if (view === "card-done") return (
    <div style={S.page("linear-gradient(160deg,#A18CD1 0%,#FBC2EB 60%,#FAD0C4 100%)")}>
      <style>{G}</style>
      <Confetti active={confetti} />
      <div style={S.card({ textAlign:"center" })}>
        <div style={{ fontSize:"clamp(52px,15vw,72px)",animation:"pulse 1.8s infinite" }}>💝</div>
        <h2 style={{ fontFamily:"'Fredoka One', cursive",fontSize:"clamp(22px,6vw,28px)",color:"#8B5CF6",margin:"8px 0 6px" }}>
          Ta carte est prête !
        </h2>
        {/* FIX 13 — texte mis à jour */}
        <p style={{ color:"#aaa",fontSize:"14px",margin:"0 0 22px",fontWeight:"700" }}>
          Partage ce lien avec {announcement?.name || "l'anniversaire"} 🎁
        </p>

        <div style={S.codeBox("linear-gradient(135deg,#A18CD1,#FBC2EB)")}>
          <div style={{ fontSize:"11px",color:"rgba(255,255,255,0.75)",fontWeight:"900",letterSpacing:"2px",marginBottom:"8px" }}>
            TON LIEN DE CARTE
          </div>
          <div style={{ fontSize:"clamp(11px,3vw,13px)",color:"white",wordBreak:"break-all",fontWeight:"700" }}>
            {buildShareLink(code)}
          </div>
        </div>

        <button
          style={S.btn(copied?"linear-gradient(135deg,#6BCB77,#4CAF50)":"linear-gradient(135deg,#A18CD1,#FBC2EB)")}
          onClick={() => copyLink(code)}>
          {copied ? "✅ Lien copié !" : "🔗 Partager le lien"}
        </button>

        {/* FIX 14 — Un seul "Ensuite :", pas de doublon */}
        <div style={S.info("#F9F5FF","#999")}>
          <strong style={{ color:"#8B5CF6" }}>Ensuite :</strong><br />
          1️⃣ Clique "Partager le lien"<br />
          2️⃣ Envoie à {announcement?.name||"l'anniversaire"} via WhatsApp ou SMS<br />
          3️⃣ Il/Elle clique → voit ta carte directement 🎊
        </div>

        <button style={S.btn("linear-gradient(135deg,#667eea,#764ba2)")} onClick={() => go("home")}>
          🏠 Retour à l'accueil
        </button>
      </div>
    </div>
  );

  // ── ENTER CARD CODE (fallback manuel) ────────────────────────
  if (view === "enter-card-code") return (
    <div style={S.page("linear-gradient(160deg,#4ECDC4 0%,#44A08D 60%,#093637 100%)")}>
      <style>{G}</style>
      <div style={S.card()}>
        <button style={S.back("#4ECDC4")} onClick={() => go("home")}>← Retour</button>
        <div style={{ textAlign:"center",marginBottom:"22px" }}>
          <div style={{ fontSize:"clamp(48px,14vw,64px)" }}>🎁</div>
          <h2 style={{ fontFamily:"'Fredoka One', cursive",fontSize:"clamp(22px,6vw,28px)",color:"#44A08D",margin:"8px 0 4px" }}>
            Voir une carte de vœux
          </h2>
          <p style={{ color:"#bbb",fontSize:"13px",fontWeight:"700" }}>Entre le code reçu de ton proche</p>
        </div>

        {error && <div style={S.err()}>{error}</div>}

        <input
          style={{ ...S.inp("#4ECDC4"),fontWeight:"900",textAlign:"center",letterSpacing:"6px",textTransform:"uppercase",padding:"18px" }}
          placeholder="C-XXXXX" value={inputCode}
          onChange={e => setInputCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key==="Enter" && handleViewCard()}
          autoCapitalize="characters" autoCorrect="off" spellCheck={false}
        />
        <p style={{ textAlign:"center",fontSize:"12px",color:"#ccc",fontWeight:"700",marginTop:"6px" }}>
          Les codes de carte commencent par C-
        </p>

        <button style={S.btn("linear-gradient(135deg,#4ECDC4,#44A08D)")} onClick={handleViewCard} disabled={loading}>
          {loading ? "⏳ Chargement..." : "💝 Voir la carte"}
        </button>
      </div>
    </div>
  );

  return null;
}

  
 
