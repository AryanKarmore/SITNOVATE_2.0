import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';

// Components
import IndiaMap from '@/components/map/IndiaMap';
import TradeNetwork from '@/components/network/TradeNetwork';
import ConflictMatrix from '@/components/matrix/ConflictMatrix';
import AgentAttention from '@/components/network/AgentAttention';
import ResourceHistory from '@/components/charts/ResourceHistory';
import StrategyHeatmap from '@/components/charts/StrategyHeatmap';
import EventFeed from '@/components/feed/EventFeed';
import CaseStudyPanel from '@/components/panel/CaseStudyPanel';
import ScenarioInput from '@/components/ScenarioInput';

// Types
import type { StateData } from '@/types';

function App() {
  const [simulationCycle, setSimulationCycle] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'simulation' | 'strategy'>('simulation');

  // Simulation control
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setSimulationCycle(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 1;
        });
      }, 1000 / speed);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setSimulationCycle(0);
    setSelectedState(null);
  };

  const handleFastForward = () => {
    setSpeed(prev => Math.min(prev + 1, 5));
  };

  const handleStateClick = useCallback((state: StateData) => {
    setSelectedState(state.id);
  }, []);

  const handleEventClick = useCallback((cycle: number) => {
    setSimulationCycle(cycle);
  }, []);

  const handleScenarioSubmit = useCallback((_scenario: string, affectedStates: string[]) => {
    // Jump to a relevant cycle based on scenario
    setSimulationCycle(45);
    if (affectedStates.length > 0) {
      setSelectedState(affectedStates[0]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0f0f15]">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-black">M</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold neon-text">MAPPO</h1>
                <p className="text-xs text-gray-400">Multi-Agent Proximal Policy Optimization</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-[#1a1a25] rounded-lg p-1">
              <button
                onClick={() => setActiveTab('simulation')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'simulation' 
                    ? 'bg-cyan-500 text-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Live Simulation
              </button>
              <button
                onClick={() => setActiveTab('strategy')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'strategy' 
                    ? 'bg-cyan-500 text-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Strategy Generator
              </button>
            </div>

            {/* Simulation Controls */}
            {activeTab === 'simulation' && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-[#1a1a25] rounded-lg px-3 py-2">
                  <span className="text-xs text-gray-400">Cycle:</span>
                  <span className="text-lg font-mono font-bold text-cyan-400">{simulationCycle}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="icon"
                    className="border-gray-700 hover:bg-gray-800"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    onClick={handlePlayPause}
                    className={`${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-cyan-500 hover:bg-cyan-600'} text-black`}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    onClick={handleFastForward}
                    variant="outline"
                    className="border-gray-700 hover:bg-gray-800"
                  >
                    <FastForward className="w-4 h-4" />
                    <span className="ml-1 text-xs">{speed}x</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === 'simulation' ? (
          <div className="grid grid-cols-12 gap-4">
            {/* Row 1: Map and Network */}
            <div className="col-span-12 lg:col-span-6 h-[500px]">
              <IndiaMap 
                onStateClick={handleStateClick}
                selectedState={selectedState}
                simulationCycle={simulationCycle}
              />
            </div>
            
            <div className="col-span-12 lg:col-span-6 h-[500px]">
              <TradeNetwork simulationCycle={simulationCycle} />
            </div>

            {/* Row 2: Conflict Matrix and Agent Attention */}
            <div className="col-span-12 lg:col-span-6 h-[400px]">
              <ConflictMatrix simulationCycle={simulationCycle} />
            </div>
            
            <div className="col-span-12 lg:col-span-6 h-[400px]">
              <AgentAttention 
                selectedAgent={selectedState || 'GJ'} 
                simulationCycle={simulationCycle}
              />
            </div>

            {/* Row 3: Resource History and Strategy Heatmap */}
            <div className="col-span-12 lg:col-span-6 h-[500px]">
              <ResourceHistory 
                selectedState={selectedState || 'RJ'}
                simulationCycle={simulationCycle}
              />
            </div>
            
            <div className="col-span-12 lg:col-span-6 h-[500px]">
              <StrategyHeatmap />
            </div>

            {/* Row 4: Event Feed and Case Study */}
            <div className="col-span-12 lg:col-span-6 h-[400px]">
              <EventFeed 
                simulationCycle={simulationCycle}
                onEventClick={handleEventClick}
              />
            </div>
            
            <div className="col-span-12 lg:col-span-6 h-[400px]">
              <CaseStudyPanel simulationCycle={simulationCycle} />
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strategy Input */}
              <div className="h-[700px]">
                <ScenarioInput onScenarioSubmit={handleScenarioSubmit} />
              </div>
              
              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="bg-[#12121a] rounded-xl p-6 border border-gray-800">
                  <h3 className="text-lg font-semibold text-white mb-4">System Capabilities</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0a0a0f] rounded-lg p-4">
                      <div className="text-3xl font-bold text-cyan-400">28</div>
                      <div className="text-sm text-gray-400">Indian States</div>
                    </div>
                    <div className="bg-[#0a0a0f] rounded-lg p-4">
                      <div className="text-3xl font-bold text-green-400">150+</div>
                      <div className="text-sm text-gray-400">Trade Connections</div>
                    </div>
                    <div className="bg-[#0a0a0f] rounded-lg p-4">
                      <div className="text-3xl font-bold text-yellow-400">45</div>
                      <div className="text-sm text-gray-400">Action Types</div>
                    </div>
                    <div className="bg-[#0a0a0f] rounded-lg p-4">
                      <div className="text-3xl font-bold text-red-400">10K+</div>
                      <div className="text-sm text-gray-400">Training Episodes</div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#12121a] rounded-xl p-6 border border-gray-800">
                  <h3 className="text-lg font-semibold text-white mb-4">How It Works</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-cyan-400">1</span>
                      </div>
                      <p className="text-sm text-gray-400">Describe a scenario or select from quick options</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-cyan-400">2</span>
                      </div>
                      <p className="text-sm text-gray-400">MAPPO agents analyze and simulate outcomes</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-cyan-400">3</span>
                      </div>
                      <p className="text-sm text-gray-400">Receive comprehensive resource allocation strategy</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-cyan-400">4</span>
                      </div>
                      <p className="text-sm text-gray-400">Export or print for implementation</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-xl p-6 border border-cyan-500/30">
                  <h3 className="text-lg font-semibold text-cyan-400 mb-2">Example Queries</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• "Maharashtra Region is facing droughts"</li>
                    <li>• "Karnataka-Tamil Nadu water dispute escalation"</li>
                    <li>• "Punjab agricultural crisis due to groundwater depletion"</li>
                    <li>• "North India monsoon failure affecting Rajasthan"</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-[#0f0f15] mt-8">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>
              MAPPO Dashboard • Multi-Agent Reinforcement Learning for Interstate Resource Allocation
            </div>
            <div className="flex gap-4">
              <span>Cycle: {simulationCycle}/100</span>
              <span>Status: {isPlaying ? 'Running' : 'Paused'}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
