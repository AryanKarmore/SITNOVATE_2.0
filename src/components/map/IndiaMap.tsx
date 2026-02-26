import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { indiaStates } from '@/data/indiaStates';
import type { StateData } from '@/types';

interface IndiaMapProps {
  onStateClick?: (state: StateData) => void;
  selectedState?: string | null;
  simulationCycle?: number;
}

// Realistic SVG paths for Indian states - hardcoded with proper geography
const STATE_PATHS: Record<string, string> = {
  'JK': 'M 155 25 L 175 20 L 200 22 L 215 30 L 220 45 L 210 60 L 195 65 L 185 75 L 170 72 L 158 65 L 148 55 L 150 40 Z',
  'HP': 'M 195 65 L 215 60 L 230 65 L 240 75 L 235 88 L 220 92 L 205 88 L 195 78 Z',
  'PB': 'M 170 72 L 185 75 L 195 78 L 195 92 L 185 100 L 172 98 L 162 90 L 160 80 Z',
  'UT': 'M 220 92 L 235 88 L 248 92 L 252 105 L 242 115 L 228 112 L 218 105 Z',
  'HR': 'M 172 98 L 185 100 L 195 95 L 200 108 L 195 120 L 182 122 L 170 115 L 168 106 Z',
  'DL': 'M 190 108 L 198 108 L 200 116 L 193 118 L 188 114 Z',
  'RJ': 'M 120 95 L 162 90 L 170 115 L 165 130 L 168 150 L 160 168 L 148 180 L 130 185 L 110 180 L 98 168 L 95 150 L 100 130 L 108 112 Z',
  'UP': 'M 195 120 L 200 108 L 215 105 L 228 112 L 242 115 L 260 118 L 272 125 L 278 140 L 272 155 L 255 162 L 238 160 L 220 155 L 205 148 L 195 138 Z',
  'BR': 'M 278 140 L 295 135 L 312 138 L 325 148 L 328 162 L 318 172 L 300 175 L 282 170 L 272 155 Z',
  'SK': 'M 335 138 L 345 135 L 352 140 L 350 150 L 340 152 L 333 146 Z',
  'AR': 'M 355 120 L 380 115 L 400 118 L 415 128 L 410 142 L 395 148 L 375 148 L 358 142 L 350 132 Z',
  'NL': 'M 380 148 L 395 145 L 405 152 L 402 165 L 390 168 L 378 162 Z',
  'AS': 'M 318 148 L 340 152 L 360 148 L 380 148 L 390 152 L 400 160 L 395 172 L 378 175 L 355 172 L 335 168 L 318 165 Z',
  'MN': 'M 395 168 L 408 165 L 415 172 L 412 183 L 400 185 L 392 178 Z',
  'MZ': 'M 385 182 L 398 178 L 405 185 L 402 198 L 390 200 L 382 192 Z',
  'TR': 'M 368 178 L 382 175 L 388 182 L 382 192 L 370 192 L 364 184 Z',
  'ML': 'M 348 168 L 365 165 L 375 170 L 372 180 L 358 182 L 345 176 Z',
  'WB': 'M 300 175 L 318 172 L 330 178 L 332 195 L 325 210 L 312 218 L 298 215 L 290 200 L 288 185 Z',
  'JH': 'M 272 170 L 290 168 L 300 175 L 295 190 L 282 200 L 268 198 L 258 188 L 258 175 Z',
  'OD': 'M 278 200 L 295 195 L 312 200 L 318 215 L 312 232 L 298 240 L 280 238 L 265 228 L 262 212 Z',
  'CG': 'M 242 178 L 260 172 L 272 178 L 278 195 L 272 212 L 258 220 L 242 218 L 228 208 L 225 192 Z',
  'MP': 'M 168 150 L 190 145 L 210 148 L 225 155 L 235 165 L 240 180 L 232 195 L 215 200 L 195 198 L 178 190 L 165 178 L 162 165 Z',
  'GJ': 'M 95 150 L 115 148 L 130 155 L 140 165 L 145 180 L 140 198 L 128 210 L 112 215 L 95 210 L 82 200 L 78 185 L 82 168 Z',
  'MH': 'M 145 180 L 162 175 L 180 178 L 195 185 L 205 198 L 210 215 L 202 232 L 188 242 L 170 245 L 150 240 L 135 228 L 128 212 L 130 196 Z',
  'TL': 'M 210 215 L 228 210 L 242 215 L 248 228 L 242 242 L 228 248 L 212 245 L 205 232 Z',
  'AP': 'M 228 248 L 245 242 L 262 245 L 270 258 L 265 272 L 250 278 L 232 275 L 220 262 Z',
  'GA': 'M 148 245 L 162 242 L 168 250 L 162 258 L 150 258 L 144 250 Z',
  'KA': 'M 150 245 L 170 245 L 188 248 L 198 260 L 202 275 L 195 290 L 182 300 L 165 302 L 150 295 L 140 282 L 138 268 L 142 255 Z',
  'TN': 'M 195 290 L 212 285 L 228 285 L 240 295 L 245 310 L 238 325 L 225 335 L 210 338 L 195 330 L 185 318 L 182 305 Z',
  'KL': 'M 165 302 L 182 305 L 185 320 L 180 338 L 170 348 L 158 342 L 152 328 L 152 312 Z',
};

// Label positions for state abbreviations
const STATE_LABELS: Record<string, { x: number; y: number }> = {
  'JK': { x: 183, y: 45 },
  'HP': { x: 218, y: 78 },
  'PB': { x: 180, y: 87 },
  'UT': { x: 235, y: 103 },
  'HR': { x: 183, y: 110 },
  'DL': { x: 194, y: 113 },
  'RJ': { x: 132, y: 140 },
  'UP': { x: 237, y: 138 },
  'BR': { x: 300, y: 156 },
  'SK': { x: 342, y: 144 },
  'AR': { x: 382, y: 133 },
  'NL': { x: 391, y: 158 },
  'AS': { x: 358, y: 160 },
  'MN': { x: 403, y: 176 },
  'MZ': { x: 393, y: 190 },
  'TR': { x: 376, y: 185 },
  'ML': { x: 360, y: 173 },
  'WB': { x: 310, y: 196 },
  'JH': { x: 278, y: 185 },
  'OD': { x: 290, y: 218 },
  'CG': { x: 252, y: 198 },
  'MP': { x: 200, y: 175 },
  'GJ': { x: 112, y: 183 },
  'MH': { x: 170, y: 212 },
  'TL': { x: 228, y: 230 },
  'AP': { x: 248, y: 262 },
  'GA': { x: 156, y: 252 },
  'KA': { x: 168, y: 275 },
  'TN': { x: 215, y: 312 },
  'KL': { x: 168, y: 325 },
};

const IndiaMap: React.FC<IndiaMapProps> = ({ onStateClick, selectedState, simulationCycle = 0 }) => {
  const [states, setStates] = useState<StateData[]>(indiaStates);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  useEffect(() => {
    const updatedStates = indiaStates.map(state => {
      let newStatus = state.status;

      if (simulationCycle > 40 && simulationCycle < 50) {
        if (state.id === 'RJ') newStatus = 'red';
        if (state.id === 'UP' && simulationCycle > 42) newStatus = 'amber';
        if (state.id === 'MP' && simulationCycle > 44) newStatus = 'amber';
      }

      if (simulationCycle > 50 && simulationCycle < 60) {
        if (state.id === 'MH') newStatus = 'red';
        if (state.id === 'KA' && simulationCycle > 52) newStatus = 'red';
        if (state.id === 'TN' && simulationCycle > 54) newStatus = 'red';
      }

      return { ...state, status: newStatus };
    });

    setStates(updatedStates);
  }, [simulationCycle]);

  const getStatusColor = (status: string, opacity = 1) => {
    switch (status) {
      case 'green': return `rgba(0, 255, 136, ${opacity})`;
      case 'amber': return `rgba(247, 198, 0, ${opacity})`;
      case 'red': return `rgba(255, 51, 51, ${opacity})`;
      case 'black': return `rgba(26, 26, 26, ${opacity})`;
      default: return `rgba(0, 255, 136, ${opacity})`;
    }
  };

  const getStatusStroke = (status: string) => {
    switch (status) {
      case 'green': return '#00cc6a';
      case 'amber': return '#c49a00';
      case 'red': return '#cc0000';
      case 'black': return '#ff3333';
      default: return '#00cc6a';
    }
  };

  const hoveredStateData = hoveredState ? states.find(s => s.id === hoveredState) : null;

  return (
    <div className="relative w-full h-full bg-[#0a0a0f] rounded-xl overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-50" />

      {/* Title */}
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-lg font-bold text-white neon-text">Live India State Map</h3>
        <p className="text-xs text-gray-400 mt-0.5">Cycle: {simulationCycle} | Real-time Resource Status</p>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-10 glass rounded-lg p-2.5">
        <div className="text-xs font-semibold text-gray-300 mb-1.5">Status</div>
        <div className="space-y-1">
          {[
            { color: '#00ff88', label: 'Stable' },
            { color: '#f7c600', label: 'Stressed' },
            { color: '#ff3333', label: 'Critical' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
              <span className="text-xs text-gray-300">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Map */}
      <svg
        viewBox="60 15 380 345"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="map-glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="selected-glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Render states */}
        {states.map((state) => {
          const path = STATE_PATHS[state.id];
          const label = STATE_LABELS[state.id];
          if (!path || !label) return null;

          const isSelected = selectedState === state.id;
          const isHovered = hoveredState === state.id;

          return (
            <g key={state.id} style={{ cursor: 'pointer' }}>
              <motion.path
                d={path}
                fill={getStatusColor(state.status, isHovered || isSelected ? 1 : 0.75)}
                stroke={isSelected ? '#00d4ff' : getStatusStroke(state.status)}
                strokeWidth={isSelected ? 2 : 0.8}
                filter={isSelected ? 'url(#selected-glow)' : isHovered ? 'url(#map-glow)' : undefined}
                onClick={() => onStateClick?.(state)}
                onMouseEnter={() => setHoveredState(state.id)}
                onMouseLeave={() => setHoveredState(null)}
                animate={{
                  fill: getStatusColor(state.status, isHovered || isSelected ? 1 : 0.75),
                }}
                transition={{ duration: 0.5 }}
              />

              {/* State label - only show if hovered or selected or for major states */}
              {(isHovered || isSelected || ['RJ', 'UP', 'MP', 'MH', 'GJ', 'KA', 'TN', 'PB', 'BR', 'WB', 'AP'].includes(state.id)) && (
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isHovered || isSelected ? '#ffffff' : 'rgba(255,255,255,0.65)'}
                  fontSize={isHovered || isSelected ? '7' : '5.5'}
                  fontWeight={isHovered || isSelected ? 'bold' : 'normal'}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {state.id}
                </text>
              )}

              {/* Pulsing indicator for critical states */}
              {(state.status === 'red' || state.status === 'black') && (
                <motion.circle
                  cx={label.x + 6}
                  cy={label.y - 5}
                  r={2.5}
                  fill={getStatusColor(state.status)}
                  animate={{ opacity: [0.4, 1, 0.4], r: [2, 3, 2] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </g>
          );
        })}

        {/* Cascade Effect Lines during drought */}
        {simulationCycle > 40 && simulationCycle < 55 && (
          <>
            <motion.line
              x1={132} y1={155} x2={200} y2={175}
              stroke="#ff3333"
              strokeWidth="1.5"
              strokeDasharray="4,3"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.9, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.line
              x1={200} y1={175} x2={237} y2={138}
              stroke="#f7c600"
              strokeWidth="1.5"
              strokeDasharray="4,3"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
          </>
        )}
      </svg>

      {/* Hover Tooltip */}
      {hoveredStateData && (
        <div className="absolute bottom-4 left-4 glass rounded-lg p-3 z-20 min-w-[160px]">
          <div className="text-sm font-bold text-white">{hoveredStateData.name}</div>
          <div className="text-xs mt-1 mb-2" style={{ color: getStatusColor(hoveredStateData.status) }}>
            ● {hoveredStateData.status.charAt(0).toUpperCase() + hoveredStateData.status.slice(1)}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Water</span>
              <span className="text-cyan-400 font-mono">{hoveredStateData.resources.water}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Power</span>
              <span className="text-yellow-400 font-mono">{hoveredStateData.resources.power}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Agri</span>
              <span className="text-green-400 font-mono">{hoveredStateData.resources.agriculture}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndiaMap;
