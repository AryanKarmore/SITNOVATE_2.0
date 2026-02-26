import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { indiaStates } from '@/data/indiaStates';
import type { StateData } from '@/types';

interface IndiaMapProps {
  onStateClick?: (state: StateData) => void;
  selectedState?: string | null;
  simulationCycle?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG paths meticulously traced from reference India map image.
// ViewBox used throughout: "0 0 500 580"
// Coordinate system: x increases east, y increases south.
// Every path closes with Z. Paths are simplified polygons that preserve
// recognisable shape without requiring sub-pixel precision.
// ─────────────────────────────────────────────────────────────────────────────
const STATE_PATHS: Record<string, string> = {
  // ── Far North ──────────────────────────────────────────────────────────────
  // Jammu & Kashmir (inc. Ladakh) — large irregular state in the NW
  JK: `M 142,22 L 158,14 L 178,10 L 200,12 L 218,18 L 232,28 L 238,42
       L 232,56 L 222,66 L 208,72 L 196,80 L 182,84 L 170,80 L 158,72
       L 148,62 L 140,50 L 138,36 Z`,

  // Himachal Pradesh — wedge south of JK
  HP: `M 196,80 L 208,72 L 222,66 L 236,70 L 246,80 L 248,94
       L 238,104 L 224,108 L 210,104 L 200,96 Z`,

  // Punjab — small square state
  PB: `M 158,72 L 170,80 L 182,84 L 196,80 L 200,96 L 194,108
       L 182,114 L 168,112 L 158,102 L 154,88 Z`,

  // Uttarakhand — small hilly state
  UT: `M 236,70 L 250,66 L 264,70 L 272,82 L 268,96 L 256,104
       L 242,104 L 238,104 L 246,80 Z`,

  // Haryana — wraps around Delhi
  HR: `M 168,112 L 182,114 L 194,108 L 200,96 L 210,104 L 210,120
       L 202,132 L 190,138 L 176,134 L 166,124 Z`,

  // Delhi — tiny enclave
  DL: `M 194,118 L 202,116 L 206,124 L 200,130 L 192,128 Z`,

  // ── West & Central ─────────────────────────────────────────────────────────
  // Rajasthan — largest state, dominates NW
  RJ: `M 120,108 L 154,102 L 158,102 L 168,112 L 166,124 L 172,140
       L 170,158 L 164,178 L 154,196 L 140,206 L 122,210 L 106,204
       L 94,192 L 88,176 L 90,158 L 96,140 L 106,122 Z`,

  // Uttar Pradesh — large central-northern state
  UP: `M 200,130 L 210,120 L 224,108 L 238,104 L 256,104 L 268,96
       L 280,100 L 294,108 L 302,122 L 304,140 L 296,156 L 280,166
       L 262,170 L 244,168 L 226,162 L 212,154 L 202,144 Z`,

  // Bihar — east of UP
  BR: `M 302,122 L 320,116 L 336,120 L 350,130 L 354,148 L 346,164
       L 330,174 L 312,176 L 296,168 L 296,156 L 304,140 Z`,

  // Sikkim — tiny in NE
  SK: `M 358,118 L 368,114 L 376,122 L 372,132 L 362,136 L 356,128 Z`,

  // Arunachal Pradesh — large in far NE
  AR: `M 376,88 L 402,84 L 424,90 L 438,104 L 432,120 L 416,130
       L 396,134 L 376,132 L 360,126 L 356,114 L 362,100 Z`,

  // Nagaland — small NE
  NL: `M 396,134 L 412,130 L 422,138 L 420,152 L 408,158 L 396,152 Z`,

  // Assam — elongated E-W strip
  AS: `M 348,130 L 360,126 L 376,132 L 396,134 L 408,142 L 416,154
       L 408,162 L 390,166 L 368,164 L 348,160 L 336,154 L 334,144 Z`,

  // Meghalaya — south of Assam
  ML: `M 336,154 L 350,158 L 364,158 L 374,166 L 370,178 L 354,182
       L 336,178 L 326,168 Z`,

  // Manipur — SE of Nagaland
  MN: `M 408,158 L 420,156 L 428,166 L 424,180 L 412,184 L 402,176
       L 402,164 Z`,

  // Mizoram — south of Manipur
  MZ: `M 390,184 L 404,180 L 412,190 L 408,204 L 394,208 L 382,200 Z`,

  // Tripura — surrounded by Bangladesh
  TR: `M 364,182 L 378,178 L 386,186 L 382,200 L 368,202 L 360,192 Z`,

  // West Bengal — tall narrow state
  WB: `M 330,174 L 346,166 L 360,168 L 368,178 L 366,196 L 356,212
       L 342,222 L 326,224 L 314,216 L 308,200 L 312,184 Z`,

  // Jharkhand — south of Bihar
  JH: `M 296,168 L 312,176 L 330,174 L 312,184 L 308,200 L 296,210
       L 280,210 L 268,198 L 264,182 L 272,172 Z`,

  // Odisha — east coast
  OD: `M 308,200 L 326,196 L 342,200 L 354,212 L 350,232 L 336,246
       L 318,252 L 300,248 L 286,234 L 284,216 Z`,

  // Chhattisgarh — landlocked central
  CG: `M 264,182 L 280,178 L 296,178 L 308,188 L 314,204 L 308,222
       L 296,234 L 278,238 L 260,230 L 250,216 L 252,198 Z`,

  // Madhya Pradesh — heart of India
  MP: `M 172,158 L 188,152 L 206,150 L 222,154 L 238,158 L 252,166
       L 264,178 L 262,196 L 248,208 L 228,216 L 206,216 L 188,208
       L 172,196 L 162,182 L 162,168 Z`,

  // Gujarat — western coastal state with Kathiawar peninsula
  GJ: `M 92,162 L 106,158 L 122,162 L 138,170 L 148,184 L 150,202
       L 142,222 L 126,236 L 108,240 L 90,234 L 76,222 L 72,206
       L 76,188 Z`,

  // Maharashtra — large Deccan state
  MH: `M 150,202 L 170,198 L 190,202 L 206,212 L 220,224 L 220,246
       L 208,264 L 190,278 L 170,282 L 150,276 L 130,262 L 118,244
       L 114,226 L 120,210 L 136,204 Z`,

  // Telangana — new state carved from AP
  TL: `M 220,248 L 240,242 L 256,248 L 264,264 L 258,282 L 244,292
       L 226,292 L 212,280 L 210,264 Z`,

  // Andhra Pradesh — SE coast
  AP: `M 244,294 L 262,286 L 278,290 L 292,304 L 294,324 L 282,340
       L 264,350 L 246,350 L 230,340 L 222,322 L 224,304 Z`,

  // Goa — tiny coastal state
  GA: `M 144,280 L 158,278 L 164,288 L 158,298 L 146,298 L 140,288 Z`,

  // Karnataka — large southern state
  KA: `M 150,278 L 170,282 L 190,280 L 208,282 L 222,294 L 224,314
       L 218,332 L 204,344 L 186,352 L 168,352 L 150,342 L 136,326
       L 130,306 L 132,288 L 140,278 Z`,

  // Tamil Nadu — SE peninsula
  TN: `M 218,334 L 234,328 L 248,330 L 264,344 L 270,362 L 262,382
       L 248,396 L 230,404 L 212,400 L 196,388 L 188,372 L 188,354
       L 198,342 Z`,

  // Kerala — narrow western coastal strip
  KL: `M 168,354 L 186,354 L 198,362 L 194,382 L 186,402 L 174,414
       L 160,410 L 150,396 L 148,378 L 152,362 Z`,
};

// Label centroid positions — placed inside each state for readability
const LABEL_POS: Record<string, [number, number]> = {
  JK: [188, 44],  HP: [222, 92],  PB: [174, 92],  UT: [252, 88],
  HR: [186, 120], DL: [199, 123], RJ: [128, 160],  UP: [254, 136],
  BR: [326, 146], SK: [366, 126], AR: [404, 110],  NL: [408, 146],
  AS: [378, 148], ML: [350, 170], MN: [414, 170],  MZ: [396, 194],
  TR: [374, 190], WB: [336, 198], JH: [294, 192],  OD: [318, 226],
  CG: [282, 208], MP: [214, 184], GJ: [106, 200],  MH: [172, 240],
  TL: [238, 268], AP: [258, 318], GA: [152, 290],  KA: [178, 318],
  TN: [228, 368], KL: [170, 384],
};

// Real active water/resource dispute connections (geopolitically grounded)
const DISPUTE_EDGES: Array<{a: string; b: string; type: 'water'|'power'|'food'; severity: number}> = [
  { a: 'KA', b: 'TN', type: 'water', severity: 3 },   // Cauvery dispute — Supreme Court
  { a: 'KA', b: 'AP', type: 'water', severity: 2 },   // Krishna tribunal
  { a: 'MH', b: 'KA', type: 'water', severity: 2 },   // Krishna upper/lower
  { a: 'PB', b: 'RJ', type: 'water', severity: 2 },   // Ravi-Beas tribunal
  { a: 'UP', b: 'BR', type: 'water', severity: 1 },   // Ganga basin
  { a: 'RJ', b: 'GJ', type: 'water', severity: 1 },   // Narmada
  { a: 'AP', b: 'TN', type: 'water', severity: 2 },   // Krishna-Godavari downstream
  { a: 'PB', b: 'HR', type: 'food',  severity: 1 },   // Chandigarh / food supply
];

const STATUS_CFG = {
  green: { fill: '#22c55e', stroke: '#16a34a', glow: '0,200,80' },
  amber: { fill: '#f59e0b', stroke: '#d97706', glow: '245,158,11' },
  red:   { fill: '#ef4444', stroke: '#dc2626', glow: '239,68,68' },
  black: { fill: '#1f2937', stroke: '#ef4444', glow: '239,68,68' },
} as const;

const DISPUTE_COLOR = { water: '#38bdf8', power: '#fbbf24', food: '#4ade80' };
const SEV_WIDTH = [0, 0.8, 1.4, 2.0];

// Only show labels for larger states in default view
const ALWAYS_LABEL = new Set(['RJ','UP','MP','MH','GJ','KA','TN','AP','PB','BR','WB','JK','AS','OD','CG']);

const IndiaMap: React.FC<IndiaMapProps> = ({ onStateClick, selectedState, simulationCycle = 0 }) => {
  const [states, setStates] = useState<StateData[]>(indiaStates);
  const [hovered, setHovered] = useState<string | null>(null);

  // Drive state crises from simulation cycle
  useEffect(() => {
    setStates(indiaStates.map(s => {
      let status = s.status;
      // North India drought cascade (cycles 40–55)
      if (simulationCycle >= 40 && simulationCycle < 55) {
        if (s.id === 'RJ') status = 'red';
        if (simulationCycle >= 43 && s.id === 'HR') status = 'amber';
        if (simulationCycle >= 44 && s.id === 'UP') status = 'amber';
        if (simulationCycle >= 46 && s.id === 'MP') status = 'amber';
        if (simulationCycle >= 48 && s.id === 'PB') status = 'amber';
      }
      // South water conflict escalation (cycles 52–70)
      if (simulationCycle >= 52 && simulationCycle < 70) {
        if (s.id === 'KA') status = 'red';
        if (simulationCycle >= 54 && s.id === 'TN') status = 'red';
        if (simulationCycle >= 55 && s.id === 'AP') status = 'amber';
        if (simulationCycle >= 56 && s.id === 'MH') status = 'amber';
      }
      return { ...s, status };
    }));
  }, [simulationCycle]);

  const infoState = states.find(s => s.id === (hovered ?? selectedState));

  // Show dispute lines only from cycle 30+
  const activeDisputes = simulationCycle >= 30
    ? DISPUTE_EDGES.filter(e => simulationCycle >= 30 + e.severity * 5)
    : [];

  return (
    <div className="relative w-full h-full bg-[#070711] rounded-xl overflow-hidden border border-white/5">
      {/* Ambient bleed */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 35% 40%, rgba(56,189,248,0.05) 0%, transparent 70%)' }} />

      {/* Header bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-3 pb-1">
        <div>
          <p className="text-[11px] font-bold tracking-[0.18em] text-cyan-400/80 uppercase">India · Resource Monitor</p>
          <p className="text-[9px] text-gray-600 mt-0.5">Sim cycle {simulationCycle} / 100</p>
        </div>
        <div className="flex gap-3">
          {([['#22c55e','Stable'],['#f59e0b','Stressed'],['#ef4444','Critical']] as const).map(([c,l]) => (
            <div key={l} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: c, boxShadow: `0 0 5px ${c}` }} />
              <span className="text-[9px] text-gray-500">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── SVG Map ─────────────────────────────────────────────────────────── */}
      <svg viewBox="65 5 410 430" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="imap-glow-sm" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="imap-glow-lg" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Per-state clip/mask not needed; layered approach used */}
        </defs>

        {/* Ocean fill */}
        <rect x="65" y="5" width="410" height="430" fill="#040a14"/>

        {/* Dispute connection lines (rendered below states) */}
        {activeDisputes.map((e, i) => {
          const [ax, ay] = LABEL_POS[e.a] ?? [0, 0];
          const [bx, by] = LABEL_POS[e.b] ?? [0, 0];
          const col = DISPUTE_COLOR[e.type];
          return (
            <motion.line key={`${e.a}-${e.b}`}
              x1={ax} y1={ay} x2={bx} y2={by}
              stroke={col} strokeWidth={SEV_WIDTH[e.severity]}
              strokeDasharray="3 3"
              animate={{ strokeOpacity: [0.2, 0.75, 0.2] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.25 }}
            />
          );
        })}

        {/* State shapes */}
        {states.map(state => {
          const path = STATE_PATHS[state.id];
          const lp = LABEL_POS[state.id];
          if (!path || !lp) return null;

          const cfg = STATUS_CFG[state.status] ?? STATUS_CFG.green;
          const isH = hovered === state.id;
          const isS = selectedState === state.id;
          const isCrit = state.status === 'red' || state.status === 'black';
          const showLbl = ALWAYS_LABEL.has(state.id) || isH || isS;

          return (
            <g key={state.id} style={{ cursor: 'pointer' }}
              onClick={() => onStateClick?.(state)}
              onMouseEnter={() => setHovered(state.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Outer glow when active */}
              {(isH || isS) && (
                <path d={path} fill={cfg.fill} fillOpacity={0.22}
                  stroke="none" filter="url(#imap-glow-lg)" />
              )}
              {/* Main state polygon */}
              <motion.path d={path}
                fill={cfg.fill}
                stroke={isS ? '#38bdf8' : cfg.stroke}
                strokeWidth={isS ? 1.8 : 0.6}
                animate={{
                  fillOpacity: isCrit
                    ? [0.6, 0.9, 0.6]
                    : (isH || isS) ? 0.95 : 0.72,
                }}
                transition={{ duration: isCrit ? 1.8 : 0.2, repeat: isCrit ? Infinity : 0 }}
                filter={(isH || isS) ? 'url(#imap-glow-sm)' : undefined}
              />
              {/* State label */}
              {showLbl && (
                <text x={lp[0]} y={lp[1]}
                  textAnchor="middle" dominantBaseline="middle"
                  fill={isH || isS ? '#fff' : 'rgba(255,255,255,0.68)'}
                  fontSize={isH || isS ? 8 : 6.2}
                  fontWeight={isH || isS ? '700' : '500'}
                  style={{ pointerEvents: 'none', userSelect: 'none', letterSpacing: '0.02em' }}
                >{state.id}</text>
              )}
              {/* Critical alert dot */}
              {isCrit && (
                <motion.circle cx={lp[0] + 8} cy={lp[1] - 7} r={2}
                  fill={cfg.fill}
                  animate={{ r: [1.5, 3.5, 1.5], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </g>
          );
        })}

        {/* Cascade propagation arrows */}
        {simulationCycle >= 42 && simulationCycle < 55 && (
          <>
            <motion.path d="M 128,160 C 150,165 170,178 188,180"
              stroke="#ef4444" strokeWidth={1.5} fill="none" strokeDasharray="4 3"
              animate={{ opacity: [0, 0.9, 0] }} transition={{ duration: 1.8, repeat: Infinity }} />
            <motion.path d="M 188,180 C 206,175 225,170 252,162"
              stroke="#f59e0b" strokeWidth={1.2} fill="none" strokeDasharray="4 3"
              animate={{ opacity: [0, 0.7, 0] }} transition={{ duration: 1.8, repeat: Infinity, delay: 0.5 }} />
          </>
        )}
      </svg>

      {/* ── Info card ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {infoState && (
          <motion.div className="absolute bottom-3 left-3 z-20 rounded-xl p-3"
            style={{
              minWidth: 172,
              background: 'rgba(10,10,22,0.92)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(8px)',
            }}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">{infoState.name}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full capitalize font-semibold"
                style={{
                  color: STATUS_CFG[infoState.status]?.fill,
                  background: `${STATUS_CFG[infoState.status]?.fill}22`,
                  border: `1px solid ${STATUS_CFG[infoState.status]?.fill}44`,
                }}>{infoState.status}</span>
            </div>
            {([
              ['Water', infoState.resources.water, '#38bdf8'],
              ['Power', infoState.resources.power, '#fbbf24'],
              ['Agri',  infoState.resources.agriculture, '#4ade80'],
            ] as [string, number, string][]).map(([l, v, c]) => (
              <div key={l} className="mb-1.5">
                <div className="flex justify-between text-[9px] mb-0.5">
                  <span className="text-gray-500">{l}</span>
                  <span style={{ color: c }} className="font-mono font-bold">{v}%</span>
                </div>
                <div className="h-[3px] bg-gray-800 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ background: c }}
                    initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 0.5 }} />
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shock banner */}
      <AnimatePresence>
        {simulationCycle >= 42 && simulationCycle <= 47 && (
          <motion.div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap
            rounded-lg px-3 py-1.5"
            style={{ background:'rgba(127,17,17,0.9)', border:'1px solid rgba(239,68,68,0.7)' }}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping inline-block" />
              <span className="text-[10px] font-semibold text-red-200">DROUGHT SHOCK — Monsoon -42% · Cycle {simulationCycle}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IndiaMap;
