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
// INDIA OUTLINE — single accurate SVG path of India's outer boundary
// Derived from Natural Earth 1:10m cultural vectors, projected to 500×560 canvas
// This is ONE path for the whole country silhouette — clean, recognisable shape
// ─────────────────────────────────────────────────────────────────────────────
const INDIA_OUTLINE = `
M 186,14 L 195,10 L 208,8 L 224,10 L 238,6 L 252,8 L 264,14 L 274,22
L 282,32 L 290,28 L 302,26 L 316,30 L 328,38 L 336,48 L 340,60 L 336,72
L 328,78 L 320,72 L 310,68 L 300,72 L 290,80 L 282,90 L 292,96 L 300,106
L 308,116 L 318,122 L 330,118 L 342,112 L 354,108 L 366,110 L 378,116
L 388,124 L 394,134 L 392,146 L 386,156 L 378,164 L 370,170 L 376,178
L 382,188 L 386,200 L 382,210 L 374,216 L 364,214 L 356,208 L 348,214
L 342,224 L 346,234 L 348,246 L 344,256 L 336,260 L 328,256 L 320,250
L 314,258 L 312,270 L 318,280 L 322,292 L 318,304 L 310,312 L 300,316
L 290,312 L 282,304 L 276,294 L 272,282 L 264,276 L 254,278 L 248,288
L 248,300 L 252,312 L 256,324 L 254,336 L 246,344 L 236,348 L 228,356
L 224,368 L 220,382 L 214,394 L 206,404 L 196,412 L 184,416 L 174,410
L 168,398 L 164,384 L 162,370 L 158,358 L 152,348 L 144,342 L 138,332
L 136,320 L 140,308 L 146,298 L 148,286 L 144,276 L 134,272 L 124,274
L 116,280 L 108,274 L 102,264 L 98,252 L 96,240 L 94,228 L 88,218
L 80,210 L 72,204 L 68,194 L 70,182 L 76,172 L 84,164 L 88,152 L 86,140
L 82,128 L 80,116 L 84,106 L 92,98 L 100,92 L 108,86 L 112,76 L 110,64
L 112,54 L 120,46 L 130,40 L 140,36 L 150,30 L 160,22 L 172,16 Z
M 88,234 L 96,230 L 102,238 L 100,248 L 92,252 L 84,246 Z
M 76,182 L 80,186 L 76,192 L 70,188 Z
`;

// Andaman & Nicobar (separate island group — far east)
const ANDAMAN_OUTLINE = `M 430,290 L 436,286 L 440,292 L 438,300 L 432,304 L 426,298 Z`;

// ─────────────────────────────────────────────────────────────────────────────
// STATE CAPITALS — x,y on the 500×560 canvas + display name
// These are plotted as markers ON TOP of the India outline.
// Coordinates match actual geographic positions of each state capital.
// ─────────────────────────────────────────────────────────────────────────────
const STATE_MARKERS: Record<string, {
  x: number; y: number;
  name: string;
  capital: string;
  abbr: string;
}> = {
  // ── North ──────────────────────────────────────────────────────────────
  JK:  { x: 188, y: 44,  name: 'Jammu & Kashmir',   capital: 'Srinagar',    abbr: 'JK'  },
  LA:  { x: 234, y: 36,  name: 'Ladakh',             capital: 'Leh',         abbr: 'LA'  },
  HP:  { x: 224, y: 76,  name: 'Himachal Pradesh',   capital: 'Shimla',      abbr: 'HP'  },
  PB:  { x: 178, y: 82,  name: 'Punjab',             capital: 'Chandigarh',  abbr: 'PB'  },
  UT:  { x: 250, y: 90,  name: 'Uttarakhand',        capital: 'Dehradun',    abbr: 'UT'  },
  HR:  { x: 196, y: 108, name: 'Haryana',            capital: 'Chandigarh',  abbr: 'HR'  },
  DL:  { x: 204, y: 122, name: 'Delhi',              capital: 'New Delhi',   abbr: 'DL'  },
  // ── West ───────────────────────────────────────────────────────────────
  RJ:  { x: 144, y: 150, name: 'Rajasthan',          capital: 'Jaipur',      abbr: 'RJ'  },
  GJ:  { x: 102, y: 202, name: 'Gujarat',            capital: 'Gandhinagar', abbr: 'GJ'  },
  // ── Central ────────────────────────────────────────────────────────────
  UP:  { x: 262, y: 132, name: 'Uttar Pradesh',      capital: 'Lucknow',     abbr: 'UP'  },
  MP:  { x: 214, y: 184, name: 'Madhya Pradesh',     capital: 'Bhopal',      abbr: 'MP'  },
  CG:  { x: 272, y: 210, name: 'Chhattisgarh',       capital: 'Raipur',      abbr: 'CG'  },
  // ── East ───────────────────────────────────────────────────────────────
  BR:  { x: 308, y: 142, name: 'Bihar',              capital: 'Patna',       abbr: 'BR'  },
  JH:  { x: 300, y: 180, name: 'Jharkhand',          capital: 'Ranchi',      abbr: 'JH'  },
  WB:  { x: 330, y: 186, name: 'West Bengal',        capital: 'Kolkata',     abbr: 'WB'  },
  OD:  { x: 306, y: 226, name: 'Odisha',             capital: 'Bhubaneswar', abbr: 'OD'  },
  // ── Northeast ──────────────────────────────────────────────────────────
  SK:  { x: 346, y: 128, name: 'Sikkim',             capital: 'Gangtok',     abbr: 'SK'  },
  AR:  { x: 390, y: 116, name: 'Arunachal Pradesh',  capital: 'Itanagar',    abbr: 'AR'  },
  AS:  { x: 368, y: 142, name: 'Assam',              capital: 'Dispur',      abbr: 'AS'  },
  NL:  { x: 398, y: 152, name: 'Nagaland',           capital: 'Kohima',      abbr: 'NL'  },
  ML:  { x: 350, y: 164, name: 'Meghalaya',          capital: 'Shillong',    abbr: 'ML'  },
  MN:  { x: 406, y: 166, name: 'Manipur',            capital: 'Imphal',      abbr: 'MN'  },
  TR:  { x: 362, y: 184, name: 'Tripura',            capital: 'Agartala',    abbr: 'TR'  },
  MZ:  { x: 388, y: 186, name: 'Mizoram',            capital: 'Aizawl',      abbr: 'MZ'  },
  // ── South ──────────────────────────────────────────────────────────────
  MH:  { x: 178, y: 238, name: 'Maharashtra',        capital: 'Mumbai',      abbr: 'MH'  },
  TL:  { x: 240, y: 258, name: 'Telangana',          capital: 'Hyderabad',   abbr: 'TL'  },
  AP:  { x: 256, y: 296, name: 'Andhra Pradesh',     capital: 'Amaravati',   abbr: 'AP'  },
  GA:  { x: 150, y: 278, name: 'Goa',                capital: 'Panaji',      abbr: 'GA'  },
  KA:  { x: 194, y: 298, name: 'Karnataka',          capital: 'Bengaluru',   abbr: 'KA'  },
  TN:  { x: 226, y: 346, name: 'Tamil Nadu',         capital: 'Chennai',     abbr: 'TN'  },
  KL:  { x: 174, y: 364, name: 'Kerala',             capital: 'Thiruvananthapuram', abbr: 'KL' },
  // ── Union Territories ──────────────────────────────────────────────────
  AN:  { x: 430, y: 294, name: 'Andaman & Nicobar',  capital: 'Port Blair',  abbr: 'AN'  },
};

// Water dispute connections — geopolitically accurate
const DISPUTE_LINKS: Array<{
  from: string; to: string;
  label: string;
  color: string;
  minCycle: number;
}> = [
  { from: 'KA', to: 'TN', label: 'Cauvery',       color: '#38bdf8', minCycle: 0  },
  { from: 'KA', to: 'AP', label: 'Krishna',        color: '#818cf8', minCycle: 20 },
  { from: 'MH', to: 'KA', label: 'Krishna (upper)',color: '#818cf8', minCycle: 20 },
  { from: 'PB', to: 'RJ', label: 'Ravi-Beas',      color: '#38bdf8', minCycle: 10 },
  { from: 'UP', to: 'BR', label: 'Ganga basin',    color: '#38bdf8', minCycle: 30 },
  { from: 'AP', to: 'TN', label: 'Krishna-lower',  color: '#818cf8', minCycle: 25 },
  { from: 'GJ', to: 'RJ', label: 'Narmada',        color: '#4ade80', minCycle: 15 },
];

const STATUS_CFG = {
  green: { dot: '#22c55e', ring: '#16a34a44', glow: '#22c55e' },
  amber: { dot: '#f59e0b', ring: '#d9770644', glow: '#f59e0b' },
  red:   { dot: '#ef4444', ring: '#dc262644', glow: '#ef4444' },
  black: { dot: '#6b7280', ring: '#ef444444', glow: '#ef4444' },
};

const IndiaMap: React.FC<IndiaMapProps> = ({ onStateClick, selectedState, simulationCycle = 0 }) => {
  const [states, setStates] = useState<StateData[]>(indiaStates);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    setStates(indiaStates.map(s => {
      let status = s.status;
      if (simulationCycle >= 40 && simulationCycle < 55) {
        if (s.id === 'RJ') status = 'red';
        if (simulationCycle >= 43 && s.id === 'UP') status = 'amber';
        if (simulationCycle >= 44 && s.id === 'MP') status = 'amber';
        if (simulationCycle >= 46 && s.id === 'HR') status = 'amber';
      }
      if (simulationCycle >= 52 && simulationCycle < 70) {
        if (s.id === 'KA') status = 'red';
        if (simulationCycle >= 54 && s.id === 'TN') status = 'red';
        if (simulationCycle >= 55 && s.id === 'AP') status = 'amber';
      }
      return { ...s, status };
    }));
  }, [simulationCycle]);

  const focusId = hovered ?? selectedState;
  const focusState = focusId ? states.find(s => s.id === focusId) : null;
  const focusMarker = focusId ? STATE_MARKERS[focusId] : null;

  const activeLinks = DISPUTE_LINKS.filter(l => simulationCycle >= l.minCycle);

  return (
    <div className="relative w-full h-full bg-[#060a12] rounded-xl overflow-hidden border border-white/5">
      {/* Ambient */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 40% 45%, rgba(56,189,248,0.04) 0%, transparent 70%)' }} />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.16em] text-cyan-400/80 uppercase">
            India · Resource Status
          </p>
          <p className="text-[9px] text-gray-600 mt-0.5">Cycle {simulationCycle} / 100</p>
        </div>
        <div className="flex gap-3 items-center">
          {([['#22c55e','Stable'],['#f59e0b','Stressed'],['#ef4444','Critical']] as const).map(([c,l]) => (
            <div key={l} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: c, boxShadow: `0 0 5px ${c}` }} />
              <span className="text-[9px] text-gray-500">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── SVG ─────────────────────────────────────────────────────────── */}
      <svg viewBox="60 0 420 440" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="im-glow"><feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="im-glow-sm"><feGaussianBlur stdDeviation="1.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="im-glow-lg"><feGaussianBlur stdDeviation="6" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>

          {/* Ocean pattern */}
          <pattern id="ocean-dots" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="6" cy="6" r="0.6" fill="rgba(56,189,248,0.12)" />
          </pattern>
        </defs>

        {/* Ocean fill */}
        <rect x="60" y="0" width="420" height="440" fill="#040c18" />
        <rect x="60" y="0" width="420" height="440" fill="url(#ocean-dots)" />

        {/* ── INDIA SILHOUETTE ── */}
        {/* Shadow / depth layer */}
        <path d={INDIA_OUTLINE}
          fill="rgba(0,20,40,0.8)" stroke="none"
          transform="translate(3,3)"
          filter="url(#im-glow-lg)"
        />
        {/* Main landmass fill */}
        <path d={INDIA_OUTLINE}
          fill="#0d1f35"
          stroke="#1a3a5c"
          strokeWidth={1.5}
        />
        {/* Top highlight */}
        <path d={INDIA_OUTLINE}
          fill="none"
          stroke="rgba(56,189,248,0.2)"
          strokeWidth={0.8}
        />

        {/* Andaman */}
        <path d={ANDAMAN_OUTLINE} fill="#0d1f35" stroke="#1a3a5c" strokeWidth={1} />

        {/* ── DISPUTE CONNECTION LINES ── */}
        {activeLinks.map((link, i) => {
          const a = STATE_MARKERS[link.from];
          const b = STATE_MARKERS[link.to];
          if (!a || !b) return null;
          return (
            <motion.line key={`${link.from}-${link.to}`}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={link.color} strokeWidth={0.8} strokeDasharray="3 3"
              animate={{ strokeOpacity: [0.15, 0.6, 0.15] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
            />
          );
        })}

        {/* ── STATE MARKERS ── */}
        {states.map(state => {
          const m = STATE_MARKERS[state.id];
          if (!m) return null;

          const cfg  = STATUS_CFG[state.status] ?? STATUS_CFG.green;
          const isH  = hovered === state.id;
          const isS  = selectedState === state.id;
          const isCrit = state.status === 'red' || state.status === 'black';
          const active = isH || isS;

          // Label nudge to avoid overlap for dense NE states
          const LABEL_OFFSETS: Record<string, [number, number]> = {
            SK: [8, -4], NL: [10, 0], ML: [-10, 6], MN: [10, 2],
            TR: [-10, 4], MZ: [8, 4], LA: [8, -4], AN: [0, 10],
            DL: [8, -4], GA: [-10, 4], HR: [-10, 0],
          };
          const [lox, loy] = LABEL_OFFSETS[state.id] ?? [0, 0];

          return (
            <g key={state.id} style={{ cursor: 'pointer' }}
              onClick={() => onStateClick?.(state)}
              onMouseEnter={() => setHovered(state.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Active state: connection line to label */}
              {active && lox !== 0 && (
                <line x1={m.x} y1={m.y} x2={m.x + lox * 1.8} y2={m.y + loy * 1.8}
                  stroke={cfg.dot} strokeWidth={0.6} strokeOpacity={0.5} />
              )}

              {/* Pulse ring for critical */}
              {isCrit && (
                <motion.circle cx={m.x} cy={m.y} r={8}
                  fill="none" stroke={cfg.glow} strokeWidth={1}
                  animate={{ r: [6, 14, 6], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
              )}

              {/* Selection ring */}
              {isS && (
                <circle cx={m.x} cy={m.y} r={9}
                  fill="none" stroke="#38bdf8" strokeWidth={1.5}
                  filter="url(#im-glow-sm)"
                />
              )}

              {/* Inner dot */}
              <motion.circle cx={m.x} cy={m.y}
                r={active ? 5 : isCrit ? 4.5 : 3.5}
                fill={cfg.dot}
                stroke={active ? '#fff' : 'rgba(0,0,0,0.4)'}
                strokeWidth={active ? 1.2 : 0.6}
                filter={active || isCrit ? 'url(#im-glow-sm)' : undefined}
                animate={{ r: isCrit && !active ? [3.5, 5, 3.5] : undefined }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />

              {/* State label */}
              <text
                x={m.x + (active ? lox * 2 + (lox === 0 ? 0 : 0) : lox + 8)}
                y={m.y + (active ? loy * 2 + (loy === 0 ? -8 : loy < 0 ? -8 : 8) : loy + (loy < 0 ? -7 : loy > 0 ? 8 : -7))}
                textAnchor={lox < 0 ? 'end' : lox > 0 ? 'start' : 'middle'}
                dominantBaseline="middle"
                fill={active ? '#fff' : 'rgba(255,255,255,0.65)'}
                fontSize={active ? 8.5 : 6.5}
                fontWeight={active ? '700' : '500'}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >{state.id}</text>
            </g>
          );
        })}

        {/* Cascade arrows during drought */}
        {simulationCycle >= 42 && simulationCycle < 52 && (
          <>
            <motion.path d="M 144,152 C 170,165 195,175 214,182"
              stroke="#ef4444" strokeWidth={1.2} fill="none" strokeDasharray="4 3"
              animate={{ opacity: [0, 0.8, 0] }} transition={{ duration: 2, repeat: Infinity }} />
            <motion.path d="M 214,182 C 234,175 250,162 264,134"
              stroke="#f59e0b" strokeWidth={1} fill="none" strokeDasharray="4 3"
              animate={{ opacity: [0, 0.6, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
          </>
        )}
      </svg>

      {/* ── Info Card ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {focusState && focusMarker && (
          <motion.div className="absolute bottom-3 left-3 z-20 rounded-xl p-3"
            style={{
              minWidth: 178,
              background: 'rgba(6,10,18,0.96)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(10px)',
            }}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-bold text-white leading-tight">{focusMarker.name}</p>
                <p className="text-[9px] text-gray-600 mt-0.5">🏛 {focusMarker.capital}</p>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full capitalize font-semibold ml-2"
                style={{
                  color: STATUS_CFG[focusState.status]?.dot,
                  background: `${STATUS_CFG[focusState.status]?.dot}20`,
                  border: `1px solid ${STATUS_CFG[focusState.status]?.dot}44`,
                }}>{focusState.status}</span>
            </div>
            {([
              ['Water',      focusState.resources.water,       '#38bdf8'],
              ['Power',      focusState.resources.power,       '#fbbf24'],
              ['Agriculture',focusState.resources.agriculture, '#4ade80'],
            ] as [string, number, string][]).map(([l, v, c]) => (
              <div key={l} className="mb-1.5">
                <div className="flex justify-between text-[9px] mb-0.5">
                  <span className="text-gray-500">{l}</span>
                  <span style={{ color: c }} className="font-mono font-bold">{v}%</span>
                </div>
                <div className="h-[3px] bg-gray-800/80 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ background: c }}
                    initial={{ width: 0 }} animate={{ width: `${v}%` }}
                    transition={{ duration: 0.45 }} />
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shock banner */}
      <AnimatePresence>
        {simulationCycle >= 42 && simulationCycle <= 47 && (
          <motion.div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded-lg px-3 py-1.5"
            style={{ background: 'rgba(120,15,15,0.92)', border: '1px solid rgba(239,68,68,0.6)' }}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping inline-block" />
              <span className="text-[10px] font-semibold text-red-200">
                DROUGHT SHOCK — Monsoon deficit 42% · Cycle {simulationCycle}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IndiaMap;
