import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const W = 1080, H = 1350;
const ROSE = "#C2185B", ROSE_LIGHT = "#F8BBD9", GOLD = "#C9943A";
const CREAM = "#FFF8F0", ROSE_DARK = "#880E4F", GOLD_LIGHT = "#F9E4B0";

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx, text, maxW) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = word; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

export default function FeteMeres() {
  const [photoObj, setPhotoObj] = useState(null);
  const [photoScale, setPhotoScale] = useState(1);
  const [photoX, setPhotoX] = useState(0);
  const [photoY, setPhotoY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [customMsg, setCustomMsg] = useState("");
  const [downloaded, setDownloaded] = useState(false);
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);
  const nav = useNavigate();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,400&family=Montserrat:wght@700;800&display=swap";
    document.head.appendChild(link);
  }, []);

  const drawPoster = useCallback((canvas, scale) => {
    if (!canvas) return;
    const S = scale;
    canvas.width = W * S; canvas.height = H * S;
    const ctx = canvas.getContext("2d");

    const bgGrad = ctx.createLinearGradient(0, 0, W * S, H * S);
    bgGrad.addColorStop(0, "#FFFFFF"); bgGrad.addColorStop(0.4, CREAM); bgGrad.addColorStop(1, "#FFF0F5");
    ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W * S, H * S);

    const petals = [{ x:-80,y:300,r:250 },{ x:1160,y:200,r:280 },{ x:-60,y:1100,r:200 },{ x:1100,y:1050,r:220 }];
    petals.forEach(({ x, y, r }) => {
      ctx.strokeStyle = "rgba(194,24,91,0.06)"; ctx.lineWidth = 2 * S;
      ctx.beginPath(); ctx.arc(x * S, y * S, r * S, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = "rgba(201,148,58,0.05)"; ctx.lineWidth = 1 * S;
      ctx.beginPath(); ctx.arc(x * S, y * S, (r - 18) * S, 0, Math.PI * 2); ctx.stroke();
    });

    const hGrad = ctx.createLinearGradient(0, 0, W * S, 0);
    hGrad.addColorStop(0, ROSE_DARK); hGrad.addColorStop(0.5, GOLD); hGrad.addColorStop(1, ROSE_DARK);
    ctx.fillStyle = hGrad; ctx.fillRect(0, 0, W * S, 6 * S);

    ctx.textAlign = "center"; ctx.fillStyle = GOLD;
    ctx.font = `${18 * S}px serif`; ctx.fillText("◆", (W/2-180)*S, 56*S); ctx.fillText("◆", (W/2+180)*S, 56*S);
    ctx.fillStyle = ROSE_DARK; ctx.font = `800 ${22 * S}px Montserrat, Arial Black, sans-serif`;
    ctx.fillText("TSK'S TECH SERVICES", W/2*S, 58*S);
    ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5*S;
    ctx.beginPath(); ctx.moveTo(120*S, 72*S); ctx.lineTo((W-120)*S, 72*S); ctx.stroke();

    const fX=85*S, fY=88*S, fW=(W-170)*S, fH=780*S, fR=40*S;
    ctx.save(); ctx.shadowColor="rgba(194,24,91,0.2)"; ctx.shadowBlur=40*S; ctx.shadowOffsetY=10*S;
    ctx.fillStyle="white"; roundRect(ctx,fX-14*S,fY-14*S,fW+28*S,fH+28*S,fR+14*S); ctx.fill(); ctx.restore();
    ctx.strokeStyle=GOLD; ctx.lineWidth=9*S; roundRect(ctx,fX-9*S,fY-9*S,fW+18*S,fH+18*S,fR+9*S); ctx.stroke();
    ctx.strokeStyle=ROSE; ctx.lineWidth=4*S; roundRect(ctx,fX-2*S,fY-2*S,fW+4*S,fH+4*S,fR+2*S); ctx.stroke();

    ctx.save(); roundRect(ctx,fX,fY,fW,fH,fR); ctx.clip();
    if (photoObj) {
      const iA=photoObj.width/photoObj.height, fA=fW/fH;
      let dW,dH;
      if(iA>fA){dH=fH*photoScale;dW=dH*iA;}else{dW=fW*photoScale;dH=dW/iA;}
      ctx.drawImage(photoObj,fX+(fW-dW)/2+photoX*S,fY+(fH-dH)/2+photoY*S,dW,dH);
    } else {
      const ph=ctx.createLinearGradient(fX,fY,fX,fY+fH);
      ph.addColorStop(0,"#FCE4EC"); ph.addColorStop(1,GOLD_LIGHT);
      ctx.fillStyle=ph; ctx.fillRect(fX,fY,fW,fH);
      ctx.font=`${70*S}px serif`; ctx.fillStyle="rgba(194,24,91,0.3)"; ctx.textAlign="center";
      ctx.fillText("📷",W/2*S,(fY/S+fH/S/2-20)*S);
      ctx.font=`${22*S}px Montserrat,Arial`; ctx.fillStyle="rgba(136,14,79,0.5)";
      ctx.fillText("Importe ta photo ici",W/2*S,(fY/S+fH/S/2+50)*S);
    }
    ctx.restore();

    ctx.textAlign="center"; ctx.fillStyle=ROSE_DARK;
    ctx.font=`italic 400 ${58*S}px "Cormorant Garamond",Georgia,serif`;
    ctx.fillText("Joyeuse",W/2*S,952*S);

    ctx.font=`800 ${76*S}px Montserrat,"Arial Black",sans-serif`;
    const t1="Fête ",t2="des ",t3="Mères";
    const w1=ctx.measureText(t1).width,w2=ctx.measureText(t2).width,w3=ctx.measureText(t3).width;
    let tX=W/2*S-(w1+w2+w3)/2;
    ctx.textAlign="left";
    ctx.fillStyle=ROSE_DARK; ctx.fillText(t1,tX,1030*S); tX+=w1;
    ctx.fillStyle=GOLD; ctx.fillText(t2,tX,1030*S); tX+=w2;
    ctx.fillStyle=ROSE_DARK; ctx.fillText(t3,tX,1030*S);

    ctx.textAlign="center"; ctx.fillStyle=GOLD;
    ctx.font=`${18*S}px serif`; ctx.fillText("✦  ✿  ✦",W/2*S,1065*S);

    ctx.fillStyle=ROSE_DARK; ctx.font=`600 italic ${27*S}px "Cormorant Garamond",Georgia,serif`;
    ctx.fillText("Maman :",W/2*S,1103*S);
    ctx.font=`italic ${24*S}px "Cormorant Garamond",Georgia,serif`; ctx.fillStyle="#6A1030";
    ctx.fillText("notre premier amour,",W/2*S,1136*S);
    ctx.fillText("notre première motivation,",W/2*S,1165*S);
    ctx.fillText("notre plus grande bénédiction.",W/2*S,1194*S);

    if (customMsg.trim()) {
      ctx.font=`700 ${22*S}px Montserrat,Arial,sans-serif`; ctx.fillStyle=GOLD;
      const lines=wrapText(ctx,`💛  ${customMsg.trim()}`,800*S);
      lines.forEach((line,i)=>ctx.fillText(line,W/2*S,(1238+i*28)*S));
    }

    const ftrY=(customMsg.trim()?1278:1250)*S;
    const ftrG=ctx.createLinearGradient(0,ftrY,W*S,ftrY);
    ftrG.addColorStop(0,ROSE_DARK); ftrG.addColorStop(0.5,GOLD); ftrG.addColorStop(1,ROSE_DARK);
    ctx.fillStyle=ftrG; ctx.fillRect(0,ftrY,W*S,H*S-ftrY);
    ctx.fillStyle="white"; ctx.font=`700 ${20*S}px Montserrat,Arial,sans-serif`;
    ctx.textAlign="center"; ctx.fillText("TSK'S TECH SERVICES",W/2*S,ftrY+(H*S-ftrY)/2+7*S);
  }, [photoObj, photoScale, photoX, photoY, customMsg]);

  useEffect(() => { drawPoster(previewRef.current, 0.34); }, [drawPoster]);

  const handleDownload = () => {
    const canvas = document.createElement("canvas");
    drawPoster(canvas, 1);
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "affiche-fete-des-meres-tsks.png"; a.click();
      URL.revokeObjectURL(url);
      setDownloaded(true); setTimeout(() => setDownloaded(false), 3000);
    }, "image/png");
  };

  const handleFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const img = new Image();
    img.onload = () => { setPhotoObj(img); setPhotoScale(1); setPhotoX(0); setPhotoY(0); };
    img.src = URL.createObjectURL(file);
  };

  const onMouseDown=(e)=>{if(!photoObj)return;setIsDragging(true);setDragStart({x:e.clientX,y:e.clientY});};
  const onMouseMove=(e)=>{if(!isDragging)return;setPhotoX(p=>p+(e.clientX-dragStart.x)/0.34);setPhotoY(p=>p+(e.clientY-dragStart.y)/0.34);setDragStart({x:e.clientX,y:e.clientY});};
  const onTouchStart=(e)=>{if(!photoObj)return;const t=e.touches[0];setIsDragging(true);setDragStart({x:t.clientX,y:t.clientY});};
  const onTouchMove=(e)=>{if(!isDragging)return;const t=e.touches[0];setPhotoX(p=>p+(t.clientX-dragStart.x)/0.34);setPhotoY(p=>p+(t.clientY-dragStart.y)/0.34);setDragStart({x:t.clientX,y:t.clientY});};
  const stopDrag=()=>setIsDragging(false);

  const card={ background:"#0E0625", border:"1px solid #1E0F50", borderRadius:14, padding:"16px", marginBottom:14 };
  const label={ fontSize:11, fontWeight:800, color:"#9B8EC4", letterSpacing:2, textTransform:"uppercase", marginBottom:10, display:"block", fontFamily:"Outfit,Arial,sans-serif" };

  return (
    <div style={{ background:"#07030F", minHeight:"100vh", fontFamily:"Outfit,sans-serif", color:"white", paddingBottom:40 }}>

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#0D0525,#1A0550)", padding:"16px 20px", display:"flex", alignItems:"center", gap:12, borderBottom:"1px solid rgba(200,163,37,0.15)" }}>
        <button onClick={()=>nav("/")} style={{ background:"transparent", border:"1px solid #2A1860", borderRadius:8, color:"#9B8EC4", padding:"6px 12px", cursor:"pointer", fontSize:13 }}>← Retour</button>
        <div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:"0.08em", color:"#C9943A" }}>MothersLink</div>
          <div style={{ fontSize:11, color:"#9B8EC4" }}>Affiche Fête des Mères · Tsk's Tech Services</div>
        </div>
      </div>

      <div style={{ padding:"20px 16px 0", maxWidth:440, margin:"0 auto" }}>

        {/* Preview */}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
          <div style={{ borderRadius:16, overflow:"hidden", boxShadow:"0 12px 40px rgba(107,33,232,0.25)", cursor:photoObj?(isDragging?"grabbing":"grab"):"default", touchAction:"none" }}>
            <canvas ref={previewRef}
              onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={stopDrag} onMouseLeave={stopDrag}
              onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={stopDrag}
              style={{ display:"block", maxWidth:"100%", userSelect:"none" }}/>
          </div>
        </div>

        {/* Upload */}
        <div style={card}>
          <span style={label}>📷 La Photo</span>
          <div onClick={()=>fileInputRef.current?.click()}
            style={{ border:`2px dashed ${photoObj?"#C2185B":"#2A1860"}`, borderRadius:10, padding:"14px 12px", textAlign:"center", cursor:"pointer", background:photoObj?"rgba(194,24,91,0.05)":"transparent" }}>
            <div style={{ fontSize:13, fontWeight:600, color: photoObj?"#F8BBD9":"#9B8EC4" }}>
              {photoObj ? "✓ Photo chargée — Appuie pour changer" : "Appuie pour choisir une photo"}
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} style={{ display:"none" }}/>
        </div>

        {/* Zoom */}
        {photoObj && (
          <div style={card}>
            <span style={label}>🔍 Cadrer</span>
            <p style={{ fontSize:12, color:"#9B8EC4", margin:"0 0 10px" }}>Glisse sur l'aperçu pour repositionner</p>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <button onClick={()=>setPhotoScale(s=>Math.max(0.5,+(s-0.1).toFixed(2)))}
                style={{ width:36,height:36,background:"#150640",border:"1px solid #2A1860",borderRadius:8,cursor:"pointer",fontSize:20,color:"#C9943A",fontWeight:"bold" }}>−</button>
              <input type="range" min="50" max="300" value={Math.round(photoScale*100)}
                onChange={e=>setPhotoScale(e.target.value/100)} style={{ flex:1, accentColor:"#6B21E8" }}/>
              <button onClick={()=>setPhotoScale(s=>Math.min(3,+(s+0.1).toFixed(2)))}
                style={{ width:36,height:36,background:"#150640",border:"1px solid #2A1860",borderRadius:8,cursor:"pointer",fontSize:20,color:"#C9943A",fontWeight:"bold" }}>+</button>
            </div>
            <button onClick={()=>{setPhotoScale(1);setPhotoX(0);setPhotoY(0);}}
              style={{ marginTop:10,width:"100%",padding:"8px",background:"transparent",border:"1px solid #2A1860",borderRadius:8,cursor:"pointer",color:"#9B8EC4",fontSize:12 }}>
              Réinitialiser la position
            </button>
          </div>
        )}

        {/* Message */}
        <div style={card}>
          <span style={label}>💛 Message personnalisé</span>
          <input type="text" placeholder="Ex: Je t'aime Maman ❤️" value={customMsg}
            onChange={e=>setCustomMsg(e.target.value)} maxLength={55}
            style={{ width:"100%",padding:"11px 13px",border:`1.5px solid ${customMsg?"#C2185B":"#2A1860"}`,borderRadius:10,fontSize:14,color:"white",outline:"none",boxSizing:"border-box",background:"#07030F",fontFamily:"Outfit,sans-serif" }}/>
          <div style={{ fontSize:11,color:"#3A2A6A",marginTop:6 }}>{customMsg.length}/55 caractères</div>
        </div>

        {/* Download */}
        <button onClick={handleDownload}
          style={{ width:"100%",padding:"17px",background:downloaded?"#1B5E20":"linear-gradient(135deg,#880E4F,#C9943A)",border:"none",borderRadius:14,cursor:"pointer",color:"white",fontSize:17,fontWeight:700,letterSpacing:1,fontFamily:"Outfit,Arial,sans-serif",boxShadow:downloaded?"0 4px 20px rgba(27,94,32,0.4)":"0 4px 24px rgba(107,33,232,0.3)",transition:"all 0.3s" }}>
          {downloaded ? "✓ Téléchargé !" : "Télécharger l'affiche ↓"}
        </button>
        <div style={{ textAlign:"center",fontSize:12,color:"#3A2A6A",marginTop:8 }}>PNG · 1080 × 1350 px</div>
      </div>
    </div>
  )
      }
