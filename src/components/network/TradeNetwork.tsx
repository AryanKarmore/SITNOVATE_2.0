import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { indiaStates, tradeConnections } from '@/data/indiaStates';

interface TradeNetworkProps {
  simulationCycle?: number;
}

const TradeNetwork: React.FC<TradeNetworkProps> = ({ simulationCycle = 0 }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [brokenConnections, setBrokenConnections] = useState<string[]>([]);

  useEffect(() => {
    // Simulate connection breaks at certain cycles
    if (simulationCycle === 45) {
      setBrokenConnections(['PB-TN']);
    } else if (simulationCycle === 55) {
      setBrokenConnections(['PB-TN', 'KA-TN']);
    } else if (simulationCycle < 45) {
      setBrokenConnections([]);
    }
  }, [simulationCycle]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create nodes from states
    const nodes = indiaStates.map(state => ({
      id: state.id,
      name: state.name,
      x: state.position.x,
      y: state.position.y,
      status: state.status,
    }));

    // Create links from trade connections
    const links = tradeConnections.map(conn => ({
      source: conn.from,
      target: conn.to,
      type: conn.type,
      volume: conn.volume,
      active: conn.active && !brokenConnections.includes(`${conn.from}-${conn.to}`),
      id: `${conn.from}-${conn.to}`,
    }));

    // Draw links
    const linkGroup = svg.append('g').attr('class', 'links');
    
    links.forEach((link) => {
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);
      
      if (!sourceNode || !targetNode) return;

      const color = link.type === 'water' ? '#00d4ff' : link.type === 'food' ? '#00ff88' : '#f7c600';
      const strokeWidth = link.volume / 15;

      // Draw the connection line
      const line = linkGroup.append('line')
        .attr('x1', sourceNode.x)
        .attr('y1', sourceNode.y)
        .attr('x2', targetNode.x)
        .attr('y2', targetNode.y)
        .attr('stroke', link.active ? color : '#ff3333')
        .attr('stroke-width', link.active ? strokeWidth : 1)
        .attr('stroke-opacity', link.active ? 0.7 : 0.3)
        .attr('stroke-dasharray', link.active ? 'none' : '5,5');

      // Add flowing animation for active connections
      if (link.active) {
        const particle = linkGroup.append('circle')
          .attr('r', 3)
          .attr('fill', color)
          .attr('filter', 'url(#glow)');

        const animatePulse = () => {
          particle
            .attr('cx', sourceNode.x)
            .attr('cy', sourceNode.y)
            .transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .attr('cx', targetNode.x)
            .attr('cy', targetNode.y)
            .on('end', animatePulse);
        };
        
        animatePulse();
      }

      // Break animation
      if (!link.active && brokenConnections.includes(link.id)) {
        line
          .transition()
          .duration(500)
          .attr('stroke-width', 1)
          .attr('stroke-opacity', 0.3);
      }
    });

    // Draw nodes
    const nodeGroup = svg.append('g').attr('class', 'nodes');
    
    nodes.forEach(node => {
      const nodeG = nodeGroup.append('g')
        .attr('transform', `translate(${node.x},${node.y})`);

      // Node circle
      nodeG.append('circle')
        .attr('r', 12)
        .attr('fill', node.status === 'green' ? '#00ff88' : node.status === 'amber' ? '#f7c600' : '#ff3333')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)
        .attr('filter', 'url(#glow)');

      // Node label
      nodeG.append('text')
        .attr('dy', 25)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ffffff')
        .attr('font-size', '8px')
        .attr('font-weight', 'bold')
        .text(node.id);
    });

    // Add glow filter
    const defs = svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');
    
    filter.append('feMerge')
      .append('feMergeNode')
      .attr('in', 'coloredBlur');
    
    filter.append('feMerge')
      .append('feMergeNode')
      .attr('in', 'SourceGraphic');

  }, [brokenConnections]);

  return (
    <div className="relative w-full h-full bg-[#0a0a0f] rounded-xl overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 grid-bg opacity-50" />
      
      {/* Title */}
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-xl font-bold text-white neon-text">Trade & Alliance Network</h3>
        <p className="text-sm text-gray-400 mt-1">Live interstate dependencies</p>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-10 glass rounded-lg p-3">
        <div className="text-xs font-semibold text-gray-300 mb-2">Connection Types</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-cyan-400" />
            <span className="text-xs text-gray-300">Water Transfer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-green-400" />
            <span className="text-xs text-gray-300">Food/Fertilizer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-yellow-400" />
            <span className="text-xs text-gray-300">Power Grid</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-red-500 border-dashed" style={{ borderTop: '1px dashed #ff3333', background: 'none' }} />
            <span className="text-xs text-gray-300">Broken</span>
          </div>
        </div>
      </div>

      {/* Break Alert */}
      {brokenConnections.length > 0 && (
        <motion.div 
          className="absolute bottom-4 left-4 right-4 z-20 bg-red-900/80 border border-red-500 rounded-lg p-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-red-200">Alliance Break Detected</span>
          </div>
          <p className="text-xs text-red-300 mt-1">
            {brokenConnections.includes('PB-TN') && 'Punjab-Tamil Nadu food supply agreement dissolved'}
            {brokenConnections.includes('KA-TN') && ' • Karnataka-Tamil Nadu water sharing suspended'}
          </p>
        </motion.div>
      )}

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

export default TradeNetwork;
