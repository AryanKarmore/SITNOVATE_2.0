import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { indiaStates, agentAttentions } from '@/data/indiaStates';

interface AgentAttentionProps {
  selectedAgent?: string;
  simulationCycle?: number;
}

const AgentAttention: React.FC<AgentAttentionProps> = ({ selectedAgent = 'GJ', simulationCycle = 0 }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [currentAgent, setCurrentAgent] = useState(selectedAgent);
  const [cycleDisplay, setCycleDisplay] = useState(simulationCycle);

  useEffect(() => {
    setCurrentAgent(selectedAgent);
  }, [selectedAgent]);

  useEffect(() => {
    setCycleDisplay(simulationCycle);
  }, [simulationCycle]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 550;
    const height = 400;

    // Get agent attention data
    const agentData = agentAttentions.find(a => a.stateId === currentAgent) || agentAttentions[0];
    
    // Create center node (the agent)
    const centerState = indiaStates.find(s => s.id === currentAgent);
    if (!centerState) return;

    const centerX = width / 2;
    const centerY = height / 2;

    // Create surrounding nodes (states the agent pays attention to)
    const attentionStates = agentData.attentionWeights.map((aw, i) => {
      const state = indiaStates.find(s => s.id === aw.targetState);
      if (!state) return null;
      
      const angle = (i / agentData.attentionWeights.length) * 2 * Math.PI - Math.PI / 2;
      const radius = 120;
      
      return {
        ...state,
        attentionWeight: aw.weight,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      };
    }).filter(Boolean);

    // Add glow filter
    const defs = svg.append('defs');
    
    // Glow filter for pulses
    const glowFilter = defs.append('filter')
      .attr('id', 'attention-glow')
      .attr('x', '-100%')
      .attr('y', '-100%')
      .attr('width', '300%')
      .attr('height', '300%');
    
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');
    
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Draw attention pulses (lines with varying thickness)
    attentionStates.forEach((state) => {
      if (!state) return;
      
      const thickness = Math.max(2, state.attentionWeight * 15);
      
      // Base connection line
      svg.append('line')
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', state.x)
        .attr('y2', state.y)
        .attr('stroke', 'rgba(0, 212, 255, 0.2)')
        .attr('stroke-width', thickness)
        .attr('stroke-linecap', 'round');

      // Animated pulse
      const pulseGroup = svg.append('g');
      
      const pulse = pulseGroup.append('circle')
        .attr('r', thickness / 2)
        .attr('fill', '#00d4ff')
        .attr('filter', 'url(#attention-glow)')
        .attr('opacity', state.attentionWeight);

      // Animate pulse along the line
      const animatePulse = () => {
        pulse
          .attr('cx', centerX)
          .attr('cy', centerY)
          .transition()
          .duration(1500)
          .ease(d3.easeLinear)
          .attr('cx', state.x)
          .attr('cy', state.y)
          .on('end', animatePulse);
      };
      
      animatePulse();

      // Label showing attention weight
      const midX = (centerX + state.x) / 2;
      const midY = (centerY + state.y) / 2;
      
      svg.append('text')
        .attr('x', midX)
        .attr('y', midY - 5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#00d4ff')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text(`${(state.attentionWeight * 100).toFixed(0)}%`);
    });

    // Draw center node (agent)
    const centerGroup = svg.append('g')
      .attr('transform', `translate(${centerX},${centerY})`);

    // Outer ring
    centerGroup.append('circle')
      .attr('r', 35)
      .attr('fill', 'none')
      .attr('stroke', '#00d4ff')
      .attr('stroke-width', 2)
      .attr('opacity', 0.5);

    // Animated outer ring
    centerGroup.append('circle')
      .attr('r', 40)
      .attr('fill', 'none')
      .attr('stroke', '#00d4ff')
      .attr('stroke-width', 1)
      .attr('opacity', 0.3)
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr('r', 45)
      .attr('opacity', 0)
      .on('end', function repeat() {
        d3.select(this)
          .attr('r', 40)
          .attr('opacity', 0.3)
          .transition()
          .duration(2000)
          .ease(d3.easeLinear)
          .attr('r', 45)
          .attr('opacity', 0)
          .on('end', repeat);
      });

    // Center circle
    centerGroup.append('circle')
      .attr('r', 25)
      .attr('fill', '#00d4ff')
      .attr('filter', 'url(#attention-glow)');

    // Agent label
    centerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('fill', '#000')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text(currentAgent);

    // Agent name below
    centerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 55)
      .attr('fill', '#fff')
      .attr('font-size', '10px')
      .text(centerState.name);

    // Draw attention target nodes
    attentionStates.forEach((state) => {
      if (!state) return;
      
      const nodeGroup = svg.append('g')
        .attr('transform', `translate(${state.x},${state.y})`);

      // Node circle size based on attention weight
      const nodeSize = 8 + state.attentionWeight * 12;
      
      nodeGroup.append('circle')
        .attr('r', nodeSize)
        .attr('fill', state.attentionWeight > 0.6 ? '#ff6b35' : state.attentionWeight > 0.4 ? '#f7c600' : '#00ff88')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('opacity', 0.8 + state.attentionWeight * 0.2);

      // State label
      nodeGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', nodeSize + 15)
        .attr('fill', '#fff')
        .attr('font-size', '9px')
        .text(state.id);

      // Status indicator
      const statusColor = state.status === 'green' ? '#00ff88' : state.status === 'amber' ? '#f7c600' : '#ff3333';
      nodeGroup.append('circle')
        .attr('cx', nodeSize - 3)
        .attr('cy', -nodeSize + 3)
        .attr('r', 4)
        .attr('fill', statusColor);
    });

  }, [currentAgent]);

  return (
    <div className="relative w-full h-full bg-[#0a0a0f] rounded-xl overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 grid-bg opacity-50" />
      
      {/* Title */}
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-xl font-bold text-white neon-text">Agent Attention Visualizer</h3>
        <p className="text-sm text-gray-400 mt-1">What influences {currentAgent}'s decisions (Cycle: {cycleDisplay})</p>
      </div>

      {/* Agent Selector */}
      <div className="absolute top-4 right-4 z-10 glass rounded-lg p-2">
        <select 
          value={currentAgent}
          onChange={(e) => setCurrentAgent(e.target.value)}
          className="bg-transparent text-white text-sm border border-gray-600 rounded px-2 py-1 focus:outline-none focus:border-cyan-400"
        >
          {agentAttentions.map(a => (
            <option key={a.stateId} value={a.stateId} className="bg-[#1a1a25]">
              {a.stateId} - {indiaStates.find(s => s.id === a.stateId)?.name}
            </option>
          ))}
        </select>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 glass rounded-lg p-3">
        <div className="text-xs font-semibold text-gray-300 mb-2">Attention Weight</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-cyan-400" style={{ height: '6px' }} />
            <span className="text-xs text-gray-400">High (&gt;60%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-cyan-400" style={{ height: '4px' }} />
            <span className="text-xs text-gray-400">Medium (40-60%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-px bg-cyan-400" style={{ height: '2px' }} />
            <span className="text-xs text-gray-400">Low (&lt;40%)</span>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="absolute bottom-4 right-4 z-10 glass rounded-lg p-3 max-w-[200px]">
        <div className="text-xs text-gray-300">
          <span className="text-cyan-400 font-semibold">Decision Context:</span>
          <p className="mt-1 text-gray-400">
            {currentAgent === 'GJ' && 'Deciding whether to offer power-purchase agreement to Rajasthan'}
            {currentAgent === 'KA' && 'Evaluating water release to Tamil Nadu'}
            {currentAgent === 'UP' && 'Assessing Ganga water sharing with Bihar'}
          </p>
        </div>
      </div>

      {/* SVG */}
      <svg 
        ref={svgRef} 
        viewBox="0 0 550 400" 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};

export default AgentAttention;
