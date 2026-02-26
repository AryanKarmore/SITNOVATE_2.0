import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { indiaStates } from '@/data/indiaStates';

const StrategyHeatmap: React.FC = () => {
  const [selectedState, setSelectedState] = useState<string>('RJ');
  const [viewMode, setViewMode] = useState<'early' | 'late'>('late');

  const allActions = [
    'Offer long-term water sharing deal',
    'Build solar & beg for grid connectivity',
    'Request central drought assistance',
    'Import food from neighboring states',
    'Negotiate water release agreements',
    'Build micro-irrigation infrastructure',
    'File Supreme Court petitions',
    'Build seawater desalination plants',
    'Declare drought emergency',
    'Request inter-basin water transfer',
    'Maintain foodgrain supply commitments',
    'Invest in crop diversification',
  ];

  const stateActionData: Record<string, Record<string, { early: number; late: number }>> = {
    'RJ': {
      'Offer long-term water sharing deal': { early: 15, late: 73 },
      'Build solar & beg for grid connectivity': { early: 12, late: 68 },
      'Request central drought assistance': { early: 45, late: 45 },
      'Import food from neighboring states': { early: 38, late: 38 },
    },
    'KA': {
      'Negotiate water release agreements': { early: 20, late: 65 },
      'Build micro-irrigation infrastructure': { early: 18, late: 58 },
      'File Supreme Court petitions': { early: 35, late: 42 },
      'Build seawater desalination plants': { early: 10, late: 35 },
    },
    'TN': {
      'File Supreme Court petitions': { early: 25, late: 62 },
      'Build seawater desalination plants': { early: 15, late: 55 },
      'Negotiate with upstream states': { early: 30, late: 48 },
      'Implement water conservation': { early: 22, late: 40 },
    },
    'MH': {
      'Declare drought emergency': { early: 30, late: 58 },
      'Request inter-basin water transfer': { early: 20, late: 52 },
      'Build more reservoirs': { early: 35, late: 45 },
      'Promote drip irrigation': { early: 25, late: 38 },
    },
    'PB': {
      'Maintain foodgrain supply commitments': { early: 40, late: 70 },
      'Negotiate water sharing agreements': { early: 25, late: 55 },
      'Invest in crop diversification': { early: 20, late: 48 },
      'Build water conservation structures': { early: 18, late: 42 },
    },
  };

  const getActionValue = (stateId: string, action: string, mode: 'early' | 'late') => {
    return stateActionData[stateId]?.[action]?.[mode] || Math.floor(Math.random() * 30) + 10;
  };

  const getCellColor = (value: number) => {
    if (value < 20) return 'rgba(0, 212, 255, 0.1)';
    if (value < 40) return 'rgba(0, 212, 255, 0.25)';
    if (value < 60) return 'rgba(0, 212, 255, 0.45)';
    if (value < 75) return 'rgba(0, 212, 255, 0.65)';
    return 'rgba(0, 212, 255, 0.9)';
  };

  const getTextColor = (value: number) => {
    return value > 50 ? '#fff' : 'rgba(255,255,255,0.6)';
  };

  return (
    <div className="relative w-full h-full bg-[#0a0a0f] rounded-xl overflow-hidden p-4">
      {/* Grid Background */}
      <div className="absolute inset-0 grid-bg opacity-50" />
      
      {/* Title */}
      <div className="relative z-10 flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white neon-text">Strategy Heatmap</h3>
          <p className="text-sm text-gray-400 mt-1">Action frequency distribution per state agent</p>
        </div>
        
        {/* Controls */}
        <div className="flex gap-2">
          <select 
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-[#1a1a25] text-white text-sm border border-gray-600 rounded px-3 py-1.5 focus:outline-none focus:border-cyan-400"
          >
            {Object.keys(stateActionData).map(id => (
              <option key={id} value={id}>
                {id} - {indiaStates.find(s => s.id === id)?.name}
              </option>
            ))}
          </select>
          
          <div className="flex bg-[#1a1a25] rounded-lg overflow-hidden border border-gray-600">
            <button
              onClick={() => setViewMode('early')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'early' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Early Training
            </button>
            <button
              onClick={() => setViewMode('late')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'late' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Late Training
            </button>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="relative z-10 overflow-auto h-[calc(100%-100px)]">
        <div className="space-y-2">
          {allActions.map((action, index) => {
            const value = getActionValue(selectedState, action, viewMode);
            
            return (
              <motion.div
                key={action}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {/* Action Label */}
                <div className="w-64 text-xs text-gray-300 truncate">
                  {action}
                </div>
                
                {/* Heat Bar */}
                <div className="flex-1 h-8 bg-[#12121a] rounded overflow-hidden relative">
                  <motion.div
                    className="h-full rounded"
                    style={{ background: getCellColor(value) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                  
                  {/* Value Label */}
                  <div 
                    className="absolute inset-0 flex items-center px-2 text-xs font-bold"
                    style={{ color: getTextColor(value) }}
                  >
                    {value}%
                  </div>
                </div>
                
                {/* Indicator */}
                {value > 60 && (
                  <motion.div
                    className="w-2 h-2 bg-cyan-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="relative z-10 mt-4 flex items-center gap-4">
        <span className="text-xs text-gray-400">Frequency:</span>
        <div className="flex items-center gap-1">
          <div className="w-6 h-3 rounded" style={{ background: 'rgba(0, 212, 255, 0.1)' }} />
          <span className="text-xs text-gray-500">Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-6 h-3 rounded" style={{ background: 'rgba(0, 212, 255, 0.45)' }} />
          <span className="text-xs text-gray-500">Med</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-6 h-3 rounded" style={{ background: 'rgba(0, 212, 255, 0.9)' }} />
          <span className="text-xs text-gray-500">High</span>
        </div>
      </div>

      {/* Insight Panel */}
      <motion.div 
        className="absolute bottom-4 right-4 z-20 glass rounded-lg p-3 max-w-[250px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-xs text-cyan-400 font-semibold mb-1">
          {viewMode === 'early' ? 'Early Training (Entropy)' : 'Late Training (Converged)'}
        </div>
        <p className="text-xs text-gray-400">
          {viewMode === 'early' 
            ? 'Actions are nearly uniformly distributed. The agent is exploring all possibilities.'
            : `${indiaStates.find(s => s.id === selectedState)?.name} discovered through trial & error that specific strategies yield better outcomes.`
          }
        </p>
      </motion.div>
    </div>
  );
};

export default StrategyHeatmap;
