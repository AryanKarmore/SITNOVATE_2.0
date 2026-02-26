import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { indiaStates } from '@/data/indiaStates';
import type { StateData } from '@/types';

interface IndiaMapProps {
  onStateClick?: (state: StateData) => void;
  selectedState?: string | null;
  simulationCycle?: number;
}

const IndiaMap: React.FC<IndiaMapProps> = ({ onStateClick, selectedState, simulationCycle = 0 }) => {
  const [states, setStates] = useState<StateData[]>(indiaStates);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  useEffect(() => {
    // Simulate state changes based on simulation cycle
    const updatedStates = indiaStates.map(state => {
      let newStatus = state.status;
      
      // Simulate cascade effects during drought
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return '#00ff88';
      case 'amber': return '#f7c600';
      case 'red': return '#ff3333';
      case 'black': return '#1a1a1a';
      default: return '#00ff88';
    }
  };

  const getStatusGlow = (status: string) => {
    switch (status) {
      case 'green': return '0 0 20px rgba(0, 255, 136, 0.6)';
      case 'amber': return '0 0 20px rgba(247, 198, 0, 0.6)';
      case 'red': return '0 0 25px rgba(255, 51, 51, 0.8)';
      case 'black': return '0 0 30px rgba(255, 0, 0, 0.9)';
      default: return '0 0 20px rgba(0, 255, 136, 0.6)';
    }
  };

  // Simplified SVG paths for Indian states
  const statePaths: Record<string, string> = {
    'JK': 'M160,60 L200,50 L220,80 L200,100 L170,95 L150,80 Z',
    'PB': 'M180,120 L220,115 L230,140 L200,155 L175,145 Z',
    'HP': 'M210,90 L250,85 L260,110 L230,120 L215,110 Z',
    'HR': 'M190,155 L230,150 L240,175 L210,190 L185,180 Z',
    'DL': 'M220,175 L235,172 L238,185 L225,188 Z',
    'RJ': 'M120,160 L180,155 L190,200 L150,230 L100,210 L110,180 Z',
    'UP': 'M240,150 L320,145 L330,200 L280,220 L240,200 L235,170 Z',
    'BR': 'M320,200 L380,195 L390,230 L340,250 L315,230 Z',
    'UT': 'M230,120 L260,115 L265,140 L240,145 Z',
    'SK': 'M400,160 L430,155 L435,180 L410,185 Z',
    'AR': 'M450,140 L500,130 L510,160 L470,175 L455,165 Z',
    'NL': 'M460,180 L490,175 L495,200 L465,205 Z',
    'MN': 'M450,210 L480,205 L485,230 L455,235 Z',
    'MZ': 'M430,230 L460,225 L465,250 L435,255 Z',
    'TR': 'M400,240 L430,235 L435,260 L405,265 Z',
    'ML': 'M410,200 L440,195 L445,220 L415,225 Z',
    'AS': 'M400,180 L450,175 L455,200 L410,210 L405,195 Z',
    'WB': 'M350,230 L400,225 L410,260 L370,280 L345,260 Z',
    'JH': 'M310,240 L350,235 L355,270 L320,280 L308,260 Z',
    'OD': 'M290,280 L340,275 L350,310 L310,320 L285,300 Z',
    'CG': 'M250,260 L300,255 L305,290 L260,300 L245,280 Z',
    'MP': 'M200,220 L260,215 L270,260 L230,280 L195,260 Z',
    'GJ': 'M80,230 L140,225 L150,270 L100,290 L70,270 Z',
    'MH': 'M140,280 L200,275 L210,330 L160,350 L130,320 Z',
    'GA': 'M120,350 L150,345 L155,365 L125,370 Z',
    'KA': 'M150,360 L210,355 L220,400 L170,420 L145,390 Z',
    'TL': 'M200,330 L250,325 L255,360 L210,370 L198,350 Z',
    'AP': 'M230,360 L290,355 L300,400 L250,410 L228,390 Z',
    'TN': 'M200,400 L260,395 L270,450 L220,470 L195,430 Z',
    'KL': 'M170,420 L200,415 L210,460 L175,480 L165,450 Z',
  };

  return (
    <div className="relative w-full h-full bg-[#0a0a0f] rounded-xl overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 grid-bg opacity-50" />
      
      {/* Title */}
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-xl font-bold text-white neon-text">Live India State Map</h3>
        <p className="text-sm text-gray-400 mt-1">Cycle: {simulationCycle} | Real-time Resource Status</p>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-10 glass rounded-lg p-3">
        <div className="text-xs font-semibold text-gray-300 mb-2">Status Legend</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: '#00ff88', boxShadow: '0 0 8px #00ff88' }} />
            <span className="text-xs text-gray-300">Stable (Green)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: '#f7c600', boxShadow: '0 0 8px #f7c600' }} />
            <span className="text-xs text-gray-300">Stressed (Amber)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: '#ff3333', boxShadow: '0 0 8px #ff3333' }} />
            <span className="text-xs text-gray-300">Critical (Red)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-red-500" style={{ background: '#1a1a1a' }} />
            <span className="text-xs text-gray-300">Collapsed (Black)</span>
          </div>
        </div>
      </div>

      {/* SVG Map */}
      <svg viewBox="0 0 550 500" className="w-full h-full">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Render states */}
        {states.map((state) => (
          <motion.g key={state.id}>
            <motion.path
              d={statePaths[state.id] || ''}
              fill={getStatusColor(state.status)}
              stroke={selectedState === state.id ? '#00d4ff' : '#2a2a3a'}
              strokeWidth={selectedState === state.id ? 3 : 1}
              style={{
                filter: selectedState === state.id ? 'url(#glow)' : 'none',
                cursor: 'pointer',
              }}
              animate={{
                fill: getStatusColor(state.status),
                boxShadow: getStatusGlow(state.status),
              }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              onClick={() => onStateClick?.(state)}
              onMouseEnter={() => setHoveredState(state.id)}
              onMouseLeave={() => setHoveredState(null)}
              whileHover={{ scale: 1.02 }}
            />
            
            {/* State Label */}
            <text
              x={state.position.x}
              y={state.position.y}
              textAnchor="middle"
              fill={hoveredState === state.id || selectedState === state.id ? '#ffffff' : 'rgba(255,255,255,0.7)'}
              fontSize="8"
              fontWeight={hoveredState === state.id || selectedState === state.id ? 'bold' : 'normal'}
              style={{ pointerEvents: 'none' }}
            >
              {state.id}
            </text>
            
            {/* Status Indicator */}
            <motion.circle
              cx={state.position.x + 15}
              cy={state.position.y - 8}
              r={4}
              fill={getStatusColor(state.status)}
              animate={{
                opacity: state.status === 'red' || state.status === 'black' ? [0.5, 1, 0.5] : 1,
              }}
              transition={{
                duration: 1.5,
                repeat: state.status === 'red' || state.status === 'black' ? Infinity : 0,
              }}
            />
          </motion.g>
        ))}
        
        {/* Cascade Effect Lines */}
        {simulationCycle > 40 && simulationCycle < 55 && (
          <>
            <motion.line
              x1={150} y1={200} x2={280} y2={200}
              stroke="#ff3333"
              strokeWidth="2"
              strokeDasharray="5,5"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.line
              x1={280} y1={200} x2={230} y2={260}
              stroke="#f7c600"
              strokeWidth="2"
              strokeDasharray="5,5"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
          </>
        )}
      </svg>

      {/* Tooltip */}
      {hoveredState && (
        <div className="absolute bottom-4 left-4 glass rounded-lg p-3 z-20">
          {(() => {
            const state = states.find(s => s.id === hoveredState);
            if (!state) return null;
            return (
              <div>
                <div className="text-sm font-bold text-white">{state.name}</div>
                <div className="text-xs text-gray-400 mt-1">Status: <span className="capitalize" style={{ color: getStatusColor(state.status) }}>{state.status}</span></div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Water:</span>
                    <span className="text-cyan-400">{state.resources.water}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Power:</span>
                    <span className="text-yellow-400">{state.resources.power}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Agriculture:</span>
                    <span className="text-green-400">{state.resources.agriculture}%</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default IndiaMap;
