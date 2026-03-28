import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, ReferenceLine,
} from "recharts";

// ─── Data helpers ───────────────────────────────────────────────────────────

const generateFlowVolumeCurve = (fvc = 3.82, pef = 7.4, peakV = 0.12) => {
  const pts = [];
  const steps = Math.ceil(fvc / 0.05);
  for (let i = 0; i <= steps; i++) {
    const v = parseFloat((i * 0.05).toFixed(2));
    let flow;
    if (v <= peakV) {
      flow = (v / peakV) * pef;
    } else if (v <= fvc) {
      flow = pef * (fvc - v) / (fvc - peakV);
    } else {
      flow = 0;
    }
    pts.push({ volume: v, flow: Math.max(0, parseFloat(flow.toFixed(2))) });
  }
  return pts;
};

const FULL_CURVE = generateFlowVolumeCurve();

const MOCK_RESULTS = {
  fvc: 3.82, fvcPred: 4.10, fvcPct: 93,
  fev1: 2.91, fev1Pred: 3.20, fev1Pct: 91,
  fev1Fvc: 76, pef: 7.4,
  pattern: "Normal",
  severity: null,
  confidence: 94,
  interpretation:
    "Lung function is within normal limits. No evidence of airflow obstruction or restrictive pattern. FEV1/FVC ratio of 76% is normal and indicates adequate airway patency. Expiratory flow contour is smooth with an expected peak-flow trajectory.",
  recommendation:
    "No immediate clinical intervention required. Continue current management. Recommend routine repeat spirometry in 12 months or sooner if symptoms develop.",
};

const ANALYSIS_STEPS = [
  "Loading waveform data…",
  "Extracting spirometric parameters…",
  "Comparing against age/sex/height norms…",
  "Running AI pattern classification…",
  "Generating clinical interpretation…",
];

const STEPS = ["Scan ID", "Measure", "Check-in", "Instructions", "Mouthpiece", "Test", "Dispose", "Analysis", "Results"];

// ─── Colours / theme ─────────────────────────────────────────────────────────

const C = {
  navy: "#1e3a5f",
  blue: "#2563eb",
  blueLight: "#eff6ff",
  green: "#16a34a",
  greenLight: "#f0fdf4",
  yellow: "#ca8a04",
  yellowLight: "#fefce8",
  red: "#dc2626",
  redLight: "#fef2f2",
  slate: "#64748b",
  border: "#e2e8f0",
  bg: "#f1f5f9",
  white: "#ffffff",
  text: "#0f172a",
};

// ─── Shared UI primitives ────────────────────────────────────────────────────

const Card = ({ children, style = {} }) => (
  <div style={{
    background: C.white, borderRadius: 16, boxShadow: "0 2px 16px rgba(0,0,0,.08)",
    padding: 40, ...style,
  }}>
    {children}
  </div>
);

const Btn = ({ children, onClick, variant = "primary", style = {}, disabled = false }) => {
  const base = {
    padding: "14px 32px", borderRadius: 10, border: "none", cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 600, fontSize: 16, transition: "opacity .15s", opacity: disabled ? .45 : 1, ...style,
  };
  const variants = {
    primary: { background: C.blue, color: "#fff" },
    outline: { background: "transparent", color: C.blue, border: `2px solid ${C.blue}` },
    ghost:   { background: C.bg, color: C.text },
    success: { background: C.green, color: "#fff" },
  };
  return (
    <button style={{ ...base, ...variants[variant] }} onClick={disabled ? undefined : onClick}>
      {children}
    </button>
  );
};

const MetricCard = ({ label, value, unit, predicted, pct, status }) => {
  const color = pct >= 80 ? C.green : pct >= 60 ? C.yellow : C.red;
  const bg    = pct >= 80 ? C.greenLight : pct >= 60 ? C.yellowLight : C.redLight;
  return (
    <div style={{ background: bg, borderRadius: 12, padding: "20px 24px", flex: 1, minWidth: 140 }}>
      <div style={{ color: C.slate, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: .5 }}>{label}</div>
      <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: 32, fontWeight: 700, color }}>{value}</span>
        <span style={{ fontSize: 14, color: C.slate }}>{unit}</span>
      </div>
      {predicted && (
        <div style={{ marginTop: 4, fontSize: 13, color: C.slate }}>
          Predicted: {predicted} {unit} &nbsp;
          <span style={{ fontWeight: 700, color }}>{pct}%</span>
        </div>
      )}
    </div>
  );
};

const Tag = ({ label, color, bg }) => (
  <span style={{
    background: bg, color, borderRadius: 20, padding: "4px 14px",
    fontSize: 13, fontWeight: 600,
  }}>{label}</span>
);

// ─── Step 0 — Scan ID ────────────────────────────────────────────────────────

const SCAN_MOCK = {
  name: "Matti Virtanen",
  dob: "12 Mar 1971",
  age: "54",
  sex: "male",
  idNumber: "FI-284 7391-A",
  nationality: "Finnish",
};

function ScanID({ onComplete }) {
  const [phase, setPhase] = useState("idle"); // idle | scanning | done

  const handleScan = () => {
    setPhase("scanning");
    setTimeout(() => setPhase("done"), 3200);
  };

  return (
    <Card>
      <style>{`
        @keyframes scanLine {
          0%   { top: 0px; }
          50%  { top: calc(100% - 4px); }
          100% { top: 0px; }
        }
        @keyframes scannerGlow {
          0%, 100% { box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
          50%       { box-shadow: 0 0 0 6px rgba(37,99,235,0.30); }
        }
        @keyframes checkPop {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🪪</div>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Scan Your ID</h2>
          <p style={{ margin: 0, color: C.slate, fontSize: 14 }}>Place your identity card, passport, or Kela card face-up in the scanner</p>
        </div>
      </div>

      {/* Scanner viewport */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
        <div style={{
          position: "relative", width: 380, height: 240,
          background: phase === "done" ? C.greenLight : "#f8fafc",
          borderRadius: 18,
          border: `2px solid ${phase === "done" ? C.green : phase === "scanning" ? C.blue : C.border}`,
          overflow: "hidden",
          transition: "border-color .3s, background .3s",
          animation: phase === "scanning" ? "scannerGlow 1s ease-in-out infinite" : "none",
        }}>

          {/* Corner brackets */}
          {["topLeft","topRight","bottomLeft","bottomRight"].map(pos => {
            const isTop    = pos.startsWith("top");
            const isLeft   = pos.endsWith("Left");
            const color    = phase === "done" ? C.green : C.blue;
            return (
              <div key={pos} style={{
                position: "absolute",
                top:    isTop    ? 14 : "auto",
                bottom: !isTop   ? 14 : "auto",
                left:   isLeft   ? 14 : "auto",
                right:  !isLeft  ? 14 : "auto",
                width: 22, height: 22,
                borderTop:    isTop    ? `3px solid ${color}` : "none",
                borderBottom: !isTop   ? `3px solid ${color}` : "none",
                borderLeft:   isLeft   ? `3px solid ${color}` : "none",
                borderRight:  !isLeft  ? `3px solid ${color}` : "none",
                borderRadius: isTop && isLeft   ? "4px 0 0 0"
                            : isTop && !isLeft  ? "0 4px 0 0"
                            : !isTop && isLeft  ? "0 0 0 4px"
                            :                    "0 0 4px 0",
                transition: "border-color .3s",
              }} />
            );
          })}

          {/* Animated scan beam */}
          {phase === "scanning" && (
            <div style={{
              position: "absolute", left: 0, right: 0, height: 4,
              background: "linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.6) 30%, #2563eb 50%, rgba(37,99,235,0.6) 70%, transparent 100%)",
              animation: "scanLine 1.1s ease-in-out infinite",
              boxShadow: "0 0 10px rgba(37,99,235,0.5)",
            }} />
          )}

          {/* Idle state */}
          {phase === "idle" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 10 }}>
              {/* Placeholder ID card */}
              <div style={{
                width: 220, height: 138, borderRadius: 10, border: `2px dashed ${C.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: 6, background: C.white,
              }}>
                <span style={{ fontSize: 34 }}>🪪</span>
                <span style={{ fontSize: 13, color: C.slate }}>ID card</span>
              </div>
            </div>
          )}

          {/* Scanning state */}
          {phase === "scanning" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, padding: 28, opacity: 0.5 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>👤</div>
              <div style={{ flex: 1 }}>
                <div style={{ height: 12, background: "#cbd5e1", borderRadius: 4, marginBottom: 8 }} />
                <div style={{ height: 10, background: "#e2e8f0", borderRadius: 4, marginBottom: 6, width: "70%" }} />
                <div style={{ height: 10, background: "#e2e8f0", borderRadius: 4, width: "50%" }} />
              </div>
            </div>
          )}

          {/* Done state — extracted data */}
          {phase === "done" && (
            <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "22px 28px", height: "100%" }}>
              {/* Photo placeholder */}
              <div style={{ width: 72, height: 88, borderRadius: 8, background: "#bbf7d0", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, border: `2px solid ${C.green}` }}>
                👤
              </div>
              {/* Extracted fields */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 19, color: C.text }}>{SCAN_MOCK.name}</div>
                <div style={{ color: C.slate, fontSize: 13, marginTop: 3 }}>Born: {SCAN_MOCK.dob} · {SCAN_MOCK.nationality}</div>
                <div style={{ color: C.slate, fontSize: 13, marginTop: 2 }}>ID: {SCAN_MOCK.idNumber}</div>
                <div style={{ marginTop: 10 }}>
                  <Tag label="✓ ID Verified" color={C.green} bg="#bbf7d0" />
                </div>
              </div>
              {/* Check badge */}
              <div style={{
                width: 40, height: 40, borderRadius: "50%", background: C.green,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 20, flexShrink: 0,
                animation: "checkPop .4s cubic-bezier(.34,1.56,.64,1)",
              }}>✓</div>
            </div>
          )}
        </div>
      </div>

      {/* Status message */}
      <div style={{ textAlign: "center", marginBottom: 24, minHeight: 24 }}>
        {phase === "idle"    && <span style={{ color: C.slate, fontSize: 14 }}>Align the card within the frame, then press <strong>Scan</strong></span>}
        {phase === "scanning" && <span style={{ color: C.blue, fontWeight: 600, fontSize: 14 }}>📡 Reading card… please hold still</span>}
        {phase === "done"    && <span style={{ color: C.green, fontWeight: 600, fontSize: 14 }}>✅ Scan successful — patient data extracted</span>}
      </div>

      {/* CTA */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        {phase === "idle" && (
          <>
            <Btn onClick={handleScan} style={{ fontSize: 17, padding: "15px 48px" }}>📷 Scan ID Card</Btn>
            <button
              onClick={() => onComplete(null)}
              style={{ background: "none", border: "none", color: C.slate, fontSize: 13, cursor: "pointer", textDecoration: "underline", padding: 0 }}
            >
              Skip — I'll enter details manually
            </button>
          </>
        )}
        {phase === "scanning" && (
          <div style={{ height: 50, display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 6 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: "50%", background: C.blue,
                  animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        {phase === "done" && (
          <Btn variant="success" onClick={() => onComplete(SCAN_MOCK)} style={{ fontSize: 17, padding: "15px 48px" }}>
            Confirm &amp; Continue →
          </Btn>
        )}
      </div>
    </Card>
  );
}

// ─── Step 1 — Measure height & weight ────────────────────────────────────────

// SVG arc helper for weight gauge
const arcPath = (cx, cy, r, startDeg, endDeg) => {
  const rad = d => (d - 90) * Math.PI / 180;
  const x1 = cx + r * Math.cos(rad(startDeg)), y1 = cy + r * Math.sin(rad(startDeg));
  const x2 = cx + r * Math.cos(rad(endDeg)),   y2 = cy + r * Math.sin(rad(endDeg));
  const large = (endDeg - startDeg) > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
};

function MeasureScreen({ targetHeight = 175, targetWeight = 82, onComplete }) {
  const [phase,      setPhase]      = useState("measuring"); // measuring | done
  const [animH,      setAnimH]      = useState(0);
  const [animW,      setAnimW]      = useState(0);
  const [scanY,      setScanY]      = useState(0);   // 0..1 beam position
  const [editH,      setEditH]      = useState(String(targetHeight));
  const [editW,      setEditW]      = useState(String(targetWeight));
  const [adjusting,  setAdjusting]  = useState(false);
  const timerRef = useRef(null);

  // Single animation loop: scan beam + count-up
  useEffect(() => {
    const DURATION = 3000, INTERVAL = 16;
    const steps = DURATION / INTERVAL;
    let s = 0;
    timerRef.current = setInterval(() => {
      s++;
      const t  = Math.min(s / steps, 1);
      const e  = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setScanY(e);                                          // beam travels top → head
      setAnimH(Math.round(targetHeight * e));
      setAnimW(parseFloat((targetWeight * e).toFixed(1)));
      if (s >= steps) {
        clearInterval(timerRef.current);
        setAnimH(targetHeight); setAnimW(targetWeight);
        setTimeout(() => { setPhase("done"); setEditH(String(targetHeight)); setEditW(String(targetWeight)); }, 400);
      }
    }, INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [targetHeight, targetWeight]);

  // ── Height SVG ──────────────────────────────────────────────────────────────
  const svgW = 180, svgH = 300;
  const rulerX = 100, rulerW = 20;
  const maxH = 220;
  // Head sits at ~10% from top of ruler zone → 90% of svgH
  const headFrac  = targetHeight / maxH;          // e.g. 175/220 ≈ 0.795
  const headY     = svgH * (1 - headFrac);        // px from top where head is
  const beamY     = headY + (svgH - headY) * (1 - Math.min(scanY / 0.85, 1)); // descends to headY
  const fillH     = svgH * (animH / maxH);        // height of filled bar

  const HeightViz = () => (
    <svg width={svgW} height={svgH} style={{ overflow: "visible" }}>
      {/* Ruler track */}
      <rect x={rulerX} y={0} width={rulerW} height={svgH} rx={6}
        fill="#f1f5f9" stroke={C.border} strokeWidth={1.5} />

      {/* Filled bar */}
      <rect x={rulerX} y={svgH - fillH} width={rulerW} height={fillH} rx={6}
        fill="url(#hGrad)" style={{ transition: "height .04s, y .04s" }} />

      <defs>
        <linearGradient id="hGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor={C.blue} />
        </linearGradient>
      </defs>

      {/* Tick marks + labels */}
      {[100, 120, 140, 160, 180, 200, 220].map(cm => {
        const y = svgH * (1 - cm / maxH);
        const isMajor = cm % 20 === 0;
        return (
          <g key={cm}>
            <line x1={rulerX - (isMajor ? 10 : 5)} y1={y} x2={rulerX} y2={y}
              stroke={isMajor ? "#94a3b8" : "#cbd5e1"} strokeWidth={isMajor ? 1.5 : 1} />
            {isMajor && (
              <text x={rulerX - 14} y={y + 4} textAnchor="end"
                fontSize={11} fill="#94a3b8">{cm}</text>
            )}
          </g>
        );
      })}

      {/* Person silhouette */}
      {/* Head */}
      <circle cx={rulerX - 38} cy={headY} r={18}
        fill={phase === "done" ? "#bfdbfe" : "#e2e8f0"} opacity={0.85} />
      {/* Body */}
      <rect x={rulerX - 50} y={headY + 18} width={24} height={svgH * 0.28} rx={6}
        fill={phase === "done" ? "#bfdbfe" : "#e2e8f0"} opacity={0.85} />
      {/* Left leg */}
      <rect x={rulerX - 50} y={headY + 18 + svgH * 0.28 - 4} width={10} height={svgH * 0.32} rx={4}
        fill={phase === "done" ? "#bfdbfe" : "#e2e8f0"} opacity={0.85} />
      {/* Right leg */}
      <rect x={rulerX - 38} y={headY + 18 + svgH * 0.28 - 4} width={10} height={svgH * 0.32} rx={4}
        fill={phase === "done" ? "#bfdbfe" : "#e2e8f0"} opacity={0.85} />

      {/* Scan beam (measuring phase) */}
      {phase === "measuring" && (
        <g>
          <line x1={rulerX - 70} y1={beamY} x2={rulerX + rulerW + 10} y2={beamY}
            stroke="#2563eb" strokeWidth={2.5} strokeOpacity={0.75}
            style={{ filter: "drop-shadow(0 0 4px #2563eb)" }} />
          {/* Beam end glow */}
          <circle cx={rulerX - 70} cy={beamY} r={4} fill={C.blue} opacity={0.6} />
        </g>
      )}

      {/* Measurement bracket (done phase) */}
      {phase === "done" && (
        <g>
          {/* Bracket line from head to floor */}
          <line x1={rulerX + rulerW + 12} y1={headY} x2={rulerX + rulerW + 12} y2={svgH}
            stroke={C.green} strokeWidth={2} />
          <line x1={rulerX + rulerW + 8}  y1={headY} x2={rulerX + rulerW + 16} y2={headY}
            stroke={C.green} strokeWidth={2} />
          <line x1={rulerX + rulerW + 8}  y1={svgH}  x2={rulerX + rulerW + 16} y2={svgH}
            stroke={C.green} strokeWidth={2} />
          {/* Value label */}
          <rect x={rulerX + rulerW + 18} y={svgH / 2 + headY / 2 - 16} width={64} height={32}
            rx={8} fill={C.green} />
          <text x={rulerX + rulerW + 50} y={svgH / 2 + headY / 2 + 6}
            textAnchor="middle" fontSize={16} fontWeight="700" fill="white">
            {animH} cm
          </text>
        </g>
      )}
    </svg>
  );

  // ── Weight SVG (arc gauge) ───────────────────────────────────────────────────
  const WGcx = 100, WGcy = 100, WGr = 72;
  const WG_START = 150, WG_SWEEP = 240, WG_MAX = 150;
  const wAngle  = WG_START + (animW / WG_MAX) * WG_SWEEP;
  const dotRad  = (d) => (d - 90) * Math.PI / 180;
  const dotX    = WGcx + WGr * Math.cos(dotRad(wAngle));
  const dotY    = WGcy + WGr * Math.sin(dotRad(wAngle));

  const WeightGauge = () => (
    <svg width={200} height={180} viewBox="0 0 200 180">
      {/* Tick marks around gauge */}
      {[0, 30, 60, 90, 120, 150].map(kg => {
        const a   = WG_START + (kg / WG_MAX) * WG_SWEEP;
        const r1  = WGr + 8, r2 = WGr + 16;
        const ra  = (a - 90) * Math.PI / 180;
        const x1  = WGcx + r1 * Math.cos(ra), y1 = WGcy + r1 * Math.sin(ra);
        const x2  = WGcx + r2 * Math.cos(ra), y2 = WGcy + r2 * Math.sin(ra);
        const tx  = WGcx + (r2 + 10) * Math.cos(ra);
        const ty  = WGcy + (r2 + 10) * Math.sin(ra);
        return (
          <g key={kg}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth={1.5} />
            <text x={tx} y={ty + 4} textAnchor="middle" fontSize={10} fill="#94a3b8">{kg}</text>
          </g>
        );
      })}

      {/* Background arc */}
      <path d={arcPath(WGcx, WGcy, WGr, WG_START, WG_START + WG_SWEEP)}
        fill="none" stroke="#e2e8f0" strokeWidth={14} strokeLinecap="round" />

      {/* Value arc */}
      {animW > 0 && (
        <path d={arcPath(WGcx, WGcy, WGr, WG_START, wAngle)}
          fill="none" stroke={phase === "done" ? C.blue : "#60a5fa"}
          strokeWidth={14} strokeLinecap="round" />
      )}

      {/* Moving dot */}
      {animW > 0 && (
        <circle cx={dotX} cy={dotY} r={9}
          fill={phase === "done" ? C.blue : "#93c5fd"}
          stroke="white" strokeWidth={2} />
      )}

      {/* Platform icon (scale base) */}
      <rect x={70} y={148} width={60} height={8} rx={4} fill="#e2e8f0" />
      <rect x={80} y={140} width={40} height={10} rx={3} fill="#f1f5f9" stroke={C.border} strokeWidth={1} />

      {/* Centre value */}
      <text x={WGcx} y={WGcy - 8} textAnchor="middle"
        fontSize={30} fontWeight="800" fill={phase === "done" ? C.blue : "#93c5fd"}>
        {animW.toFixed(1)}
      </text>
      <text x={WGcx} y={WGcy + 16} textAnchor="middle" fontSize={14} fill={C.slate}>kg</text>
    </svg>
  );

  // ── Adjust controls ──────────────────────────────────────────────────────────
  const Stepper = ({ label, unit, value, onChange, step }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.slate, textTransform: "uppercase" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 0, border: `2px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        <button onClick={() => onChange(v => String(Math.max(0, parseFloat(v) - step)))}
          style={{ width: 44, height: 48, border: "none", background: C.bg, fontSize: 22, cursor: "pointer", color: C.blue, fontWeight: 700 }}>−</button>
        <input
          type="number" value={value}
          onChange={e => onChange(() => e.target.value)}
          style={{ width: 80, height: 48, border: "none", textAlign: "center", fontSize: 20, fontWeight: 700, color: C.text, outline: "none" }}
        />
        <button onClick={() => onChange(v => String(parseFloat(v) + step))}
          style={{ width: 44, height: 48, border: "none", background: C.bg, fontSize: 22, cursor: "pointer", color: C.blue, fontWeight: 700 }}>+</button>
      </div>
      <div style={{ fontSize: 14, color: C.slate }}>{unit}</div>
    </div>
  );

  return (
    <Card>
      <style>{`
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>📐</div>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Height &amp; Weight Measurement</h2>
          <p style={{ margin: 0, color: C.slate, fontSize: 14 }}>
            {phase === "measuring" ? "Please stand upright on the platform — booth sensors are measuring…" : "Measurement complete — please confirm your readings below"}
          </p>
        </div>
        {phase === "done" && !adjusting && <Tag label="✓ Measured" color={C.green} bg={C.greenLight} />}
      </div>

      {/* Visualizations */}
      <div style={{ display: "flex", justifyContent: "center", gap: 60, marginBottom: 32, alignItems: "flex-start" }}>

        {/* Height */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.slate, textTransform: "uppercase", letterSpacing: .5 }}>Height</div>
          <HeightViz />
          {phase === "measuring" && (
            <div style={{ fontSize: 18, fontWeight: 700, color: C.blue }}>{animH} cm</div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, alignSelf: "stretch", background: C.border, marginTop: 24 }} />

        {/* Weight */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.slate, textTransform: "uppercase", letterSpacing: .5 }}>Weight</div>
          <div style={{ position: "relative" }}>
            <WeightGauge />
            {phase === "measuring" && (
              <div style={{ position: "absolute", bottom: -4, left: 0, right: 0, textAlign: "center", fontSize: 13, color: C.slate }}>
                Calculating…
              </div>
            )}
          </div>
          {phase === "measuring" && <div style={{ height: 20 }} />}
        </div>
      </div>

      {/* Done: summary + actions */}
      {phase === "done" && (
        <div style={{ animation: "fadeSlideIn .4s ease" }}>

          {/* Summary cards */}
          {!adjusting && (
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 28 }}>
              <div style={{ background: C.blueLight, borderRadius: 14, padding: "18px 32px", textAlign: "center", minWidth: 140 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1e40af", textTransform: "uppercase" }}>Height</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: C.blue, marginTop: 4 }}>{editH}</div>
                <div style={{ fontSize: 14, color: "#1e40af" }}>cm</div>
              </div>
              <div style={{ background: C.blueLight, borderRadius: 14, padding: "18px 32px", textAlign: "center", minWidth: 140 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1e40af", textTransform: "uppercase" }}>Weight</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: C.blue, marginTop: 4 }}>{editW}</div>
                <div style={{ fontSize: 14, color: "#1e40af" }}>kg</div>
              </div>
            </div>
          )}

          {/* Adjust steppers */}
          {adjusting && (
            <div style={{ display: "flex", gap: 48, justifyContent: "center", marginBottom: 28, padding: "24px 0", background: C.bg, borderRadius: 14 }}>
              <Stepper label="Height" unit="cm" value={editH} onChange={setEditH} step={1} />
              <Stepper label="Weight" unit="kg"  value={editW} onChange={setEditW} step={0.5} />
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
            {!adjusting ? (
              <>
                <Btn variant="outline" onClick={() => setAdjusting(true)}>✏️ Adjust</Btn>
                <Btn variant="success" onClick={() => onComplete({ height: editH, weight: editW })}>
                  Confirm &amp; Continue →
                </Btn>
              </>
            ) : (
              <>
                <Btn variant="ghost" onClick={() => setAdjusting(false)}>Cancel</Btn>
                <Btn onClick={() => { setAdjusting(false); }}>Save Adjustments</Btn>
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Step 2 — Check-in ───────────────────────────────────────────────────────

function CheckIn({ patient, setPatient, onNext }) {
  const field = (label, key, type = "text", opts = null) => (
    <div style={{ flex: 1, minWidth: 180 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.slate, marginBottom: 6 }}>
        {label}
      </label>
      {opts ? (
        <select
          value={patient[key]}
          onChange={e => setPatient(p => ({ ...p, [key]: e.target.value }))}
          style={inputStyle}
        >
          {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={patient[key]}
          onChange={e => setPatient(p => ({ ...p, [key]: e.target.value }))}
          style={inputStyle}
        />
      )}
    </div>
  );

  const valid = patient.name && patient.age && patient.height && patient.weight;

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: C.blueLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>👤</div>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Confirm Patient Details</h2>
          <p style={{ margin: 0, color: C.slate, fontSize: 14 }}>Review pre-filled data and add height &amp; weight for predicted values</p>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 28 }}>
        {field("Full Name", "name")}
        {field("Age (years)", "age", "number")}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 36 }}>
        {field("Height (cm)", "height", "number")}
        {field("Weight (kg)", "weight", "number")}
        {field("Biological Sex", "sex", "select", [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
        ])}
      </div>

      <div style={{ padding: "16px 20px", background: C.blueLight, borderRadius: 10, marginBottom: 32, fontSize: 14, color: "#1e40af" }}>
        ℹ️  Predicted values are calculated using the GLI-2012 reference equations based on age, height, and biological sex.
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Btn onClick={onNext} disabled={!valid}>Continue to Instructions →</Btn>
      </div>
    </Card>
  );
}

const inputStyle = {
  width: "100%", padding: "12px 14px", borderRadius: 8, border: `1.5px solid ${C.border}`,
  fontSize: 16, outline: "none", boxSizing: "border-box", color: C.text, background: C.white,
};

// ─── Instruction animations ───────────────────────────────────────────────────

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
    <ellipse cx={118} cy={164} rx={46} ry={64} fill="#0284c7"
      style={{transformOrigin:"118px 164px",animation:"ia_lung 2.4s ease-in-out infinite"}}/>
    <ellipse cx={202} cy={164} rx={46} ry={64} fill="#0284c7"
      style={{transformOrigin:"202px 164px",animation:"ia_lung 2.4s ease-in-out infinite"}}/>
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
      <circle key={i} cx={160} cy={136} r={24} fill="none" stroke="#f59e0b"
        style={{animation:`ba_ring 1.4s ${d}s ease-out infinite`}}/>
    ))}
    <circle cx={160} cy={136} r={32} fill="#f59e0b"
      style={{transformOrigin:"160px 136px",animation:"ba_center 1.4s ease-in-out infinite"}}/>
    <text x={160} y={144} textAnchor="middle" fontSize={26} fill="#1c1917">💨</text>
    {[[-80,106],[-80,126],[-80,146],[-80,166],[80,106],[80,126],[80,146],[80,166]].map(([ox,y],i)=>(
      <g key={i} style={{animation:`ba_streak 1.4s ${i*0.12}s ease-in-out infinite`}}>
        <line x1={160+ox*0.35} y1={y} x2={160+ox} y2={y}
          stroke="#fbbf24" strokeWidth={2.5} strokeLinecap="round" opacity={0.7}/>
      </g>
    ))}
    <text x={160} y={248} textAnchor="middle" fontSize={26} fill="#fbbf24" fontWeight="900" letterSpacing="3">BLAST OUT!</text>
    <text x={160} y={270} textAnchor="middle" fontSize={12} fill="#475569">Hard and fast — maximum force</text>
  </svg>
);

function TimerAnim() {
  const [elapsed, setElapsed] = useState(0);
  const r=80, cx=160, cy=136, circ=2*Math.PI*r;
  useEffect(()=>{
    let e=0;
    const iv=setInterval(()=>{ e+=0.05; if(e>6.5) e=0; setElapsed(e); },50);
    return ()=>clearInterval(iv);
  },[]);
  const pct=Math.min(elapsed/6,1);
  const color=pct<0.5?"#22c55e":pct<0.83?"#eab308":"#f97316";
  return (
    <svg viewBox="0 0 320 290" width="100%" height="100%">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={18}/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={18}
        strokeLinecap="round" strokeDasharray={`${pct*circ} ${circ}`}
        style={{transform:"rotate(-90deg)",transformOrigin:`${cx}px ${cy}px`,transition:"stroke .3s"}}/>
      <circle cx={cx} cy={cy} r={r-22} fill={color} opacity={0.07}/>
      <text x={cx} y={cy-6} textAnchor="middle" fontSize={42} fontWeight="800" fill={color}>
        {Math.min(elapsed,6).toFixed(1)}
      </text>
      <text x={cx} y={cy+22} textAnchor="middle" fontSize={15} fill="#475569">/ 6.0 sec</text>
      {[0,1,2,3,4,5,6].map(s=>{
        const a=(s/6)*360-90, ra=a*Math.PI/180;
        return <line key={s}
          x1={cx+(r+5)*Math.cos(ra)} y1={cy+(r+5)*Math.sin(ra)}
          x2={cx+(r+14)*Math.cos(ra)} y2={cy+(r+14)*Math.sin(ra)}
          stroke="#334155" strokeWidth={s===0||s===6?2.5:1.5}/>;
      })}
      <text x={cx} y={258} textAnchor="middle" fontSize={16} fill="#4ade80" fontWeight="800" letterSpacing="2">KEEP BLOWING!</text>
      <text x={cx} y={278} textAnchor="middle" fontSize={12} fill="#475569">Push every last bit of air out</text>
    </svg>
  );
}

// ─── Step 3 — Instructions (animated one-by-one) ──────────────────────────────

function Instructions({ onNext }) {
  const [current, setCurrent] = useState(0);
  const [barPct,  setBarPct]  = useState(0);
  const timerRef = useRef(null);

  const ISTEPS = [
    { icon:"🪑", color:"#a78bfa", title:"Sit upright",
      body:"Sit with your back straight and feet flat on the floor. Loosen any tight clothing around your chest.",
      Anim:PostureAnim },
    { icon:"🫁", color:"#38bdf8", title:"Take the deepest breath possible",
      body:"When prompted, breathe in as deeply as you can — completely fill your lungs before placing the mouthpiece.",
      Anim:InhaleAnim },
    { icon:"💨", color:"#fbbf24", title:"Blast the air out — hard and fast",
      body:"Place the mouthpiece firmly between your lips and exhale with maximum force as quickly as you can.",
      Anim:BlowAnim },
    { icon:"⏱️", color:"#4ade80", title:"Keep blowing for 6 full seconds",
      body:"Even when it feels like there is no air left — keep pushing until the timer completes 6 seconds.",
      Anim:TimerAnim },
  ];

  const DURATION = 6000;
  useEffect(()=>{
    setBarPct(0);
    const TICK=50, total=DURATION/TICK;
    let t=0;
    timerRef.current=setInterval(()=>{
      t++; setBarPct((t/total)*100);
      if(t>=total){ clearInterval(timerRef.current); if(current<ISTEPS.length-1) setCurrent(c=>c+1); }
    },TICK);
    return ()=>clearInterval(timerRef.current);
  },[current]);

  const step=ISTEPS[current], isLast=current===ISTEPS.length-1;
  const advance=()=>{ clearInterval(timerRef.current); if(!isLast) setCurrent(c=>c+1); };
  const back   =()=>{ clearInterval(timerRef.current); if(current>0) setCurrent(c=>c-1); };

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
            <div key={i} onClick={()=>{ clearInterval(timerRef.current); setCurrent(i); }}
              style={{width:i===current?28:10,height:10,borderRadius:6,
                background:i<current?C.green:i===current?step.color:C.border,
                cursor:"pointer",transition:"all .25s"}}/>
          ))}
        </div>
      </div>

      <div style={{margin:"20px 32px 0",background:"#0f172a",borderRadius:16,height:290,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:12,left:12,background:step.color,borderRadius:20,
          padding:"4px 14px",fontSize:13,fontWeight:700,color:"#0f172a",zIndex:1}}>
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
        <button onClick={onNext}
          style={{background:"none",border:"none",color:C.slate,fontSize:13,cursor:"pointer",textDecoration:"underline",padding:0}}>
          Skip to mouthpiece
        </button>
        {isLast
          ? <Btn variant="success" onClick={onNext} style={{fontSize:17,padding:"14px 40px"}}>Continue →</Btn>
          : <Btn onClick={advance}>Next →</Btn>
        }
      </div>
    </Card>
  );
}

// ─── Steps 4 & 6 — Mouthpiece recognition (shared logic) ─────────────────────

function MouthpieceStep({ title, subtitle, icon, bg, actionSteps, svgContent, doneContent, onNext }) {
  const [phase, setPhase] = useState("idle"); // idle | detecting | confirmed
  useEffect(()=>{ const t=setTimeout(()=>setPhase("detecting"),1200); return ()=>clearTimeout(t); },[]);
  useEffect(()=>{
    if(phase!=="detecting") return;
    const t=setTimeout(()=>setPhase("confirmed"),3000); return ()=>clearTimeout(t);
  },[phase]);

  const borderColor = phase==="confirmed"?C.green:phase==="detecting"?C.blue:C.border;

  return (
    <Card>
      <style>{`
        @keyframes mp_scan{0%{top:10px}50%{top:calc(100% - 14px)}100%{top:10px}}
        @keyframes mp_glow{0%,100%{box-shadow:0 0 0 3px rgba(37,99,235,.15)}50%{box-shadow:0 0 0 8px rgba(37,99,235,.28)}}
        @keyframes mp_pop{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
      `}</style>

      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28}}>
        <div style={{width:48,height:48,borderRadius:12,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{icon}</div>
        <div>
          <h2 style={{margin:0,fontSize:24,fontWeight:700}}>{title}</h2>
          <p style={{margin:0,color:C.slate,fontSize:14}}>
            {phase==="idle"      && subtitle.idle}
            {phase==="detecting" && subtitle.detecting}
            {phase==="confirmed" && subtitle.confirmed}
          </p>
        </div>
        {phase==="confirmed" && <Tag label="✓ Confirmed" color={C.green} bg={C.greenLight}/>}
      </div>

      <div style={{display:"flex",gap:24,marginBottom:28}}>
        {/* Camera viewport */}
        <div style={{flex:1,position:"relative",height:260,borderRadius:16,overflow:"hidden",
          background:phase==="confirmed"?C.greenLight:"#f8fafc",
          border:`2px solid ${borderColor}`,transition:"border-color .4s, background .4s",
          animation:phase==="detecting"?"mp_glow 1.1s ease-in-out infinite":"none"}}>

          {["tl","tr","bl","br"].map(pos=>{
            const t=pos[0]==="t", l=pos[1]==="l", col=phase==="confirmed"?C.green:C.blue;
            return <div key={pos} style={{position:"absolute",
              top:t?12:"auto",bottom:!t?12:"auto",left:l?12:"auto",right:!l?12:"auto",
              width:20,height:20,
              borderTop:t?`3px solid ${col}`:"none",borderBottom:!t?`3px solid ${col}`:"none",
              borderLeft:l?`3px solid ${col}`:"none",borderRight:!l?`3px solid ${col}`:"none",
              transition:"border-color .3s"}}/>;
          })}

          {phase==="detecting" && (
            <div style={{position:"absolute",left:0,right:0,height:4,
              background:"linear-gradient(90deg,transparent,rgba(37,99,235,.7),#2563eb,rgba(37,99,235,.7),transparent)",
              animation:"mp_scan 1.1s ease-in-out infinite",boxShadow:"0 0 8px rgba(37,99,235,.5)"}}/>
          )}

          <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",flexDirection:"column",gap:16}}>
            {phase!=="confirmed"
              ? svgContent(phase)
              : <div style={{textAlign:"center",animation:"mp_pop .4s cubic-bezier(.34,1.56,.64,1)"}}>{doneContent}</div>
            }
          </div>
        </div>

        {/* Checklist */}
        <div style={{width:240,display:"flex",flexDirection:"column",gap:14}}>
          {actionSteps.map((s,i)=>(
            <div key={i} style={{display:"flex",gap:12,padding:"14px 16px",borderRadius:12,
              background:s.done(phase)?C.greenLight:C.bg,
              border:`1.5px solid ${s.done(phase)?C.green:C.border}`,transition:"all .3s"}}>
              <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,
                background:s.done(phase)?C.green:C.border,
                display:"flex",alignItems:"center",justifyContent:"center",
                color:"white",fontSize:13,fontWeight:700}}>
                {s.done(phase)?"✓":i+1}
              </div>
              <span style={{fontSize:13,color:s.done(phase)?C.green:C.text,lineHeight:1.5}}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:13,color:C.slate}}>
          {phase==="idle"      && "Waiting…"}
          {phase==="detecting" && "📡 Camera active — verifying…"}
          {phase==="confirmed" && "✅ All checks passed"}
        </div>
        <Btn variant="success" disabled={phase!=="confirmed"} onClick={onNext}>
          {phase==="confirmed"?"Continue →":"Waiting for detection…"}
        </Btn>
      </div>
    </Card>
  );
}

function MouthpieceIn({ onNext }) {
  return (
    <MouthpieceStep
      title="Take & Insert Mouthpiece"
      icon="🎤"
      bg="#fef3c7"
      subtitle={{
        idle:      "Take a fresh mouthpiece from the dispenser and insert it into the tube",
        detecting: "Booth camera is verifying the mouthpiece is inserted correctly…",
        confirmed: "Mouthpiece detected and correctly inserted ✓",
      }}
      actionSteps={[
        { label:"Take a fresh mouthpiece from the dispenser on your right", done:p=>p!=="idle" },
        { label:"Insert it firmly into the tube at the front of the booth",  done:p=>p==="confirmed" },
        { label:"Hold still — camera will confirm it's correctly placed",    done:p=>p==="confirmed" },
      ]}
      svgContent={phase=>(
        <>
          <svg width={200} height={100} viewBox="0 0 200 100">
            <rect x={112} y={28} width={78} height={44} rx={8} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={1.5}/>
            <rect x={148} y={36} width={42} height={28} rx={4} fill="#e2e8f0"/>
            <text x={169} y={54} textAnchor="middle" fontSize={9} fill="#94a3b8" fontWeight="600">TUBE</text>
            <rect x={20} y={38} width={78} height={24} rx={12} fill={phase==="detecting"?"#60a5fa":"#93c5fd"} stroke="#2563eb" strokeWidth={1.5}/>
            <line x1={102} y1={50} x2={116} y2={50} stroke="#2563eb" strokeWidth={2.5} strokeLinecap="round"/>
            <polygon points="116,44 126,50 116,56" fill="#2563eb"/>
          </svg>
          <div style={{fontSize:13,color:C.slate,textAlign:"center"}}>
            {phase==="idle"?"Align mouthpiece with the tube opening":"Camera detecting mouthpiece position…"}
          </div>
        </>
      )}
      doneContent={
        <>
          <svg width={200} height={90} viewBox="0 0 200 90">
            <rect x={20} y={28} width={160} height={34} rx={17} fill="#bbf7d0" stroke={C.green} strokeWidth={2}/>
            <rect x={148} y={20} width={44} height={50} rx={8} fill="#dcfce7" stroke={C.green} strokeWidth={1.5}/>
            <text x={170} y={49} textAnchor="middle" fontSize={9} fill={C.green} fontWeight="700">✓ IN</text>
          </svg>
          <div style={{color:C.green,fontWeight:700,fontSize:16}}>Mouthpiece correctly inserted</div>
        </>
      }
      onNext={onNext}
    />
  );
}

function MouthpieceOut({ onNext }) {
  return (
    <MouthpieceStep
      title="Remove & Dispose Mouthpiece"
      icon="🗑️"
      bg="#dcfce7"
      subtitle={{
        idle:      "Great work! Remove the mouthpiece and place it in the waste bin",
        detecting: "Booth camera is verifying mouthpiece has been disposed of…",
        confirmed: "Mouthpiece disposal confirmed — hygiene check passed ✓",
      }}
      actionSteps={[
        { label:"Remove the mouthpiece from the tube",                       done:p=>p!=="idle" },
        { label:"Drop it into the yellow waste bin on your left",            done:p=>p==="confirmed" },
        { label:"Camera will confirm it has been disposed of correctly",     done:p=>p==="confirmed" },
      ]}
      svgContent={phase=>(
        <>
          <svg width={210} height={120} viewBox="0 0 210 120">
            <rect x={130} y={38} width={62} height={72} rx={6} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={1.5}/>
            <rect x={124} y={30} width={74} height={14} rx={5} fill="#94a3b8"/>
            <line x1={158} y1={30} x2={158} y2={110} stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 3"/>
            <line x1={176} y1={30} x2={176} y2={110} stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 3"/>
            <rect x={18} y={50} width={74} height={20} rx={10} fill={phase==="detecting"?"#60a5fa":"#93c5fd"} stroke="#2563eb" strokeWidth={1.5}/>
            <line x1={96} y1={60} x2={116} y2={60} stroke="#2563eb" strokeWidth={2.5} strokeLinecap="round"/>
            <polygon points="116,54 126,60 116,66" fill="#2563eb"/>
          </svg>
          <div style={{fontSize:13,color:C.slate,textAlign:"center"}}>
            {phase==="idle"?"Remove from tube and drop into the bin":"Detecting mouthpiece in waste bin…"}
          </div>
        </>
      )}
      doneContent={
        <>
          <svg width={160} height={110} viewBox="0 0 160 110">
            <rect x={48} y={28} width={64} height={72} rx={6} fill="#dcfce7" stroke={C.green} strokeWidth={2}/>
            <rect x={40} y={20} width={80} height={14} rx={5} fill="#bbf7d0" stroke={C.green} strokeWidth={1.5}/>
            <line x1={75} y1={20} x2={75} y2={100} stroke={C.green} strokeWidth={1} strokeDasharray="4 3"/>
            <line x1={97} y1={20} x2={97} y2={100} stroke={C.green} strokeWidth={1} strokeDasharray="4 3"/>
            <text x={80} y={70} textAnchor="middle" fontSize={28} fill={C.green}>✓</text>
          </svg>
          <div style={{color:C.green,fontWeight:700,fontSize:16}}>Mouthpiece safely disposed</div>
          <div style={{fontSize:12,color:C.slate,marginTop:4}}>🧼 Never reuse — a fresh mouthpiece is required for every patient</div>
        </>
      }
      onNext={onNext}
    />
  );
}

// ─── Step 5 — Test ───────────────────────────────────────────────────────────

function TestScreen({ testPhase, countdown, curveData, onStart, onRetry, onNext }) {
  const volumePct = curveData.length
    ? Math.round((curveData[curveData.length - 1].volume / 3.82) * 100)
    : 0;

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🫁</div>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Spirometry Test</h2>
          <p style={{ margin: 0, color: C.slate, fontSize: 14 }}>Live flow-volume curve</p>
        </div>
        {testPhase === "done" && (
          <Tag label="✓ Test Complete" color={C.green} bg={C.greenLight} />
        )}
      </div>

      {/* Graph */}
      <div style={{ height: 260, marginBottom: 20 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={testPhase === "done" ? FULL_CURVE : curveData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.blue} stopOpacity={0.3} />
                <stop offset="95%" stopColor={C.blue} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="volume" type="number" domain={[0, 4.2]} tickCount={8}
              label={{ value: "Volume (L)", position: "insideBottom", offset: -2, fontSize: 12, fill: C.slate }} />
            <YAxis domain={[0, 9]} tickCount={6}
              label={{ value: "Flow (L/s)", angle: -90, position: "insideLeft", offset: 10, fontSize: 12, fill: C.slate }} />
            <Tooltip formatter={(v, n) => [v, n === "flow" ? "Flow (L/s)" : "Vol (L)"]}
              labelFormatter={v => `Volume: ${v} L`} />
            <ReferenceLine x={0.12} stroke={C.yellow} strokeDasharray="4 3"
              label={{ value: "PEF", position: "top", fontSize: 11, fill: C.yellow }} />
            <Area type="monotone" dataKey="flow" stroke={C.blue} strokeWidth={2.5}
              fill="url(#flowGrad)" dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Inline stats while blowing */}
      {(testPhase === "blow" || testPhase === "done") && (
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1, background: C.bg, borderRadius: 10, padding: "14px 18px" }}>
            <div style={{ fontSize: 12, color: C.slate, fontWeight: 600 }}>VOLUME EXHALED</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.blue }}>
              {curveData.length ? curveData[curveData.length - 1].volume.toFixed(2) : "0.00"}
              <span style={{ fontSize: 14, fontWeight: 400, color: C.slate }}> L</span>
            </div>
            <div style={{ marginTop: 6, height: 6, background: "#e2e8f0", borderRadius: 4 }}>
              <div style={{ height: 6, background: C.blue, borderRadius: 4, width: `${volumePct}%`, transition: "width .1s" }} />
            </div>
          </div>
          <div style={{ flex: 1, background: C.bg, borderRadius: 10, padding: "14px 18px" }}>
            <div style={{ fontSize: 12, color: C.slate, fontWeight: 600 }}>PEAK FLOW</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: testPhase === "done" ? C.green : C.blue }}>
              7.4 <span style={{ fontSize: 14, fontWeight: 400, color: C.slate }}>L/s</span>
            </div>
          </div>
          <div style={{ flex: 1, background: C.bg, borderRadius: 10, padding: "14px 18px" }}>
            <div style={{ fontSize: 12, color: C.slate, fontWeight: 600 }}>STATUS</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 6, color: testPhase === "done" ? C.green : C.blue }}>
              {testPhase === "blow" ? "🟢 Blowing…" : "✅ Good effort!"}
            </div>
          </div>
        </div>
      )}

      {/* CTA area */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {testPhase === "ready" && (
          <div style={{ width: "100%", textAlign: "center" }}>
            <p style={{ color: C.slate, marginBottom: 20 }}>
              When you are ready, pick up the mouthpiece, take the deepest breath you can, and press <strong>Start Manoeuvre</strong>.
            </p>
            <Btn onClick={onStart} style={{ fontSize: 18, padding: "16px 48px" }}>▶ Start Manoeuvre</Btn>
          </div>
        )}
        {testPhase === "countdown" && (
          <div style={{ width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 80, fontWeight: 800, color: C.blue, lineHeight: 1 }}>{countdown}</div>
            <div style={{ fontSize: 22, color: C.slate, marginTop: 8 }}>Get ready to BLOW…</div>
          </div>
        )}
        {testPhase === "blow" && (
          <div style={{ width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.blue }}>💨 KEEP BLOWING!</div>
            <div style={{ color: C.slate, marginTop: 4 }}>Exhale as hard and fast as possible</div>
          </div>
        )}
        {testPhase === "done" && (
          <>
            <Btn variant="outline" onClick={onRetry}>↩ Retry Manoeuvre</Btn>
            <div style={{ color: C.slate, fontSize: 14 }}>Attempt 1 of 3</div>
            <Btn variant="success" onClick={onNext}>Accept & Analyse →</Btn>
          </>
        )}
      </div>
    </Card>
  );
}

// ─── Step 3 — AI Analysis ────────────────────────────────────────────────────

function AnalysisScreen({ progress, stepLabel, stepIdx, total }) {
  const checks = [
    "Waveform integrity validated",
    "Spirometric parameters extracted",
    "GLI-2012 reference norms applied",
    "Neural network inference complete",
    "Report generated",
  ];

  return (
    <Card style={{ textAlign: "center", padding: "60px 40px" }}>
      {/* Animated icon */}
      <div style={{
        width: 96, height: 96, borderRadius: "50%", background: C.blueLight, margin: "0 auto 32px",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44,
        boxShadow: `0 0 0 12px ${C.blueLight}`,
        animation: "pulse 1.6s ease-in-out infinite",
      }}>
        🤖
      </div>

      <h2 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 8px" }}>AI Analysis in Progress</h2>
      <p style={{ color: C.slate, fontSize: 15, margin: "0 0 36px" }}>
        Our clinical AI is analysing your spirometry data
      </p>

      {/* Progress bar */}
      <div style={{ maxWidth: 480, margin: "0 auto 12px" }}>
        <div style={{ height: 10, background: C.border, borderRadius: 8 }}>
          <div style={{
            height: 10, background: `linear-gradient(90deg, ${C.blue}, #60a5fa)`,
            borderRadius: 8, width: `${progress}%`, transition: "width .15s ease",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 13, color: C.slate }}>
          <span>{stepLabel}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Step checklist */}
      <div style={{ maxWidth: 380, margin: "28px auto 0", textAlign: "left" }}>
        {checks.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0",
            borderBottom: i < checks.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
              background: i < stepIdx ? C.green : i === stepIdx ? C.blue : C.border,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontSize: 12, fontWeight: 700,
            }}>
              {i < stepIdx ? "✓" : i === stepIdx ? "…" : ""}
            </div>
            <span style={{ fontSize: 14, color: i <= stepIdx ? C.text : C.slate }}>{c}</span>
          </div>
        ))}
      </div>

      <style>{`@keyframes pulse { 0%,100%{box-shadow:0 0 0 12px ${C.blueLight}} 50%{box-shadow:0 0 0 24px ${C.blueLight}} }`}</style>
    </Card>
  );
}

// ─── Step 4 — Results ────────────────────────────────────────────────────────

function ResultsScreen({ patient, results, curveData, onRestart }) {
  const patternColor  = results.pattern === "Normal" ? C.green : results.pattern === "Obstructive" ? C.yellow : C.red;
  const patternBg     = results.pattern === "Normal" ? C.greenLight : results.pattern === "Obstructive" ? C.yellowLight : C.redLight;

  return (
    <div>
      {/* Patient + result header */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <Card style={{ flex: 2, padding: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.slate, textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>Patient</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{patient.name}</div>
          <div style={{ color: C.slate, fontSize: 14, marginTop: 2 }}>
            {patient.age} yrs · {patient.height} cm · {patient.weight} kg · {patient.sex === "male" ? "Male" : "Female"}
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <Tag label={`Pattern: ${results.pattern}`} color={patternColor} bg={patternBg} />
            {results.severity && <Tag label={results.severity} color={C.yellow} bg={C.yellowLight} />}
          </div>
        </Card>

        <Card style={{ flex: 1, padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.slate, textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>AI Confidence</div>
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={100} height={100} style={{ transform: "rotate(-90deg)" }}>
              <circle cx={50} cy={50} r={40} fill="none" stroke={C.border} strokeWidth={10} />
              <circle cx={50} cy={50} r={40} fill="none" stroke={C.green} strokeWidth={10}
                strokeDasharray={`${2 * Math.PI * 40 * results.confidence / 100} 999`}
                strokeLinecap="round" />
            </svg>
            <span style={{ position: "absolute", fontSize: 22, fontWeight: 800, color: C.green }}>{results.confidence}%</span>
          </div>
          <div style={{ fontSize: 13, color: C.slate, marginTop: 4 }}>Classification confidence</div>
        </Card>
      </div>

      {/* Metrics row */}
      <Card style={{ padding: 28, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.slate, textTransform: "uppercase", letterSpacing: .5, marginBottom: 16 }}>Spirometric Parameters</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <MetricCard label="FVC" value={results.fvc} unit="L" predicted={results.fvcPred} pct={results.fvcPct} />
          <MetricCard label="FEV₁" value={results.fev1} unit="L" predicted={results.fev1Pred} pct={results.fev1Pct} />
          <MetricCard label="FEV₁/FVC" value={`${results.fev1Fvc}%`} unit="" />
          <MetricCard label="PEF" value={results.pef} unit="L/s" />
        </div>
      </Card>

      {/* Graph + AI interpretation side by side */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <Card style={{ flex: 1, padding: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.slate, textTransform: "uppercase", letterSpacing: .5, marginBottom: 12 }}>Flow-Volume Curve</div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={curveData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="flowGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.green} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={C.green} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="volume" type="number" domain={[0, 4.2]} tickCount={6}
                  tick={{ fontSize: 11 }}
                  label={{ value: "Volume (L)", position: "insideBottom", offset: -2, fontSize: 11, fill: C.slate }} />
                <YAxis domain={[0, 9]} tickCount={5} tick={{ fontSize: 11 }}
                  label={{ value: "Flow (L/s)", angle: -90, position: "insideLeft", offset: 10, fontSize: 11, fill: C.slate }} />
                <Area type="monotone" dataKey="flow" stroke={C.green} strokeWidth={2.5}
                  fill="url(#flowGrad2)" dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card style={{ flex: 1, padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 22 }}>🤖</span>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.slate, textTransform: "uppercase", letterSpacing: .5 }}>AI Clinical Interpretation</div>
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: C.text, margin: "0 0 20px" }}>
            {results.interpretation}
          </p>
          <div style={{ padding: "14px 18px", background: C.blueLight, borderRadius: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1e40af", marginBottom: 6, textTransform: "uppercase" }}>Recommendation</div>
            <p style={{ fontSize: 14, color: "#1e40af", margin: 0, lineHeight: 1.6 }}>
              {results.recommendation}
            </p>
          </div>
        </Card>
      </div>

      {/* Disclaimer + actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
        <p style={{ fontSize: 12, color: C.slate, margin: 0, maxWidth: 480, lineHeight: 1.5 }}>
          ⚕️ This report is generated by an AI system and is intended for clinical decision support only.
          Results must be interpreted by a qualified healthcare professional.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <Btn variant="outline" onClick={() => alert("PDF export — coming soon!")}>⬇ Export PDF</Btn>
          <Btn variant="ghost" onClick={onRestart}>New Patient</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────

export default function SpirometryBooth() {
  const [step, setStep] = useState(0);
  const [patient, setPatient] = useState({
    name: "Matti Virtanen", age: "54", height: "175", weight: "82", sex: "male",
  });
  const [testPhase, setTestPhase] = useState("ready");
  const [countdown, setCountdown] = useState(3);
  const [curveData, setCurveData] = useState([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStepIdx, setAnalysisStepIdx] = useState(0);
  const timerRef = useRef(null);

  // Countdown
  useEffect(() => {
    if (testPhase !== "countdown") return;
    let c = 3;
    setCountdown(c);
    timerRef.current = setInterval(() => {
      c--;
      if (c <= 0) { clearInterval(timerRef.current); setTestPhase("blow"); }
      else setCountdown(c);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [testPhase]);

  // Blow animation
  useEffect(() => {
    if (testPhase !== "blow") return;
    let i = 0;
    setCurveData([]);
    timerRef.current = setInterval(() => {
      i++;
      setCurveData(FULL_CURVE.slice(0, i + 1));
      if (i >= FULL_CURVE.length - 1) {
        clearInterval(timerRef.current);
        setTimeout(() => setTestPhase("done"), 300);
      }
    }, 25);
    return () => clearInterval(timerRef.current);
  }, [testPhase]);

  // Analysis progress
  useEffect(() => {
    if (step !== 7) return;
    setAnalysisProgress(0);
    setAnalysisStepIdx(0);
    let p = 0;
    const iv = setInterval(() => {
      p += 1.2;
      setAnalysisProgress(Math.min(p, 100));
      setAnalysisStepIdx(Math.min(Math.floor((p / 100) * ANALYSIS_STEPS.length), ANALYSIS_STEPS.length - 1));
      if (p >= 100) { clearInterval(iv); setTimeout(() => setStep(8), 700); }
    }, 45);
    return () => clearInterval(iv);
  }, [step]);

  const goToStep = n => {
    setStep(n);
    if (n === 5) { setTestPhase("ready"); setCurveData([]); }
  };

  // ── Stepper header ──
  const header = (
    <div style={{ background: C.navy, padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ background: C.blue, borderRadius: 8, padding: "6px 12px", color: "#fff", fontWeight: 800, fontSize: 16, letterSpacing: .5 }}>
          SPIRO
        </div>
        <div style={{ color: "#94a3b8", fontSize: 13 }}>AI Spirometry Booth · Station 03</div>
      </div>

      {/* Step indicators */}
      <div style={{ display: "flex", alignItems: "center" }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: i < step ? C.green : i === step ? C.blue : "#334155",
                color: "#fff", fontSize: 11, fontWeight: 700,
              }}>
                {i < step ? "✓" : i + 1}
              </div>
              <div style={{ fontSize: 10, color: i === step ? "#fff" : "#64748b", marginTop: 3, whiteSpace: "nowrap" }}>{s}</div>
            </div>
            {i < STEPS.length - 1 && <div style={{ width: 32, height: 1, background: i < step ? C.green : "#334155", margin: "0 4px 14px" }} />}
          </div>
        ))}
      </div>

      <div style={{ color: "#475569", fontSize: 12 }}>{new Date().toLocaleDateString("en-GB", { dateStyle: "medium" })}</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {header}
      <div style={{ maxWidth: 900, margin: "36px auto", padding: "0 24px 60px" }}>
        {step === 0 && (
          <ScanID onComplete={extracted => {
            if (extracted) {
              setPatient(p => ({
                ...p,
                name: extracted.name || p.name,
                age:  extracted.age  || p.age,
                sex:  extracted.sex  || p.sex,
              }));
            }
            goToStep(1);
          }} />
        )}
        {step === 1 && (
          <MeasureScreen
            targetHeight={175}
            targetWeight={82}
            onComplete={({ height, weight }) => {
              setPatient(p => ({ ...p, height, weight }));
              goToStep(2);
            }}
          />
        )}
        {step === 2 && <CheckIn patient={patient} setPatient={setPatient} onNext={() => goToStep(3)} />}
        {step === 3 && <Instructions onNext={() => goToStep(4)} />}
        {step === 4 && <MouthpieceIn onNext={() => goToStep(5)} />}
        {step === 5 && (
          <TestScreen
            testPhase={testPhase}
            countdown={countdown}
            curveData={curveData}
            onStart={() => setTestPhase("countdown")}
            onRetry={() => { setTestPhase("ready"); setCurveData([]); }}
            onNext={() => goToStep(6)}
          />
        )}
        {step === 6 && <MouthpieceOut onNext={() => goToStep(7)} />}
        {step === 7 && (
          <AnalysisScreen
            progress={analysisProgress}
            stepLabel={ANALYSIS_STEPS[analysisStepIdx]}
            stepIdx={analysisStepIdx}
            total={ANALYSIS_STEPS.length}
          />
        )}
        {step === 8 && (
          <ResultsScreen
            patient={patient}
            results={MOCK_RESULTS}
            curveData={FULL_CURVE}
            onRestart={() => goToStep(0)}
          />
        )}
      </div>
    </div>
  );
}
