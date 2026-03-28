import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, ReferenceLine,
} from "recharts";

// ─── Data helpers ────────────────────────────────────────────────────────────

const generateFlowVolumeCurve = (fvc = 3.82, pef = 7.4, peakV = 0.12) => {
  const pts = [];
  const steps = Math.ceil(fvc / 0.05);
  for (let i = 0; i <= steps; i++) {
    const v = parseFloat((i * 0.05).toFixed(2));
    let flow = v <= peakV
      ? (v / peakV) * pef
      : pef * (fvc - v) / (fvc - peakV);
    pts.push({ volume: v, flow: Math.max(0, parseFloat(flow.toFixed(2))) });
  }
  return pts;
};

const FULL_CURVE = generateFlowVolumeCurve();
const CURVE_2    = generateFlowVolumeCurve(3.79, 7.28, 0.12);
const CURVE_3    = generateFlowVolumeCurve(3.80, 7.35, 0.12);

const MOCK_RESULTS = {
  fvc: 3.82, fvcPred: 4.10, fvcPct: 93,
  fev1: 2.91, fev1Pred: 3.20, fev1Pct: 91,
  fev1Fvc: 76, pef: 7.4,
  pattern: "Normal", severity: null, confidence: 94,
  interpretation: "Lung function is within normal limits. No evidence of airflow obstruction or restrictive pattern. FEV1/FVC ratio of 76% is normal and indicates adequate airway patency. Expiratory flow contour is smooth with an expected peak-flow trajectory.",
  recommendation: "No immediate clinical intervention required. Continue current management. Recommend routine repeat spirometry in 12 months or sooner if symptoms develop.",
};

const ANALYSIS_STEPS = [
  "Loading waveform data…",
  "Extracting spirometric parameters…",
  "Comparing against age/sex/height norms…",
  "Running AI pattern classification…",
  "Generating clinical interpretation…",
];

const STEPS = ["Scan ID","Welcome","Test Type","Health Check","Measure","Confirm","Prepare","Instructions","Test","Dispose","Schedule","Education","Report"];

// ─── Colours ─────────────────────────────────────────────────────────────────

const C = {
  navy:"#1e3a5f", blue:"#2563eb", blueLight:"#eff6ff",
  green:"#16a34a", greenLight:"#f0fdf4",
  yellow:"#ca8a04", yellowLight:"#fefce8",
  red:"#dc2626", redLight:"#fef2f2",
  slate:"#64748b", border:"#e2e8f0", bg:"#f1f5f9",
  white:"#ffffff", text:"#0f172a",
};

// ─── Shared UI ───────────────────────────────────────────────────────────────

const Card = ({ children, style={} }) => (
  <div style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 16px rgba(0,0,0,.08)", padding:40, ...style }}>
    {children}
  </div>
);

const Btn = ({ children, onClick, variant="primary", style={}, disabled=false }) => {
  const base = { padding:"14px 32px", borderRadius:10, border:"none", cursor:disabled?"not-allowed":"pointer", fontWeight:600, fontSize:16, transition:"opacity .15s", opacity:disabled?.45:1, ...style };
  const variants = {
    primary:{ background:C.blue, color:"#fff" },
    outline:{ background:"transparent", color:C.blue, border:`2px solid ${C.blue}` },
    ghost:  { background:C.bg, color:C.text },
    success:{ background:C.green, color:"#fff" },
    danger: { background:C.red, color:"#fff" },
    warn:   { background:"#f59e0b", color:"#fff" },
  };
  return <button style={{...base,...variants[variant]}} onClick={disabled?undefined:onClick}>{children}</button>;
};

const Tag = ({ label, color, bg }) => (
  <span style={{ background:bg, color, borderRadius:20, padding:"4px 14px", fontSize:13, fontWeight:600 }}>{label}</span>
);

const inputStyle = { width:"100%", padding:"12px 14px", borderRadius:8, border:`1.5px solid ${C.border}`, fontSize:16, outline:"none", boxSizing:"border-box", color:C.text, background:C.white };

// ─── Step 0 — Scan ID ────────────────────────────────────────────────────────

const SCAN_MOCK = { name:"Matti Virtanen", dob:"12 Mar 1971", age:"54", sex:"male", idNumber:"FI-284 7391-A", nationality:"Finnish" };

function ScanID({ onComplete }) {
  const [phase, setPhase] = useState("idle");
  const handleScan = () => { setPhase("scanning"); setTimeout(()=>setPhase("done"),3200); };
  return (
    <Card>
      <style>{`
        @keyframes scanLine{0%{top:0}50%{top:calc(100% - 4px)}100%{top:0}}
        @keyframes scannerGlow{0%,100%{box-shadow:0 0 0 3px rgba(37,99,235,.15)}50%{box-shadow:0 0 0 6px rgba(37,99,235,.30)}}
        @keyframes checkPop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.2);opacity:1}100%{transform:scale(1)}}
        @keyframes dotPulse{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.4);opacity:1}}
      `}</style>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:32}}>
        <div style={{width:48,height:48,borderRadius:12,background:"#e0f2fe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🪪</div>
        <div>
          <h2 style={{margin:0,fontSize:24,fontWeight:700}}>Scan Your ID</h2>
          <p style={{margin:0,color:C.slate,fontSize:14}}>Place your identity card, passport, or Kela card face-up in the scanner</p>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"center",marginBottom:28}}>
        <div style={{position:"relative",width:380,height:240,background:phase==="done"?C.greenLight:"#f8fafc",borderRadius:18,
          border:`2px solid ${phase==="done"?C.green:phase==="scanning"?C.blue:C.border}`,overflow:"hidden",transition:"border-color .3s,background .3s",
          animation:phase==="scanning"?"scannerGlow 1s ease-in-out infinite":"none"}}>
          {["topLeft","topRight","bottomLeft","bottomRight"].map(pos=>{
            const t=pos.startsWith("top"), l=pos.endsWith("Left"), col=phase==="done"?C.green:C.blue;
            return <div key={pos} style={{position:"absolute",top:t?14:"auto",bottom:!t?14:"auto",left:l?14:"auto",right:!l?14:"auto",width:22,height:22,
              borderTop:t?`3px solid ${col}`:"none",borderBottom:!t?`3px solid ${col}`:"none",
              borderLeft:l?`3px solid ${col}`:"none",borderRight:!l?`3px solid ${col}`:"none",
              borderRadius:t&&l?"4px 0 0 0":t&&!l?"0 4px 0 0":!t&&l?"0 0 0 4px":"0 0 4px 0",transition:"border-color .3s"}}/>;
          })}
          {phase==="scanning"&&<div style={{position:"absolute",left:0,right:0,height:4,background:"linear-gradient(90deg,transparent,rgba(37,99,235,.6),#2563eb,rgba(37,99,235,.6),transparent)",animation:"scanLine 1.1s ease-in-out infinite",boxShadow:"0 0 10px rgba(37,99,235,.5)"}}/>}
          {phase==="idle"&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:10}}>
            <div style={{width:220,height:138,borderRadius:10,border:`2px dashed ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:6,background:C.white}}>
              <span style={{fontSize:34}}>🪪</span><span style={{fontSize:13,color:C.slate}}>ID card</span>
            </div>
          </div>}
          {phase==="scanning"&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",gap:16,padding:28,opacity:.5}}>
            <div style={{width:56,height:56,borderRadius:"50%",background:"#cbd5e1",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>👤</div>
            <div style={{flex:1}}><div style={{height:12,background:"#cbd5e1",borderRadius:4,marginBottom:8}}/><div style={{height:10,background:"#e2e8f0",borderRadius:4,marginBottom:6,width:"70%"}}/><div style={{height:10,background:"#e2e8f0",borderRadius:4,width:"50%"}}/></div>
          </div>}
          {phase==="done"&&<div style={{display:"flex",alignItems:"center",gap:18,padding:"22px 28px",height:"100%"}}>
            <div style={{width:72,height:88,borderRadius:8,background:"#bbf7d0",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,border:`2px solid ${C.green}`}}>👤</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:19,color:C.text}}>{SCAN_MOCK.name}</div>
              <div style={{color:C.slate,fontSize:13,marginTop:3}}>Born: {SCAN_MOCK.dob} · {SCAN_MOCK.nationality}</div>
              <div style={{color:C.slate,fontSize:13,marginTop:2}}>ID: {SCAN_MOCK.idNumber}</div>
              <div style={{marginTop:10}}><Tag label="✓ ID Verified" color={C.green} bg="#bbf7d0"/></div>
            </div>
            <div style={{width:40,height:40,borderRadius:"50%",background:C.green,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:20,flexShrink:0,animation:"checkPop .4s cubic-bezier(.34,1.56,.64,1)"}}>✓</div>
          </div>}
        </div>
      </div>
      <div style={{textAlign:"center",marginBottom:24,minHeight:24}}>
        {phase==="idle"&&<span style={{color:C.slate,fontSize:14}}>Align the card within the frame, then press <strong>Scan</strong></span>}
        {phase==="scanning"&&<span style={{color:C.blue,fontWeight:600,fontSize:14}}>📡 Reading card… please hold still</span>}
        {phase==="done"&&<span style={{color:C.green,fontWeight:600,fontSize:14}}>✅ Scan successful — patient data extracted</span>}
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
        {phase==="idle"&&<><Btn onClick={handleScan} style={{fontSize:17,padding:"15px 48px"}}>📷 Scan ID Card</Btn>
          <button onClick={()=>onComplete(null)} style={{background:"none",border:"none",color:C.slate,fontSize:13,cursor:"pointer",textDecoration:"underline",padding:0}}>Skip — I'll enter details manually</button></>}
        {phase==="scanning"&&<div style={{height:50,display:"flex",alignItems:"center"}}><div style={{display:"flex",gap:6}}>
          {[0,1,2].map(i=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:C.blue,animation:`dotPulse 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}
        </div></div>}
        {phase==="done"&&<Btn variant="success" onClick={()=>onComplete(SCAN_MOCK)} style={{fontSize:17,padding:"15px 48px"}}>Confirm &amp; Continue →</Btn>}
      </div>
    </Card>
  );
}

// ─── Step 1 — Welcome / Onboarding ───────────────────────────────────────────

function WelcomeScreen({ onNext }) {
  const [slide, setSlide] = useState(0);
  const [barPct, setBarPct] = useState(0);
  const timerRef = useRef(null);
  const SLIDE_DURATION = 5000;

  const slides = [
    { bg:"#1e3a5f", emoji:"👋", title:"Welcome to SPIRO AI", body:"This automated booth will guide you through a simple lung function test. The whole process takes about 10–15 minutes." },
    { bg:"#0f4c81", emoji:"🫁", title:"What is a spirometry test?", body:"It measures how much air you can breathe in and out, and how quickly. It helps your doctor check the health of your lungs." },
    { bg:"#164e63", emoji:"🤖", title:"AI-assisted results", body:"Our AI analyses your results instantly and securely shares them with your healthcare team. No waiting for a lab." },
    { bg:"#1e3a5f", emoji:"🧑‍⚕️", title:"You are in safe hands", body:"If you need help at any time, press the red <strong>Call for Help</strong> button. A staff member will come to you immediately." },
  ];

  useEffect(()=>{
    setBarPct(0);
    const tick=50, total=SLIDE_DURATION/tick;
    let t=0;
    timerRef.current=setInterval(()=>{
      t++; setBarPct((t/total)*100);
      if(t>=total){ clearInterval(timerRef.current); if(slide<slides.length-1) setSlide(s=>s+1); }
    },tick);
    return ()=>clearInterval(timerRef.current);
  },[slide]);

  const s=slides[slide];
  const isLast=slide===slides.length-1;

  return (
    <Card style={{padding:0,overflow:"hidden"}}>
      {/* Animated hero panel */}
      <div style={{background:s.bg,padding:"56px 48px 40px",transition:"background .6s",textAlign:"center",position:"relative"}}>
        <div style={{fontSize:72,marginBottom:24,filter:"drop-shadow(0 4px 16px rgba(0,0,0,.3))"}}>{s.emoji}</div>
        <h1 style={{color:"#fff",fontSize:30,fontWeight:800,margin:"0 0 16px",lineHeight:1.2}}>{s.title}</h1>
        <p style={{color:"#93c5fd",fontSize:17,lineHeight:1.7,margin:0,maxWidth:500,marginLeft:"auto",marginRight:"auto"}}
           dangerouslySetInnerHTML={{__html:s.body}}/>
        {/* Progress bar */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:4,background:"rgba(255,255,255,.15)"}}>
          <div style={{height:"100%",background:"#60a5fa",width:`${barPct}%`,transition:"width .05s linear"}}/>
        </div>
      </div>

      {/* Dot nav + controls */}
      <div style={{padding:"24px 40px 32px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:8}}>
          {slides.map((_,i)=>(
            <div key={i} onClick={()=>{clearInterval(timerRef.current);setSlide(i);}}
              style={{width:i===slide?28:10,height:10,borderRadius:6,background:i<=slide?C.blue:C.border,cursor:"pointer",transition:"all .25s"}}/>
          ))}
        </div>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          {!isLast&&<button onClick={()=>{clearInterval(timerRef.current);setSlide(slides.length-1);}}
            style={{background:"none",border:"none",color:C.slate,fontSize:13,cursor:"pointer",textDecoration:"underline",padding:0}}>
            Skip intro
          </button>}
          {isLast
            ? <Btn variant="success" onClick={onNext} style={{fontSize:17,padding:"14px 40px"}}>Let's Begin →</Btn>
            : <Btn onClick={()=>{clearInterval(timerRef.current);setSlide(s=>s+1);}}>Next →</Btn>
          }
        </div>
      </div>
    </Card>
  );
}

// ─── Step 2 — Select Test ────────────────────────────────────────────────────

const TEST_TYPES = [
  { id:"fvc",    icon:"🫁", name:"Spirometry (FVC)",       desc:"Standard test measuring how much air you breathe out and how fast. Most common lung function test.", recommended:true },
  { id:"bd",     icon:"💊", name:"Bronchodilator Test",     desc:"Measures your lung function before and after using a reliever inhaler to check airway response.", recommended:false },
  { id:"pf",     icon:"📊", name:"Peak Flow",               desc:"A quick test measuring the maximum speed you can breathe out. Simple and fast.", recommended:false },
  { id:"rev",    icon:"🔄", name:"Reversibility Test",      desc:"Checks whether narrowed airways open up with medication — important for asthma diagnosis.", recommended:false },
  { id:"svc",    icon:"🌬️", name:"Slow Vital Capacity",     desc:"A relaxed breathing test measuring your total lung volume without forcing the air out.", recommended:false },
  { id:"mvv",    icon:"⚡", name:"MVV Test",                desc:"Measures maximum breathing effort with rapid in-and-out breaths for 12 seconds.", recommended:false },
];

function TestSelection({ onNext }) {
  const [selected, setSelected] = useState("fvc");
  const test = TEST_TYPES.find(t=>t.id===selected);
  return (
    <Card>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28}}>
        <div style={{width:48,height:48,borderRadius:12,background:"#ede9fe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🔬</div>
        <div>
          <h2 style={{margin:0,fontSize:24,fontWeight:700}}>Which test are you taking?</h2>
          <p style={{margin:0,color:C.slate,fontSize:14}}>Select the test your doctor has requested. If unsure, choose Spirometry.</p>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:28}}>
        {TEST_TYPES.map(t=>(
          <div key={t.id} onClick={()=>setSelected(t.id)} style={{
            borderRadius:14, padding:"20px 18px", cursor:"pointer",
            border:`2px solid ${selected===t.id?C.blue:C.border}`,
            background:selected===t.id?C.blueLight:C.white,
            transition:"all .2s", position:"relative",
          }}>
            {t.recommended&&<div style={{position:"absolute",top:10,right:10,background:C.blue,color:"#fff",fontSize:10,fontWeight:700,borderRadius:8,padding:"2px 8px"}}>RECOMMENDED</div>}
            <div style={{fontSize:32,marginBottom:10}}>{t.icon}</div>
            <div style={{fontWeight:700,fontSize:15,color:selected===t.id?C.blue:C.text,marginBottom:6}}>{t.name}</div>
            <div style={{fontSize:12,color:C.slate,lineHeight:1.5}}>{t.desc}</div>
            {selected===t.id&&<div style={{position:"absolute",bottom:10,right:14,color:C.blue,fontSize:18,fontWeight:700}}>✓</div>}
          </div>
        ))}
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{padding:"12px 18px",background:C.blueLight,borderRadius:10,fontSize:14,color:"#1e40af",flex:1,marginRight:24}}>
          ℹ️ <strong>{test.name}</strong> selected. Your doctor will be able to see your results after the test is complete.
        </div>
        <Btn onClick={()=>onNext(selected)} style={{whiteSpace:"nowrap"}}>Continue →</Btn>
      </div>
    </Card>
  );
}

// ─── Step 3 — Health Screening ───────────────────────────────────────────────

const HEALTH_QUESTIONS = [
  { id:"cough",   icon:"🤧", text:"Are you coughing right now?",                   caution:"Coughing can affect the test result. Please let staff know." },
  { id:"chest",   icon:"🦠", text:"Do you have a chest infection or cold?",        caution:"A respiratory infection may affect accuracy. Staff will advise." },
  { id:"eye",     icon:"👁️", text:"Have you had eye surgery in the last 6 weeks?", caution:"Forced breathing after eye surgery carries some risk. Staff will check." },
  { id:"surgery", icon:"🏥", text:"Chest or abdominal surgery in the last 4 weeks?",caution:"Recent surgery may be affected by forced breathing. Staff will advise." },
  { id:"clots",   icon:"🩺", text:"Have you been treated for blood clots recently?",caution:"Please inform staff before proceeding." },
  { id:"collapse",icon:"⚠️", text:"Have you had a collapsed lung (pneumothorax)?", caution:"This is an important safety consideration. Staff must be informed." },
  { id:"smoke",   icon:"🚬", text:"Do you smoke or have you smoked in the past?",   caution:"Smoking history is important for interpreting your results." },
];

function HealthScreening({ onNext }) {
  const [answers, setAnswers] = useState({});
  const allAnswered = HEALTH_QUESTIONS.every(q=>q.id in answers);
  const hasYes = Object.values(answers).some(v=>v===true);
  const yesCount = Object.values(answers).filter(v=>v===true).length;

  return (
    <Card>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28}}>
        <div style={{width:48,height:48,borderRadius:12,background:"#fef3c7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>📋</div>
        <div>
          <h2 style={{margin:0,fontSize:24,fontWeight:700}}>A few quick health questions</h2>
          <p style={{margin:0,color:C.slate,fontSize:14}}>Please answer honestly — this helps us keep you safe during the test</p>
        </div>
        <div style={{marginLeft:"auto",fontSize:13,color:C.slate,whiteSpace:"nowrap"}}>
          {Object.keys(answers).length}/{HEALTH_QUESTIONS.length} answered
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28}}>
        {HEALTH_QUESTIONS.map(q=>{
          const ans=answers[q.id];
          const isYes=ans===true;
          return (
            <div key={q.id} style={{borderRadius:12,border:`1.5px solid ${isYes?C.yellow:ans===false?C.green:C.border}`,
              background:isYes?C.yellowLight:ans===false?C.greenLight:C.white,transition:"all .25s",overflow:"hidden"}}>
              <div style={{display:"flex",alignItems:"center",gap:14,padding:"16px 20px"}}>
                <span style={{fontSize:24,flexShrink:0}}>{q.icon}</span>
                <span style={{flex:1,fontSize:15,fontWeight:500,color:C.text}}>{q.text}</span>
                <div style={{display:"flex",gap:8,flexShrink:0}}>
                  <button onClick={()=>setAnswers(a=>({...a,[q.id]:false}))}
                    style={{padding:"8px 22px",borderRadius:8,border:`2px solid ${ans===false?C.green:C.border}`,
                      background:ans===false?C.green:"transparent",color:ans===false?"#fff":C.text,
                      fontWeight:700,fontSize:14,cursor:"pointer",transition:"all .2s"}}>No</button>
                  <button onClick={()=>setAnswers(a=>({...a,[q.id]:true}))}
                    style={{padding:"8px 22px",borderRadius:8,border:`2px solid ${isYes?"#d97706":C.border}`,
                      background:isYes?"#d97706":"transparent",color:isYes?"#fff":C.text,
                      fontWeight:700,fontSize:14,cursor:"pointer",transition:"all .2s"}}>Yes</button>
                </div>
              </div>
              {isYes&&<div style={{padding:"10px 20px 14px 58px",fontSize:13,color:"#92400e",background:"#fffbeb",borderTop:`1px solid #fde68a`}}>
                ⚠️ {q.caution}
              </div>}
            </div>
          );
        })}
      </div>

      {hasYes&&allAnswered&&(
        <div style={{padding:"16px 20px",background:C.yellowLight,border:`1.5px solid #fde68a`,borderRadius:12,marginBottom:20,fontSize:14,color:"#92400e"}}>
          ⚠️ You answered <strong>Yes</strong> to {yesCount} question{yesCount>1?"s":""}.
          A staff member has been notified and may check in with you before the test begins.
          You can still proceed unless told otherwise.
        </div>
      )}
      {!hasYes&&allAnswered&&(
        <div style={{padding:"16px 20px",background:C.greenLight,border:`1.5px solid #bbf7d0`,borderRadius:12,marginBottom:20,fontSize:14,color:C.green}}>
          ✅ All clear — no concerns identified. You are ready to proceed.
        </div>
      )}

      <div style={{display:"flex",justifyContent:"flex-end"}}>
        <Btn onClick={onNext} disabled={!allAnswered}>Continue →</Btn>
      </div>
    </Card>
  );
}

// ─── Step 4 — Measure height & weight ────────────────────────────────────────

const arcPath = (cx, cy, r, startDeg, endDeg) => {
  const rad = d=>(d-90)*Math.PI/180;
  const x1=cx+r*Math.cos(rad(startDeg)), y1=cy+r*Math.sin(rad(startDeg));
  const x2=cx+r*Math.cos(rad(endDeg)),   y2=cy+r*Math.sin(rad(endDeg));
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${(endDeg-startDeg)>180?1:0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
};

function MeasureScreen({ targetHeight=175, targetWeight=82, onComplete }) {
  const [phase,setPhase]=useState("measuring");
  const [animH,setAnimH]=useState(0);
  const [animW,setAnimW]=useState(0);
  const [scanY,setScanY]=useState(0);
  const [editH,setEditH]=useState(String(targetHeight));
  const [editW,setEditW]=useState(String(targetWeight));
  const [adjusting,setAdjusting]=useState(false);
  const timerRef=useRef(null);

  useEffect(()=>{
    const DURATION=3000, INTERVAL=16, steps=DURATION/INTERVAL;
    let s=0;
    timerRef.current=setInterval(()=>{
      s++;
      const t=Math.min(s/steps,1), e=1-Math.pow(1-t,3);
      setScanY(e); setAnimH(Math.round(targetHeight*e)); setAnimW(parseFloat((targetWeight*e).toFixed(1)));
      if(s>=steps){ clearInterval(timerRef.current); setAnimH(targetHeight); setAnimW(targetWeight);
        setTimeout(()=>{setPhase("done");setEditH(String(targetHeight));setEditW(String(targetWeight));},400); }
    },INTERVAL);
    return ()=>clearInterval(timerRef.current);
  },[targetHeight,targetWeight]);

  const svgW=180,svgH=300,rulerX=100,rulerW=20,maxH=220;
  const headFrac=targetHeight/maxH, headY=svgH*(1-headFrac);
  const beamY=headY+(svgH-headY)*(1-Math.min(scanY/0.85,1));
  const fillH=svgH*(animH/maxH);

  const HeightViz=()=>(
    <svg width={svgW} height={svgH} style={{overflow:"visible"}}>
      <rect x={rulerX} y={0} width={rulerW} height={svgH} rx={6} fill="#f1f5f9" stroke={C.border} strokeWidth={1.5}/>
      <rect x={rulerX} y={svgH-fillH} width={rulerW} height={fillH} rx={6} fill="url(#hGrad)"/>
      <defs><linearGradient id="hGrad" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#93c5fd"/><stop offset="100%" stopColor={C.blue}/></linearGradient></defs>
      {[100,120,140,160,180,200,220].map(cm=>{
        const y=svgH*(1-cm/maxH), maj=cm%20===0;
        return <g key={cm}><line x1={rulerX-(maj?10:5)} y1={y} x2={rulerX} y2={y} stroke={maj?"#94a3b8":"#cbd5e1"} strokeWidth={maj?1.5:1}/>
          {maj&&<text x={rulerX-14} y={y+4} textAnchor="end" fontSize={11} fill="#94a3b8">{cm}</text>}</g>;
      })}
      <circle cx={rulerX-38} cy={headY} r={18} fill={phase==="done"?"#bfdbfe":"#e2e8f0"} opacity={.85}/>
      <rect x={rulerX-50} y={headY+18} width={24} height={svgH*.28} rx={6} fill={phase==="done"?"#bfdbfe":"#e2e8f0"} opacity={.85}/>
      <rect x={rulerX-50} y={headY+18+svgH*.28-4} width={10} height={svgH*.32} rx={4} fill={phase==="done"?"#bfdbfe":"#e2e8f0"} opacity={.85}/>
      <rect x={rulerX-38} y={headY+18+svgH*.28-4} width={10} height={svgH*.32} rx={4} fill={phase==="done"?"#bfdbfe":"#e2e8f0"} opacity={.85}/>
      {phase==="measuring"&&<g>
        <line x1={rulerX-70} y1={beamY} x2={rulerX+rulerW+10} y2={beamY} stroke="#2563eb" strokeWidth={2.5} strokeOpacity={.75} style={{filter:"drop-shadow(0 0 4px #2563eb)"}}/>
        <circle cx={rulerX-70} cy={beamY} r={4} fill={C.blue} opacity={.6}/>
      </g>}
      {phase==="done"&&<g>
        <line x1={rulerX+rulerW+12} y1={headY} x2={rulerX+rulerW+12} y2={svgH} stroke={C.green} strokeWidth={2}/>
        <line x1={rulerX+rulerW+8} y1={headY} x2={rulerX+rulerW+16} y2={headY} stroke={C.green} strokeWidth={2}/>
        <line x1={rulerX+rulerW+8} y1={svgH} x2={rulerX+rulerW+16} y2={svgH} stroke={C.green} strokeWidth={2}/>
        <rect x={rulerX+rulerW+18} y={svgH/2+headY/2-16} width={64} height={32} rx={8} fill={C.green}/>
        <text x={rulerX+rulerW+50} y={svgH/2+headY/2+6} textAnchor="middle" fontSize={16} fontWeight="700" fill="white">{animH} cm</text>
      </g>}
    </svg>
  );

  const WGcx=100,WGcy=100,WGr=72,WG_START=150,WG_SWEEP=240,WG_MAX=150;
  const wAngle=WG_START+(animW/WG_MAX)*WG_SWEEP;
  const dotRad=d=>(d-90)*Math.PI/180;
  const dotX=WGcx+WGr*Math.cos(dotRad(wAngle)), dotY=WGcy+WGr*Math.sin(dotRad(wAngle));

  const WeightGauge=()=>(
    <svg width={200} height={180} viewBox="0 0 200 180">
      {[0,30,60,90,120,150].map(kg=>{
        const a=WG_START+(kg/WG_MAX)*WG_SWEEP, r1=WGr+8, r2=WGr+16, ra=(a-90)*Math.PI/180;
        const x1=WGcx+r1*Math.cos(ra),y1=WGcy+r1*Math.sin(ra),x2=WGcx+r2*Math.cos(ra),y2=WGcy+r2*Math.sin(ra);
        const tx=WGcx+(r2+10)*Math.cos(ra),ty=WGcy+(r2+10)*Math.sin(ra);
        return <g key={kg}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth={1.5}/><text x={tx} y={ty+4} textAnchor="middle" fontSize={10} fill="#94a3b8">{kg}</text></g>;
      })}
      <path d={arcPath(WGcx,WGcy,WGr,WG_START,WG_START+WG_SWEEP)} fill="none" stroke="#e2e8f0" strokeWidth={14} strokeLinecap="round"/>
      {animW>0&&<path d={arcPath(WGcx,WGcy,WGr,WG_START,wAngle)} fill="none" stroke={phase==="done"?C.blue:"#60a5fa"} strokeWidth={14} strokeLinecap="round"/>}
      {animW>0&&<circle cx={dotX} cy={dotY} r={9} fill={phase==="done"?C.blue:"#93c5fd"} stroke="white" strokeWidth={2}/>}
      <rect x={70} y={148} width={60} height={8} rx={4} fill="#e2e8f0"/>
      <rect x={80} y={140} width={40} height={10} rx={3} fill="#f1f5f9" stroke={C.border} strokeWidth={1}/>
      <text x={WGcx} y={WGcy-8} textAnchor="middle" fontSize={30} fontWeight="800" fill={phase==="done"?C.blue:"#93c5fd"}>{animW.toFixed(1)}</text>
      <text x={WGcx} y={WGcy+16} textAnchor="middle" fontSize={14} fill={C.slate}>kg</text>
    </svg>
  );

  const Stepper=({label,unit,value,onChange,step})=>(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
      <div style={{fontSize:13,fontWeight:600,color:C.slate,textTransform:"uppercase"}}>{label}</div>
      <div style={{display:"flex",alignItems:"center",border:`2px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
        <button onClick={()=>onChange(v=>String(Math.max(0,parseFloat(v)-step)))} style={{width:44,height:48,border:"none",background:C.bg,fontSize:22,cursor:"pointer",color:C.blue,fontWeight:700}}>−</button>
        <input type="number" value={value} onChange={e=>onChange(()=>e.target.value)} style={{width:80,height:48,border:"none",textAlign:"center",fontSize:20,fontWeight:700,color:C.text,outline:"none"}}/>
        <button onClick={()=>onChange(v=>String(parseFloat(v)+step))} style={{width:44,height:48,border:"none",background:C.bg,fontSize:22,cursor:"pointer",color:C.blue,fontWeight:700}}>+</button>
      </div>
      <div style={{fontSize:14,color:C.slate}}>{unit}</div>
    </div>
  );

  return (
    <Card>
      <style>{`@keyframes fadeSlideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28}}>
        <div style={{width:48,height:48,borderRadius:12,background:"#ede9fe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>📐</div>
        <div>
          <h2 style={{margin:0,fontSize:24,fontWeight:700}}>Height &amp; Weight Measurement</h2>
          <p style={{margin:0,color:C.slate,fontSize:14}}>{phase==="measuring"?"Please stand upright on the platform — booth sensors are measuring…":"Measurement complete — please confirm your readings below"}</p>
        </div>
        {phase==="done"&&!adjusting&&<Tag label="✓ Measured" color={C.green} bg={C.greenLight}/>}
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:60,marginBottom:32,alignItems:"flex-start"}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
          <div style={{fontSize:12,fontWeight:700,color:C.slate,textTransform:"uppercase",letterSpacing:.5}}>Height</div>
          <HeightViz/>
          {phase==="measuring"&&<div style={{fontSize:18,fontWeight:700,color:C.blue}}>{animH} cm</div>}
        </div>
        <div style={{width:1,alignSelf:"stretch",background:C.border,marginTop:24}}/>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
          <div style={{fontSize:12,fontWeight:700,color:C.slate,textTransform:"uppercase",letterSpacing:.5}}>Weight</div>
          <WeightGauge/>
          {phase==="measuring"&&<div style={{fontSize:13,color:C.slate}}>Calculating…</div>}
        </div>
      </div>
      {phase==="done"&&<div style={{animation:"fadeSlideIn .4s ease"}}>
        {!adjusting&&<div style={{display:"flex",gap:16,justifyContent:"center",marginBottom:28}}>
          <div style={{background:C.blueLight,borderRadius:14,padding:"18px 32px",textAlign:"center",minWidth:140}}>
            <div style={{fontSize:13,fontWeight:600,color:"#1e40af",textTransform:"uppercase"}}>Height</div>
            <div style={{fontSize:36,fontWeight:800,color:C.blue,marginTop:4}}>{editH}</div>
            <div style={{fontSize:14,color:"#1e40af"}}>cm</div>
          </div>
          <div style={{background:C.blueLight,borderRadius:14,padding:"18px 32px",textAlign:"center",minWidth:140}}>
            <div style={{fontSize:13,fontWeight:600,color:"#1e40af",textTransform:"uppercase"}}>Weight</div>
            <div style={{fontSize:36,fontWeight:800,color:C.blue,marginTop:4}}>{editW}</div>
            <div style={{fontSize:14,color:"#1e40af"}}>kg</div>
          </div>
        </div>}
        {adjusting&&<div style={{display:"flex",gap:48,justifyContent:"center",marginBottom:28,padding:"24px 0",background:C.bg,borderRadius:14}}>
          <Stepper label="Height" unit="cm" value={editH} onChange={setEditH} step={1}/>
          <Stepper label="Weight" unit="kg" value={editW} onChange={setEditW} step={0.5}/>
        </div>}
        <div style={{display:"flex",justifyContent:"center",gap:14}}>
          {!adjusting?<>
            <Btn variant="outline" onClick={()=>setAdjusting(true)}>✏️ Adjust</Btn>
            <Btn variant="success" onClick={()=>onComplete({height:editH,weight:editW})}>Confirm &amp; Continue →</Btn>
          </>:<>
            <Btn variant="ghost" onClick={()=>setAdjusting(false)}>Cancel</Btn>
            <Btn onClick={()=>setAdjusting(false)}>Save Adjustments</Btn>
          </>}
        </div>
      </div>}
    </Card>
  );
}

// ─── Step 5 — Confirm Details ─────────────────────────────────────────────────

function CheckIn({ patient, setPatient, onNext }) {
  const field=(label,key,type="text",opts=null)=>(
    <div style={{flex:1,minWidth:180}}>
      <label style={{display:"block",fontSize:13,fontWeight:600,color:C.slate,marginBottom:6}}>{label}</label>
      {opts?<select value={patient[key]} onChange={e=>setPatient(p=>({...p,[key]:e.target.value}))} style={inputStyle}>
        {opts.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>:<input type={type} value={patient[key]} onChange={e=>setPatient(p=>({...p,[key]:e.target.value}))} style={inputStyle}/>}
    </div>
  );
  const valid=patient.name&&patient.age&&patient.height&&patient.weight;
  return (
    <Card>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:32}}>
        <div style={{width:48,height:48,borderRadius:12,background:C.blueLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>👤</div>
        <div>
          <h2 style={{margin:0,fontSize:24,fontWeight:700}}>Confirm Your Details</h2>
          <p style={{margin:0,color:C.slate,fontSize:14}}>Please check all details are correct before starting the test</p>
        </div>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:20,marginBottom:28}}>
        {field("Full Name","name")}
        {field("Age (years)","age","number")}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:20,marginBottom:36}}>
        {field("Height (cm)","height","number")}
        {field("Weight (kg)","weight","number")}
        {field("Biological Sex","sex","select",[{value:"male",label:"Male"},{value:"female",label:"Female"}])}
      </div>
      <div style={{padding:"16px 20px",background:C.blueLight,borderRadius:10,marginBottom:32,fontSize:14,color:"#1e40af"}}>
        ℹ️ Predicted values use the <strong>GLI-2012</strong> reference equations based on your age, height, and biological sex.
      </div>
      <div style={{display:"flex",justifyContent:"flex-end"}}>
        <Btn onClick={onNext} disabled={!valid}>Continue →</Btn>
      </div>
    </Card>
  );
}

// ─── Step 6 — Prepare (3-step wizard) ────────────────────────────────────────

function PrepareScreen({ onNext }) {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState("waiting"); // waiting | detecting | confirmed

  const prepSteps = [
    {
      icon:"🧴", title:"Clean your hands",
      desc:"Use the hand sanitiser dispenser on your left. Rub your hands together until dry — this takes about 20 seconds.",
      waitLabel:"Please use the sanitiser now", detectLabel:"Detecting hand sanitiser use…", doneLabel:"Hands sanitised ✓",
      autoAfter:3500,
    },
    {
      icon:"👃", title:"Attach the nose clip",
      desc:"Take a nose clip from the dispenser. Gently pinch it over the soft part of your nose so no air can escape through your nostrils.",
      waitLabel:"Place the nose clip on your nose", detectLabel:"Camera confirming nose clip position…", doneLabel:"Nose clip correctly fitted ✓",
      autoAfter:3000,
    },
    {
      icon:"🎤", title:"Take your mouthpiece",
      desc:"Take a fresh mouthpiece from the blue dispenser on your right. Insert it firmly into the tube — you should hear a click.",
      waitLabel:"Insert the mouthpiece into the tube", detectLabel:"Camera verifying mouthpiece placement…", doneLabel:"Mouthpiece correctly inserted ✓",
      autoAfter:3200,
    },
  ];

  useEffect(()=>{
    setPhase("waiting");
    const t1=setTimeout(()=>setPhase("detecting"),1500);
    return ()=>clearTimeout(t1);
  },[step]);

  useEffect(()=>{
    if(phase!=="detecting") return;
    const curr=prepSteps[step];
    const t=setTimeout(()=>setPhase("confirmed"),curr.autoAfter);
    return ()=>clearTimeout(t);
  },[phase,step]);

  const curr=prepSteps[step];
  const isLast=step===prepSteps.length-1;

  return (
    <Card>
      <style>{`
        @keyframes prep_scan{0%{top:10px}50%{top:calc(100% - 14px)}100%{top:10px}}
        @keyframes prep_glow{0%,100%{box-shadow:0 0 0 3px rgba(37,99,235,.15)}50%{box-shadow:0 0 0 8px rgba(37,99,235,.28)}}
        @keyframes prep_pop{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
      `}</style>

      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <div style={{width:48,height:48,borderRadius:12,background:"#fef3c7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🧪</div>
        <div>
          <h2 style={{margin:0,fontSize:24,fontWeight:700}}>Get Ready for the Test</h2>
          <p style={{margin:0,color:C.slate,fontSize:14}}>Step {step+1} of {prepSteps.length}</p>
        </div>
      </div>

      {/* Step progress dots */}
      <div style={{display:"flex",gap:8,marginBottom:28}}>
        {prepSteps.map((_,i)=>(
          <div key={i} style={{flex:1,height:6,borderRadius:3,background:i<step?C.green:i===step?C.blue:C.border,transition:"background .3s"}}/>
        ))}
      </div>

      {/* Main panel */}
      <div style={{display:"flex",gap:24,marginBottom:28}}>
        {/* Camera / detection box */}
        <div style={{flex:1,position:"relative",height:220,borderRadius:16,overflow:"hidden",
          background:phase==="confirmed"?C.greenLight:"#f8fafc",
          border:`2px solid ${phase==="confirmed"?C.green:phase==="detecting"?C.blue:C.border}`,
          transition:"all .4s",animation:phase==="detecting"?"prep_glow 1.1s ease-in-out infinite":"none"}}>
          {phase==="detecting"&&<div style={{position:"absolute",left:0,right:0,height:4,background:"linear-gradient(90deg,transparent,rgba(37,99,235,.7),#2563eb,rgba(37,99,235,.7),transparent)",animation:"prep_scan 1.1s ease-in-out infinite",boxShadow:"0 0 8px rgba(37,99,235,.5)"}}/>}
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",flexDirection:"column",gap:12}}>
            <div style={{fontSize:56,filter:phase==="confirmed"?"none":"grayscale(40%)",transition:"filter .3s"}}>{curr.icon}</div>
            <div style={{fontSize:14,color:phase==="confirmed"?C.green:C.slate,fontWeight:phase==="confirmed"?700:400,transition:"color .3s",textAlign:"center",padding:"0 16px"}}>
              {phase==="waiting"&&curr.waitLabel}
              {phase==="detecting"&&<><span style={{color:C.blue}}>📡 </span>{curr.detectLabel}</>}
              {phase==="confirmed"&&<span style={{animation:"prep_pop .4s cubic-bezier(.34,1.56,.64,1)"}}>{curr.doneLabel}</span>}
            </div>
            {phase==="confirmed"&&<div style={{width:48,height:48,borderRadius:"50%",background:C.green,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:24,animation:"prep_pop .4s cubic-bezier(.34,1.56,.64,1)"}}>✓</div>}
          </div>
        </div>

        {/* Instruction panel */}
        <div style={{width:280,display:"flex",flexDirection:"column",gap:16}}>
          <div style={{fontSize:22,fontWeight:700,color:C.text}}>{curr.title}</div>
          <div style={{fontSize:15,color:C.slate,lineHeight:1.7}}>{curr.desc}</div>
          {step===0&&<div style={{padding:"12px 16px",background:"#fffbeb",borderRadius:10,fontSize:13,color:"#92400e"}}>
            🧴 Sanitiser is available on your left side.
          </div>}
          {step===1&&<div style={{padding:"12px 16px",background:C.blueLight,borderRadius:10,fontSize:13,color:"#1e40af"}}>
            👃 The nose clip prevents air escaping through your nose during the test.
          </div>}
          {step===2&&<div style={{padding:"12px 16px",background:"#fffbeb",borderRadius:10,fontSize:13,color:"#92400e"}}>
            ⚠️ Always use a <strong>fresh</strong> mouthpiece. Never reuse one.
          </div>}
        </div>
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <Btn variant="ghost" onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0}>← Back</Btn>
        {isLast
          ? <Btn variant="success" disabled={phase!=="confirmed"} onClick={onNext}>I'm Ready — Start Instructions →</Btn>
          : <Btn disabled={phase!=="confirmed"} onClick={()=>setStep(s=>s+1)}>Next Step →</Btn>
        }
      </div>
    </Card>
  );
}

// ─── Instruction animations (kept from original) ──────────────────────────────

const PostureAnim = () => (
  <svg viewBox="0 0 320 290" width="100%" height="100%">
    <style>{`
      @keyframes pa_body{0%,40%{transform:rotate(-8deg) translateY(6px)}65%,100%{transform:rotate(0deg) translateY(0)}}
      @keyframes pa_arrow{0%,100%{opacity:.3;transform:translateY(10px)}65%{opacity:1;transform:translateY(0)}}
      @keyframes pa_check{0%,50%{opacity:0;transform:scale(.5)}70%,100%{opacity:1;transform:scale(1)}}
    `}</style>
    <rect x={108} y={190} width={104} height={12} rx={5} fill="#334155"/>
    <rect x={200} y={122} width={12} height={80} rx={4} fill="#334155"/>
    <rect x={114} y={202} width={9} height={68} rx={3} fill="#334155"/>
    <rect x={197} y={202} width={9} height={68} rx={3} fill="#334155"/>
    <g style={{transformOrigin:"160px 188px",animation:"pa_body 3s ease-in-out infinite"}}>
      <circle cx={160} cy={92} r={30} fill="#64748b"/>
      <rect x={138} y={122} width={44} height={12} rx={5} fill="#64748b"/>
      <rect x={126} y={132} width={68} height={58} rx={10} fill="#475569"/>
    </g>
    <rect x={126} y={175} width={28} height={20} rx={7} fill="#475569"/>
    <rect x={163} y={175} width={28} height={20} rx={7} fill="#475569"/>
    <g style={{animation:"pa_arrow 3s ease-in-out infinite"}}>
      <text x={268} y={100} textAnchor="middle" fontSize={38} fill="#a78bfa">↑</text>
      <text x={268} y={126} textAnchor="middle" fontSize={11} fill="#a78bfa" fontWeight="700" letterSpacing="1">UPRIGHT</text>
    </g>
    <g style={{transformOrigin:"52px 90px",animation:"pa_check 3s ease-in-out infinite"}}>
      <circle cx={52} cy={90} r={24} fill="#22c55e"/>
      <text x={52} y={98} textAnchor="middle" fontSize={22} fill="white">✓</text>
    </g>
    <text x={160} y={278} textAnchor="middle" fontSize={13} fill="#475569" fontWeight="600" letterSpacing="2">BACK STRAIGHT · FEET FLAT</text>
  </svg>
);

const InhaleAnim = () => (
  <svg viewBox="0 0 320 290" width="100%" height="100%">
    <style>{`
      @keyframes ia_lung{0%,30%{rx:46;ry:64;opacity:.5}65%,100%{rx:60;ry:78;opacity:.85}}
      @keyframes ia_drop{0%{opacity:0;transform:translateY(-28px)}40%{opacity:1;transform:translateY(0)}80%,100%{opacity:0;transform:translateY(12px)}}
    `}</style>
    <ellipse cx={118} cy={164} rx={46} ry={64} fill="#0284c7" style={{transformOrigin:"118px 164px",animation:"ia_lung 2.4s ease-in-out infinite"}}/>
    <ellipse cx={202} cy={164} rx={46} ry={64} fill="#0284c7" style={{transformOrigin:"202px 164px",animation:"ia_lung 2.4s ease-in-out infinite"}}/>
    <rect x={152} y={66} width={16} height={54} rx={8} fill="#0369a1"/>
    <rect x={140} y={56} width={40} height={18} rx={9} fill="#0369a1"/>
    {[78,160,242].map((x,i)=>(
      <g key={i} style={{animation:`ia_drop 2.4s ${i*0.32}s ease-in-out infinite`}}>
        <line x1={x} y1={18} x2={x} y2={48} stroke="#38bdf8" strokeWidth={3} strokeLinecap="round"/>
        <polygon points={`${x},56 ${x-7},42 ${x+7},42`} fill="#38bdf8"/>
      </g>
    ))}
    <text x={160} y={264} textAnchor="middle" fontSize={22} fill="#38bdf8" fontWeight="900" letterSpacing="4">INHALE FULLY</text>
    <text x={160} y={282} textAnchor="middle" fontSize={12} fill="#475569">Fill lungs completely before the mouthpiece</text>
  </svg>
);

const BlowAnim = () => (
  <svg viewBox="0 0 320 290" width="100%" height="100%">
    <style>{`
      @keyframes ba_ring{0%{r:24;opacity:.9;stroke-width:4}100%{r:112;opacity:0;stroke-width:1}}
      @keyframes ba_center{0%,100%{transform:scale(1)}50%{transform:scale(1.14)}}
      @keyframes ba_streak{0%{opacity:0;transform:translateX(-28px)}40%{opacity:1;transform:translateX(0)}100%{opacity:0;transform:translateX(28px)}}
    `}</style>
    {[0,0.45,0.9].map((d,i)=>(
      <circle key={i} cx={160} cy={136} r={24} fill="none" stroke="#f59e0b" style={{animation:`ba_ring 1.4s ${d}s ease-out infinite`}}/>
    ))}
    <circle cx={160} cy={136} r={32} fill="#f59e0b" style={{transformOrigin:"160px 136px",animation:"ba_center 1.4s ease-in-out infinite"}}/>
    <text x={160} y={144} textAnchor="middle" fontSize={26} fill="#1c1917">💨</text>
    {[[-80,106],[-80,126],[-80,146],[-80,166],[80,106],[80,126],[80,146],[80,166]].map(([ox,y],i)=>(
      <g key={i} style={{animation:`ba_streak 1.4s ${i*0.12}s ease-in-out infinite`}}>
        <line x1={160+ox*0.35} y1={y} x2={160+ox} y2={y} stroke="#fbbf24" strokeWidth={2.5} strokeLinecap="round" opacity={0.7}/>
      </g>
    ))}
    <text x={160} y={248} textAnchor="middle" fontSize={26} fill="#fbbf24" fontWeight="900" letterSpacing="3">BLAST OUT!</text>
    <text x={160} y={270} textAnchor="middle" fontSize={12} fill="#475569">Hard and fast — maximum force</text>
  </svg>
);

function TimerAnim() {
  const [elapsed,setElapsed]=useState(0);
  const r=80,cx=160,cy=136,circ=2*Math.PI*r;
  useEffect(()=>{
    let e=0;
    const iv=setInterval(()=>{e+=0.05;if(e>6.5)e=0;setElapsed(e);},50);
    return ()=>clearInterval(iv);
  },[]);
  const pct=Math.min(elapsed/6,1);
  const color=pct<0.5?"#22c55e":pct<0.83?"#eab308":"#f97316";
  return (
    <svg viewBox="0 0 320 290" width="100%" height="100%">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={18}/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={18} strokeLinecap="round"
        strokeDasharray={`${pct*circ} ${circ}`} style={{transform:"rotate(-90deg)",transformOrigin:`${cx}px ${cy}px`,transition:"stroke .3s"}}/>
      <circle cx={cx} cy={cy} r={r-22} fill={color} opacity={0.07}/>
      <text x={cx} y={cy-6} textAnchor="middle" fontSize={42} fontWeight="800" fill={color}>{Math.min(elapsed,6).toFixed(1)}</text>
      <text x={cx} y={cy+22} textAnchor="middle" fontSize={15} fill="#475569">/ 6.0 sec</text>
      {[0,1,2,3,4,5,6].map(s=>{
        const a=(s/6)*360-90,ra=a*Math.PI/180;
        return <line key={s} x1={cx+(r+5)*Math.cos(ra)} y1={cy+(r+5)*Math.sin(ra)} x2={cx+(r+14)*Math.cos(ra)} y2={cy+(r+14)*Math.sin(ra)} stroke="#334155" strokeWidth={s===0||s===6?2.5:1.5}/>;
      })}
      <text x={cx} y={258} textAnchor="middle" fontSize={16} fill="#4ade80" fontWeight="800" letterSpacing="2">KEEP BLOWING!</text>
      <text x={cx} y={278} textAnchor="middle" fontSize={12} fill="#475569">Push every last bit of air out</text>
    </svg>
  );
}

// ─── Step 7 — Instructions ────────────────────────────────────────────────────

function Instructions({ onNext }) {
  const [current,setCurrent]=useState(0);
  const [barPct,setBarPct]=useState(0);
  const timerRef=useRef(null);
  const ISTEPS=[
    {icon:"🪑",color:"#a78bfa",title:"Sit upright",body:"Sit with your back straight and feet flat on the floor. Loosen any tight clothing around your chest.",Anim:PostureAnim},
    {icon:"🫁",color:"#38bdf8",title:"Take the deepest breath possible",body:"When prompted, breathe in as deeply as you can — completely fill your lungs before placing the mouthpiece.",Anim:InhaleAnim},
    {icon:"💨",color:"#fbbf24",title:"Blast the air out — hard and fast",body:"Place the mouthpiece firmly between your lips and exhale with maximum force as quickly as you can.",Anim:BlowAnim},
    {icon:"⏱️",color:"#4ade80",title:"Keep blowing for 6 full seconds",body:"Even when it feels like there is no air left — keep pushing until the timer completes 6 seconds.",Anim:TimerAnim},
  ];
  const DURATION=6000;
  useEffect(()=>{
    setBarPct(0);
    const TICK=50,total=DURATION/TICK;
    let t=0;
    timerRef.current=setInterval(()=>{
      t++;setBarPct((t/total)*100);
      if(t>=total){clearInterval(timerRef.current);if(current<ISTEPS.length-1)setCurrent(c=>c+1);}
    },TICK);
    return ()=>clearInterval(timerRef.current);
  },[current]);
  const step=ISTEPS[current],isLast=current===ISTEPS.length-1;
  const advance=()=>{clearInterval(timerRef.current);if(!isLast)setCurrent(c=>c+1);};
  const back=()=>{clearInterval(timerRef.current);if(current>0)setCurrent(c=>c-1);};
  return (
    <Card style={{padding:0,overflow:"hidden"}}>
      <div style={{padding:"24px 32px 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:48,height:48,borderRadius:12,background:"#ede9fe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>📋</div>
          <div>
            <h2 style={{margin:0,fontSize:24,fontWeight:700}}>How to do the test</h2>
            <p style={{margin:0,color:C.slate,fontSize:14}}>Step {current+1} of {ISTEPS.length}</p>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {ISTEPS.map((_,i)=>(
            <div key={i} onClick={()=>{clearInterval(timerRef.current);setCurrent(i);}}
              style={{width:i===current?28:10,height:10,borderRadius:6,background:i<current?C.green:i===current?step.color:C.border,cursor:"pointer",transition:"all .25s"}}/>
          ))}
        </div>
      </div>
      <div style={{margin:"20px 32px 0",background:"#0f172a",borderRadius:16,height:290,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:12,left:12,background:step.color,borderRadius:20,padding:"4px 14px",fontSize:13,fontWeight:700,color:"#0f172a",zIndex:1}}>
          {step.icon} {current+1}/{ISTEPS.length}
        </div>
        <step.Anim key={current}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:5,background:"rgba(255,255,255,.08)"}}>
          <div style={{height:"100%",background:step.color,width:`${barPct}%`,transition:"width .05s linear",borderRadius:2}}/>
        </div>
      </div>
      <div style={{padding:"20px 32px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{fontSize:21,fontWeight:700,marginBottom:6}}>{step.title}</div>
        <div style={{color:C.slate,fontSize:15,lineHeight:1.6}}>{step.body}</div>
      </div>
      <div style={{padding:"12px 32px",background:"#fffbeb",borderBottom:`1px solid ${C.border}`,fontSize:13,color:"#92400e"}}>
        ⚠️ The test may cause brief dizziness. Stop immediately and notify the booth attendant if you feel unwell.
      </div>
      <div style={{padding:"20px 32px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <Btn variant="ghost" onClick={back} disabled={current===0}>← Previous</Btn>
        <button onClick={onNext} style={{background:"none",border:"none",color:C.slate,fontSize:13,cursor:"pointer",textDecoration:"underline",padding:0}}>Skip to test</button>
        {isLast?<Btn variant="success" onClick={onNext} style={{fontSize:17,padding:"14px 40px"}}>Continue →</Btn>:<Btn onClick={advance}>Next →</Btn>}
      </div>
    </Card>
  );
}

// ─── Step 8 — Test (3 attempts) ───────────────────────────────────────────────

const ATTEMPT_CURVES = [FULL_CURVE, CURVE_2, CURVE_3];
const ATTEMPT_LABELS = ["Excellent","Good","Acceptable"];
const ATTEMPT_COLORS = [C.blue, "#7c3aed", "#059669"];

function TestScreen({ testPhase, countdown, curveData, attempts, currentAttempt, onStart, onRetry, onAccept }) {
  const volumePct = curveData.length ? Math.round((curveData[curveData.length-1].volume/3.82)*100) : 0;
  const allDone = attempts.length >= 3;

  return (
    <Card>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <div style={{width:48,height:48,borderRadius:12,background:"#dcfce7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🫁</div>
        <div>
          <h2 style={{margin:0,fontSize:24,fontWeight:700}}>Spirometry Test</h2>
          <p style={{margin:0,color:C.slate,fontSize:14}}>You need to complete 3 attempts. Take a full breath between each one.</p>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          {[0,1,2].map(i=>(
            <div key={i} style={{width:36,height:36,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
              background:i<attempts.length?C.green:i===attempts.length&&testPhase==="done"?C.blue:C.bg,
              border:`2px solid ${i<attempts.length?C.green:i===attempts.length?C.blue:C.border}`,
              color:i<attempts.length?"#fff":i===attempts.length?C.blue:C.slate,
              fontWeight:700,fontSize:14,transition:"all .3s"}}>
              {i<attempts.length?"✓":i+1}
            </div>
          ))}
        </div>
      </div>

      {/* Graph */}
      <div style={{height:240,marginBottom:16}}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={testPhase==="done"?ATTEMPT_CURVES[attempts.length<3?attempts.length:2]:curveData} margin={{top:8,right:8,left:0,bottom:0}}>
            <defs>
              {ATTEMPT_COLORS.map((col,i)=>(
                <linearGradient key={i} id={`g${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={col} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={col} stopOpacity={0.02}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
            <XAxis dataKey="volume" type="number" domain={[0,4.2]} tickCount={8} label={{value:"Volume (L)",position:"insideBottom",offset:-2,fontSize:12,fill:C.slate}}/>
            <YAxis domain={[0,9]} tickCount={6} label={{value:"Flow (L/s)",angle:-90,position:"insideLeft",offset:10,fontSize:12,fill:C.slate}}/>
            <Tooltip formatter={(v,n)=>[v,n==="flow"?"Flow (L/s)":"Vol (L)"]} labelFormatter={v=>`Volume: ${v} L`}/>
            {/* Previous attempts in grey */}
            {attempts.map((a,i)=>(
              <Area key={i} type="monotone" data={ATTEMPT_CURVES[i]} dataKey="flow" stroke={ATTEMPT_COLORS[i]} strokeWidth={1.5}
                fill={`url(#g${i})`} dot={false} isAnimationActive={false} strokeOpacity={0.5}/>
            ))}
            {/* Current attempt */}
            <Area type="monotone" dataKey="flow" stroke={ATTEMPT_COLORS[Math.min(attempts.length,2)]}
              strokeWidth={2.5} fill={`url(#g${Math.min(attempts.length,2)})`} dot={false} isAnimationActive={false}/>
            <ReferenceLine x={0.12} stroke={C.yellow} strokeDasharray="4 3" label={{value:"PEF",position:"top",fontSize:11,fill:C.yellow}}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend for completed attempts */}
      {attempts.length>0&&<div style={{display:"flex",gap:12,marginBottom:16}}>
        {attempts.map((a,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:C.slate}}>
            <div style={{width:24,height:3,background:ATTEMPT_COLORS[i],borderRadius:2}}/>
            <span>Attempt {i+1}: <strong style={{color:ATTEMPT_COLORS[i]}}>{ATTEMPT_LABELS[i]}</strong></span>
          </div>
        ))}
      </div>}

      {/* Stats during/after blow */}
      {(testPhase==="blow"||testPhase==="done")&&(
        <div style={{display:"flex",gap:12,marginBottom:20}}>
          <div style={{flex:1,background:C.bg,borderRadius:10,padding:"12px 16px"}}>
            <div style={{fontSize:11,color:C.slate,fontWeight:600}}>VOLUME EXHALED</div>
            <div style={{fontSize:26,fontWeight:700,color:C.blue}}>{curveData.length?curveData[curveData.length-1].volume.toFixed(2):"0.00"}<span style={{fontSize:13,fontWeight:400,color:C.slate}}> L</span></div>
            <div style={{marginTop:4,height:5,background:"#e2e8f0",borderRadius:4}}>
              <div style={{height:5,background:C.blue,borderRadius:4,width:`${volumePct}%`,transition:"width .1s"}}/>
            </div>
          </div>
          <div style={{flex:1,background:C.bg,borderRadius:10,padding:"12px 16px"}}>
            <div style={{fontSize:11,color:C.slate,fontWeight:600}}>PEAK FLOW</div>
            <div style={{fontSize:26,fontWeight:700,color:testPhase==="done"?C.green:C.blue}}>7.4<span style={{fontSize:13,fontWeight:400,color:C.slate}}> L/s</span></div>
          </div>
          <div style={{flex:1,background:C.bg,borderRadius:10,padding:"12px 16px"}}>
            <div style={{fontSize:11,color:C.slate,fontWeight:600}}>QUALITY</div>
            <div style={{fontSize:15,fontWeight:700,marginTop:4,color:testPhase==="done"?C.green:C.blue}}>
              {testPhase==="blow"?"🟢 Blowing…":"✅ "+ATTEMPT_LABELS[Math.min(attempts.length,2)]}
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        {testPhase==="ready"&&!allDone&&(
          <div style={{width:"100%",textAlign:"center"}}>
            <p style={{color:C.slate,marginBottom:16}}>
              {attempts.length===0
                ? "Take the deepest breath you can, then press Start."
                : `Good work! Now attempt ${attempts.length+1} of 3. Take a deep breath and press Start.`}
            </p>
            <Btn onClick={onStart} style={{fontSize:18,padding:"16px 48px"}}>▶ Start Attempt {attempts.length+1}</Btn>
          </div>
        )}
        {testPhase==="countdown"&&(
          <div style={{width:"100%",textAlign:"center"}}>
            <div style={{fontSize:80,fontWeight:800,color:C.blue,lineHeight:1}}>{countdown}</div>
            <div style={{fontSize:22,color:C.slate,marginTop:8}}>Get ready to BLOW…</div>
          </div>
        )}
        {testPhase==="blow"&&(
          <div style={{width:"100%",textAlign:"center"}}>
            <div style={{fontSize:28,fontWeight:700,color:C.blue}}>💨 KEEP BLOWING!</div>
            <div style={{color:C.slate,marginTop:4}}>Exhale as hard and fast as possible</div>
          </div>
        )}
        {testPhase==="done"&&!allDone&&(
          <div style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <Btn variant="outline" onClick={onRetry}>↩ Redo This Attempt</Btn>
            <div style={{fontSize:14,color:C.slate}}>Attempt {attempts.length+1} of 3</div>
            <Btn onClick={()=>onAccept("next")}>Next Attempt →</Btn>
          </div>
        )}
        {allDone&&(
          <div style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:15,color:C.green,fontWeight:600}}>✅ All 3 attempts complete!</div>
            <Btn variant="success" onClick={()=>onAccept("done")}>Accept Best Results &amp; Continue →</Btn>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Step 9 — Dispose Mouthpiece ─────────────────────────────────────────────

function DisposeScreen({ onNext }) {
  const [phase,setPhase]=useState("idle");
  useEffect(()=>{const t=setTimeout(()=>setPhase("detecting"),1200);return ()=>clearTimeout(t);},[]);
  useEffect(()=>{
    if(phase!=="detecting")return;
    const t=setTimeout(()=>setPhase("confirmed"),3000);return ()=>clearTimeout(t);
  },[phase]);
  const borderColor=phase==="confirmed"?C.green:phase==="detecting"?C.blue:C.border;
  return (
    <Card>
      <style>{`
        @keyframes dp_scan{0%{top:10px}50%{top:calc(100% - 14px)}100%{top:10px}}
        @keyframes dp_glow{0%,100%{box-shadow:0 0 0 3px rgba(37,99,235,.15)}50%{box-shadow:0 0 0 8px rgba(37,99,235,.28)}}
        @keyframes dp_pop{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
      `}</style>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28}}>
        <div style={{width:48,height:48,borderRadius:12,background:"#dcfce7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🗑️</div>
        <div>
          <h2 style={{margin:0,fontSize:24,fontWeight:700}}>Great job — now dispose of the mouthpiece</h2>
          <p style={{margin:0,color:C.slate,fontSize:14}}>Remove the mouthpiece and nose clip, and place them in the yellow waste bin</p>
        </div>
        {phase==="confirmed"&&<Tag label="✓ Disposed" color={C.green} bg={C.greenLight}/>}
      </div>
      <div style={{display:"flex",gap:24,marginBottom:28}}>
        <div style={{flex:1,position:"relative",height:220,borderRadius:16,overflow:"hidden",
          background:phase==="confirmed"?C.greenLight:"#f8fafc",
          border:`2px solid ${borderColor}`,transition:"all .4s",
          animation:phase==="detecting"?"dp_glow 1.1s ease-in-out infinite":"none"}}>
          {phase==="detecting"&&<div style={{position:"absolute",left:0,right:0,height:4,background:"linear-gradient(90deg,transparent,rgba(37,99,235,.7),#2563eb,rgba(37,99,235,.7),transparent)",animation:"dp_scan 1.1s ease-in-out infinite"}}/>}
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",flexDirection:"column",gap:12}}>
            <div style={{fontSize:56}}>{phase==="confirmed"?"✅":"🗑️"}</div>
            <div style={{fontSize:14,color:phase==="confirmed"?C.green:C.slate,fontWeight:phase==="confirmed"?700:400,textAlign:"center",padding:"0 16px"}}>
              {phase==="idle"&&"Remove mouthpiece and place it in the bin"}
              {phase==="detecting"&&<><span style={{color:C.blue}}>📡 </span>Camera detecting disposal…</>}
              {phase==="confirmed"&&<span style={{animation:"dp_pop .4s cubic-bezier(.34,1.56,.64,1)"}}>Mouthpiece safely disposed ✓</span>}
            </div>
          </div>
        </div>
        <div style={{width:260,display:"flex",flexDirection:"column",gap:14}}>
          {[{label:"Remove the mouthpiece from the tube",done:p=>p!=="idle"},{label:"Remove the nose clip",done:p=>p==="confirmed"},{label:"Drop both into the yellow waste bin",done:p=>p==="confirmed"}].map((s,i)=>(
            <div key={i} style={{display:"flex",gap:12,padding:"14px 16px",borderRadius:12,background:s.done(phase)?C.greenLight:C.bg,border:`1.5px solid ${s.done(phase)?C.green:C.border}`,transition:"all .3s"}}>
              <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,background:s.done(phase)?C.green:C.border,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:13,fontWeight:700}}>
                {s.done(phase)?"✓":i+1}
              </div>
              <span style={{fontSize:13,color:s.done(phase)?C.green:C.text,lineHeight:1.5}}>{s.label}</span>
            </div>
          ))}
          <div style={{padding:"12px 14px",background:"#fef9c3",borderRadius:10,fontSize:12,color:"#92400e"}}>
            🧴 Please sanitise your hands again after disposal.
          </div>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end"}}>
        <Btn variant="success" disabled={phase!=="confirmed"} onClick={onNext}>{phase==="confirmed"?"Continue →":"Waiting for confirmation…"}</Btn>
      </div>
    </Card>
  );
}

// ─── Step 10 — Schedule Next Appointment ─────────────────────────────────────

function ScheduleScreen({ onNext }) {
  const [selectedDate,setSelectedDate]=useState(null);
  const [selectedTime,setSelectedTime]=useState(null);
  const [confirmed,setConfirmed]=useState(false);

  const today=new Date();
  const days=[];
  for(let i=7;i<=90;i+=1){
    const d=new Date(today);
    d.setDate(today.getDate()+i);
    if(d.getDay()!==0&&d.getDay()!==6) days.push(d);
    if(days.length>=14) break;
  }

  const timeSlots=["08:30","09:00","09:30","10:00","10:30","11:00","14:00","14:30","15:00","15:30","16:00","16:30"];
  const unavailable=["09:30","14:30","16:00"];

  const fmt=d=>d.toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"});

  if(confirmed) return (
    <Card style={{textAlign:"center",padding:"60px 40px"}}>
      <div style={{fontSize:72,marginBottom:24}}>📅</div>
      <h2 style={{fontSize:28,fontWeight:800,margin:"0 0 12px"}}>Appointment Confirmed!</h2>
      <p style={{color:C.slate,fontSize:17,margin:"0 0 32px"}}>
        Your next spirometry test is booked for<br/>
        <strong style={{color:C.blue,fontSize:20}}>{fmt(selectedDate)} at {selectedTime}</strong>
      </p>
      <div style={{maxWidth:400,margin:"0 auto 36px",padding:"20px 24px",background:C.blueLight,borderRadius:14,textAlign:"left"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#1e40af",marginBottom:8}}>You'll receive a reminder</div>
        <div style={{fontSize:14,color:"#1e40af",lineHeight:1.6}}>
          📱 SMS reminder 24 hours before your appointment<br/>
          📧 Email confirmation sent to your registered address<br/>
          📋 Your results will be available to your doctor
        </div>
      </div>
      <Btn variant="success" onClick={onNext} style={{fontSize:17,padding:"15px 48px"}}>Continue →</Btn>
    </Card>
  );

  return (
    <Card>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28}}>
        <div style={{width:48,height:48,borderRadius:12,background:"#ede9fe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>📅</div>
        <div>
          <h2 style={{margin:0,fontSize:24,fontWeight:700}}>Schedule Your Next Appointment</h2>
          <p style={{margin:0,color:C.slate,fontSize:14}}>Regular monitoring helps track changes in your lung health over time</p>
        </div>
      </div>

      {/* Date picker */}
      <div style={{marginBottom:24}}>
        <div style={{fontSize:13,fontWeight:700,color:C.slate,textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>Select a date</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {days.map((d,i)=>(
            <button key={i} onClick={()=>{setSelectedDate(d);setSelectedTime(null);}}
              style={{padding:"10px 14px",borderRadius:10,border:`2px solid ${selectedDate&&d.toDateString()===selectedDate.toDateString()?C.blue:C.border}`,
                background:selectedDate&&d.toDateString()===selectedDate.toDateString()?C.blueLight:"transparent",
                color:selectedDate&&d.toDateString()===selectedDate.toDateString()?C.blue:C.text,
                cursor:"pointer",fontSize:13,fontWeight:600,transition:"all .2s",whiteSpace:"nowrap"}}>
              {fmt(d)}
            </button>
          ))}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate&&<div style={{marginBottom:28}}>
        <div style={{fontSize:13,fontWeight:700,color:C.slate,textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>Select a time</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8}}>
          {timeSlots.map(t=>{
            const busy=unavailable.includes(t);
            const sel=selectedTime===t;
            return <button key={t} onClick={()=>!busy&&setSelectedTime(t)}
              style={{padding:"10px 0",borderRadius:8,border:`2px solid ${sel?C.blue:busy?"transparent":C.border}`,
                background:sel?C.blueLight:busy?"#f1f5f9":"transparent",
                color:sel?C.blue:busy?"#cbd5e1":C.text,
                cursor:busy?"not-allowed":"pointer",fontSize:14,fontWeight:600,
                textDecoration:busy?"line-through":"none",transition:"all .2s"}}>
              {t}
            </button>;
          })}
        </div>
      </div>}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <button onClick={onNext} style={{background:"none",border:"none",color:C.slate,fontSize:13,cursor:"pointer",textDecoration:"underline",padding:0}}>
          Skip — I'll schedule later
        </button>
        <Btn disabled={!selectedDate||!selectedTime} onClick={()=>setConfirmed(true)}>Confirm Appointment →</Btn>
      </div>
    </Card>
  );
}

// ─── Step 11 — COPD Education ─────────────────────────────────────────────────

function EducationScreen({ onNext }) {
  const [expanded,setExpanded]=useState(null);
  const sections=[
    {icon:"🫁",title:"What is COPD?",color:"#2563eb",bg:C.blueLight,
      body:"COPD (Chronic Obstructive Pulmonary Disease) is a long-term lung condition that causes breathing difficulties. It includes chronic bronchitis and emphysema. It develops gradually and is usually caused by smoking or long-term exposure to dust and chemicals."},
    {icon:"⚠️",title:"Know the warning signs",color:"#ca8a04",bg:C.yellowLight,
      body:"Persistent cough with mucus, shortness of breath during everyday activities, frequent chest infections, and wheezing are common symptoms. If you notice these in yourself or a family member, see a doctor."},
    {icon:"🚬",title:"Risk factors",color:"#dc2626",bg:C.redLight,
      body:"Smoking is the leading cause. Other risks include secondhand smoke, air pollution, dust and chemical fumes at work, and a family history of lung disease. You can reduce risk by stopping smoking and improving ventilation."},
    {icon:"👨‍👩‍👧",title:"Tell your family",color:"#16a34a",bg:C.greenLight,
      body:"COPD can run in families. Tell your close relatives — especially those who smoke — about your test today. Encourage them to get a spirometry test too. Early detection leads to much better outcomes."},
  ];
  return (
    <Card>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28}}>
        <div style={{width:48,height:48,borderRadius:12,background:"#e0f2fe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>📚</div>
        <div>
          <h2 style={{margin:0,fontSize:24,fontWeight:700}}>Understanding COPD</h2>
          <p style={{margin:0,color:C.slate,fontSize:14}}>Take a moment to read this — then share it with people you care about</p>
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28}}>
        {sections.map((s,i)=>(
          <div key={i} style={{borderRadius:14,border:`1.5px solid ${expanded===i?s.color:C.border}`,overflow:"hidden",transition:"all .25s"}}>
            <div onClick={()=>setExpanded(expanded===i?null:i)}
              style={{display:"flex",alignItems:"center",gap:14,padding:"16px 20px",cursor:"pointer",background:expanded===i?s.bg:"transparent"}}>
              <span style={{fontSize:24}}>{s.icon}</span>
              <span style={{flex:1,fontWeight:700,fontSize:16,color:expanded===i?s.color:C.text}}>{s.title}</span>
              <span style={{fontSize:18,color:C.slate,transition:"transform .2s",display:"inline-block",transform:expanded===i?"rotate(90deg)":"none"}}>›</span>
            </div>
            {expanded===i&&<div style={{padding:"0 20px 18px 58px",fontSize:14,color:C.text,lineHeight:1.7,background:s.bg}}>{s.body}</div>}
          </div>
        ))}
      </div>

      <div style={{padding:"16px 20px",background:"#fef3c7",borderRadius:12,marginBottom:24,fontSize:14,color:"#92400e"}}>
        💡 <strong>Remember:</strong> COPD is manageable when caught early. Your spirometry results have been recorded and your doctor will review them.
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <Btn variant="outline" onClick={()=>alert("Education leaflet download coming soon!")}>⬇ Download Leaflet (PDF)</Btn>
        <Btn variant="success" onClick={onNext}>Continue to Report →</Btn>
      </div>
    </Card>
  );
}

// ─── Step 12 — Report ─────────────────────────────────────────────────────────

function ReportScreen({ patient, results, curveData, onRestart }) {
  const [emailInput,setEmailInput]=useState("");
  const [emailSent,setEmailSent]=useState(false);
  const [printDone,setPrintDone]=useState(false);
  const patternColor=results.pattern==="Normal"?C.green:results.pattern==="Obstructive"?C.yellow:C.red;
  const patternBg=results.pattern==="Normal"?C.greenLight:results.pattern==="Obstructive"?C.yellowLight:C.redLight;

  const MetricCard=({label,value,unit,predicted,pct})=>{
    const col=pct>=80?C.green:pct>=60?C.yellow:C.red;
    const bg=pct>=80?C.greenLight:pct>=60?C.yellowLight:C.redLight;
    return (
      <div style={{background:bg,borderRadius:12,padding:"18px 20px",flex:1,minWidth:130}}>
        <div style={{color:C.slate,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>{label}</div>
        <div style={{marginTop:4,display:"flex",alignItems:"baseline",gap:4}}>
          <span style={{fontSize:28,fontWeight:700,color:col}}>{value}</span>
          <span style={{fontSize:13,color:C.slate}}>{unit}</span>
        </div>
        {predicted&&<div style={{marginTop:2,fontSize:12,color:C.slate}}>Predicted: {predicted} {unit} &nbsp;<span style={{fontWeight:700,color:col}}>{pct}%</span></div>}
      </div>
    );
  };

  return (
    <div>
      {/* Patient summary */}
      <div style={{display:"flex",gap:14,marginBottom:14}}>
        <Card style={{flex:2,padding:24}}>
          <div style={{fontSize:11,fontWeight:600,color:C.slate,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Patient</div>
          <div style={{fontSize:20,fontWeight:700}}>{patient.name}</div>
          <div style={{color:C.slate,fontSize:14,marginTop:2}}>{patient.age} yrs · {patient.height} cm · {patient.weight} kg · {patient.sex==="male"?"Male":"Female"}</div>
          <div style={{marginTop:10,display:"flex",gap:8}}>
            <Tag label={`Pattern: ${results.pattern}`} color={patternColor} bg={patternBg}/>
          </div>
        </Card>
        <Card style={{flex:1,padding:24,textAlign:"center"}}>
          <div style={{fontSize:11,fontWeight:600,color:C.slate,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>AI Confidence</div>
          <div style={{position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center"}}>
            <svg width={90} height={90} style={{transform:"rotate(-90deg)"}}>
              <circle cx={45} cy={45} r={36} fill="none" stroke={C.border} strokeWidth={9}/>
              <circle cx={45} cy={45} r={36} fill="none" stroke={C.green} strokeWidth={9} strokeLinecap="round"
                strokeDasharray={`${(results.confidence/100)*2*Math.PI*36} ${2*Math.PI*36}`}/>
            </svg>
            <div style={{position:"absolute",textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:800,color:C.green}}>{results.confidence}%</div>
            </div>
          </div>
          <div style={{fontSize:12,color:C.slate,marginTop:4}}>
            {new Date().toLocaleDateString("en-GB",{dateStyle:"medium"})}
          </div>
        </Card>
      </div>

      {/* Metrics */}
      <Card style={{padding:24,marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:700,color:C.slate,textTransform:"uppercase",letterSpacing:.5,marginBottom:16}}>Spirometry Results</div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          <MetricCard label="FVC" value={results.fvc} unit="L" predicted={results.fvcPred} pct={results.fvcPct}/>
          <MetricCard label="FEV1" value={results.fev1} unit="L" predicted={results.fev1Pred} pct={results.fev1Pct}/>
          <MetricCard label="FEV1/FVC" value={`${results.fev1Fvc}%`} unit="" pct={results.fev1Fvc>=70?95:50}/>
          <MetricCard label="Peak Flow" value={results.pef} unit="L/s" pct={95}/>
        </div>
      </Card>

      {/* Flow-volume chart */}
      <Card style={{padding:24,marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:700,color:C.slate,textTransform:"uppercase",letterSpacing:.5,marginBottom:16}}>Flow-Volume Curve (Best of 3)</div>
        <div style={{height:200}}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={curveData} margin={{top:8,right:8,left:0,bottom:0}}>
              <defs>
                <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.blue} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={C.blue} stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
              <XAxis dataKey="volume" type="number" domain={[0,4.2]} tickCount={8} label={{value:"Volume (L)",position:"insideBottom",offset:-2,fontSize:11,fill:C.slate}}/>
              <YAxis domain={[0,9]} tickCount={6} label={{value:"Flow (L/s)",angle:-90,position:"insideLeft",offset:10,fontSize:11,fill:C.slate}}/>
              <Tooltip formatter={(v,n)=>[v,n==="flow"?"Flow":"Vol"]} labelFormatter={v=>`Vol: ${v} L`}/>
              <Area type="monotone" dataKey="flow" stroke={C.blue} strokeWidth={2.5} fill="url(#resGrad)" dot={false} isAnimationActive={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* AI interpretation */}
      <Card style={{padding:24,marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <span style={{fontSize:20}}>🤖</span>
          <div style={{fontSize:13,fontWeight:700,color:C.slate,textTransform:"uppercase",letterSpacing:.5}}>AI Clinical Interpretation</div>
        </div>
        <p style={{fontSize:15,lineHeight:1.7,color:C.text,margin:"0 0 16px"}}>{results.interpretation}</p>
        <div style={{padding:"14px 18px",background:C.blueLight,borderRadius:10}}>
          <div style={{fontSize:11,fontWeight:700,color:"#1e40af",marginBottom:6,textTransform:"uppercase"}}>Recommendation</div>
          <p style={{fontSize:14,color:"#1e40af",margin:0,lineHeight:1.6}}>{results.recommendation}</p>
        </div>
      </Card>

      {/* Send report */}
      <Card style={{padding:24,marginBottom:14}}>
        <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:16}}>📤 Receive your report</div>
        <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:260}}>
            {!emailSent?<>
              <div style={{display:"flex",gap:8}}>
                <input type="email" placeholder="Enter your email address" value={emailInput} onChange={e=>setEmailInput(e.target.value)}
                  style={{...inputStyle,flex:1,fontSize:14,padding:"10px 12px"}}/>
                <Btn onClick={()=>emailInput&&setEmailSent(true)} disabled={!emailInput} style={{padding:"10px 20px",fontSize:14}}>Send</Btn>
              </div>
              <div style={{fontSize:12,color:C.slate,marginTop:6}}>We'll email you a full PDF copy of this report.</div>
            </>:<div style={{padding:"12px 16px",background:C.greenLight,borderRadius:8,fontSize:14,color:C.green,fontWeight:600}}>
              ✅ Report sent to {emailInput}
            </div>}
          </div>
          <Btn variant="ghost" onClick={()=>setPrintDone(true)} style={{padding:"10px 24px",fontSize:14}}>
            {printDone?"✅ Sent to Printer":"🖨️ Print Report"}
          </Btn>
        </div>
        <div style={{padding:"12px 16px",background:"#fffbeb",borderRadius:8,fontSize:13,color:"#92400e"}}>
          🩺 Your doctor and healthcare team can already access these results securely through the clinical portal.
        </div>
      </Card>

      {/* Disclaimer */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 4px"}}>
        <p style={{fontSize:12,color:C.slate,margin:0,maxWidth:500,lineHeight:1.5}}>
          ⚕️ This report is generated by an AI system for clinical decision support only. Results must be interpreted by a qualified healthcare professional.
        </p>
        <Btn variant="ghost" onClick={onRestart}>New Patient</Btn>
      </div>
    </div>
  );
}

// ─── AI Analysis (auto screen between Test and Schedule) ──────────────────────

function AnalysisScreen({ progress, stepLabel, stepIdx }) {
  const checks=["Waveform integrity validated","Spirometric parameters extracted","GLI-2012 reference norms applied","Neural network inference complete","Report generated"];
  return (
    <Card style={{textAlign:"center",padding:"60px 40px"}}>
      <style>{`@keyframes pulse{0%,100%{box-shadow:0 0 0 12px ${C.blueLight}}50%{box-shadow:0 0 0 24px ${C.blueLight}}}`}</style>
      <div style={{width:96,height:96,borderRadius:"50%",background:C.blueLight,margin:"0 auto 32px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,animation:"pulse 1.6s ease-in-out infinite"}}>🤖</div>
      <h2 style={{fontSize:26,fontWeight:700,margin:"0 0 8px"}}>AI Analysis in Progress</h2>
      <p style={{color:C.slate,fontSize:15,margin:"0 0 36px"}}>Analysing your best spirometry result — this takes just a moment</p>
      <div style={{maxWidth:480,margin:"0 auto 12px"}}>
        <div style={{height:10,background:C.border,borderRadius:8}}>
          <div style={{height:10,background:`linear-gradient(90deg,${C.blue},#60a5fa)`,borderRadius:8,width:`${progress}%`,transition:"width .15s ease"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:13,color:C.slate}}>
          <span>{stepLabel}</span><span>{Math.round(progress)}%</span>
        </div>
      </div>
      <div style={{maxWidth:380,margin:"28px auto 0",textAlign:"left"}}>
        {checks.map((c,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:i<checks.length-1?`1px solid ${C.border}`:"none"}}>
            <div style={{width:22,height:22,borderRadius:"50%",flexShrink:0,background:i<stepIdx?C.green:i===stepIdx?C.blue:C.border,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:12,fontWeight:700}}>
              {i<stepIdx?"✓":i===stepIdx?"…":""}
            </div>
            <span style={{fontSize:14,color:i<=stepIdx?C.text:C.slate}}>{c}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function SpirometryBooth() {
  const [step,setStep]=useState(0);
  const [analyzing,setAnalyzing]=useState(false);
  const [patient,setPatient]=useState({name:"Matti Virtanen",age:"54",height:"175",weight:"82",sex:"male"});
  const [testPhase,setTestPhase]=useState("ready");
  const [countdown,setCountdown]=useState(3);
  const [curveData,setCurveData]=useState([]);
  const [attempts,setAttempts]=useState([]);
  const [analysisProgress,setAnalysisProgress]=useState(0);
  const [analysisStepIdx,setAnalysisStepIdx]=useState(0);
  const [voiceOn,setVoiceOn]=useState(false);
  const timerRef=useRef(null);

  // Countdown
  useEffect(()=>{
    if(testPhase!=="countdown")return;
    let c=3; setCountdown(c);
    timerRef.current=setInterval(()=>{
      c--; if(c<=0){clearInterval(timerRef.current);setTestPhase("blow");}
      else setCountdown(c);
    },1000);
    return ()=>clearInterval(timerRef.current);
  },[testPhase]);

  // Blow animation
  useEffect(()=>{
    if(testPhase!=="blow")return;
    const curve=ATTEMPT_CURVES[Math.min(attempts.length,2)];
    let i=0; setCurveData([]);
    timerRef.current=setInterval(()=>{
      i++; setCurveData(curve.slice(0,i+1));
      if(i>=curve.length-1){clearInterval(timerRef.current);setTimeout(()=>setTestPhase("done"),300);}
    },25);
    return ()=>clearInterval(timerRef.current);
  },[testPhase]);

  // Analysis
  useEffect(()=>{
    if(!analyzing)return;
    setAnalysisProgress(0); setAnalysisStepIdx(0);
    let p=0;
    const iv=setInterval(()=>{
      p+=1.2; setAnalysisProgress(Math.min(p,100));
      setAnalysisStepIdx(Math.min(Math.floor((p/100)*ANALYSIS_STEPS.length),ANALYSIS_STEPS.length-1));
      if(p>=100){clearInterval(iv);setTimeout(()=>{setAnalyzing(false);setStep(10);},700);}
    },45);
    return ()=>clearInterval(iv);
  },[analyzing]);

  const goToStep=n=>{
    setStep(n);
    if(n===8){setTestPhase("ready");setCurveData([]);setAttempts([]);}
  };

  const handleTestAccept=mode=>{
    if(mode==="next"){
      setAttempts(a=>[...a,{quality:ATTEMPT_LABELS[a.length]}]);
      setTestPhase("ready"); setCurveData([]);
    } else {
      setAttempts(a=>[...a,{quality:ATTEMPT_LABELS[Math.min(a.length,2)]}]);
      goToStep(9);
    }
  };

  // Header
  const header=(
    <div style={{background:C.navy,padding:"12px 28px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{background:C.blue,borderRadius:8,padding:"6px 12px",color:"#fff",fontWeight:800,fontSize:16,letterSpacing:.5}}>SPIRO</div>
        <div style={{color:"#94a3b8",fontSize:13}}>AI Spirometry Booth · Station 03</div>
      </div>
      {/* Step indicators */}
      <div style={{display:"flex",alignItems:"center"}}>
        {STEPS.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
              <div style={{width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                background:i<step?C.green:i===step?C.blue:"#334155",color:"#fff",fontSize:10,fontWeight:700}}>
                {i<step?"✓":i+1}
              </div>
              <div style={{fontSize:9,color:i===step?"#fff":"#64748b",marginTop:2,whiteSpace:"nowrap"}}>{s}</div>
            </div>
            {i<STEPS.length-1&&<div style={{width:24,height:1,background:i<step?C.green:"#334155",margin:"0 2px 12px"}}/>}
          </div>
        ))}
      </div>
      {/* Right controls */}
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <button onClick={()=>setVoiceOn(v=>!v)}
          style={{background:voiceOn?"#1e40af":"#334155",border:"none",borderRadius:8,padding:"6px 12px",color:"#fff",fontSize:12,cursor:"pointer",fontWeight:600}}>
          {voiceOn?"🔊 Voice ON":"🔇 Voice OFF"}
        </button>
        <button onClick={()=>alert("Staff member has been notified and is on the way!")}
          style={{background:C.red,border:"none",borderRadius:8,padding:"8px 14px",color:"#fff",fontSize:13,cursor:"pointer",fontWeight:700,display:"flex",alignItems:"center",gap:6}}>
          🆘 Call for Help
        </button>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Inter',system-ui,sans-serif"}}>
      {header}
      <div style={{maxWidth:960,margin:"32px auto",padding:"0 24px 60px"}}>
        {analyzing&&<AnalysisScreen progress={analysisProgress} stepLabel={ANALYSIS_STEPS[analysisStepIdx]} stepIdx={analysisStepIdx}/>}
        {!analyzing&&<>
          {step===0&&<ScanID onComplete={extracted=>{
            if(extracted) setPatient(p=>({...p,name:extracted.name||p.name,age:extracted.age||p.age,sex:extracted.sex||p.sex}));
            goToStep(1);
          }}/>}
          {step===1&&<WelcomeScreen onNext={()=>goToStep(2)}/>}
          {step===2&&<TestSelection onNext={()=>goToStep(3)}/>}
          {step===3&&<HealthScreening onNext={()=>goToStep(4)}/>}
          {step===4&&<MeasureScreen targetHeight={175} targetWeight={82} onComplete={({height,weight})=>{
            setPatient(p=>({...p,height,weight})); goToStep(5);
          }}/>}
          {step===5&&<CheckIn patient={patient} setPatient={setPatient} onNext={()=>goToStep(6)}/>}
          {step===6&&<PrepareScreen onNext={()=>goToStep(7)}/>}
          {step===7&&<Instructions onNext={()=>goToStep(8)}/>}
          {step===8&&<TestScreen testPhase={testPhase} countdown={countdown} curveData={curveData}
            attempts={attempts} currentAttempt={attempts.length+1}
            onStart={()=>setTestPhase("countdown")}
            onRetry={()=>{setTestPhase("ready");setCurveData([]);}}
            onAccept={handleTestAccept}/>}
          {step===9&&<DisposeScreen onNext={()=>setAnalyzing(true)}/>}
          {step===10&&<ScheduleScreen onNext={()=>goToStep(11)}/>}
          {step===11&&<EducationScreen onNext={()=>goToStep(12)}/>}
          {step===12&&<ReportScreen patient={patient} results={MOCK_RESULTS} curveData={FULL_CURVE} onRestart={()=>goToStep(0)}/>}
        </>}
      </div>
    </div>
  );
}
