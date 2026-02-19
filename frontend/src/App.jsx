import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Package, Truck, Database } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Components
import MetricTree from './components/MetricTree';
import SimulationPanel from './components/SimulationPanel';

// --- Shared Components for Layout ---
const KPICard = ({ title, value, trend, color, icon: Icon }) => (
  <div className="bg-gray-800 p-3 rounded-lg shadow border border-gray-700 flex items-center justify-between">
    <div>
      <div className="text-gray-400 text-xs font-bold uppercase">{title}</div>
      <div className="text-2xl font-bold text-white mt-1">{value}</div>
      <div className={`text-xs mt-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
        {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}% vs 30d
      </div>
    </div>
    <div className={`p-2 rounded ${color.replace('text-', 'bg-').replace('500', '900')} bg-opacity-30`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
  </div>
);

function App() {
  // Global State
  const [treeData, setTreeData] = useState({ nodes: [], edges: [] });
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [nodes, setNodes] = useState([]); // Map Nodes

  // Fetch Initial Data
  useEffect(() => {
    const init = async () => {
      try {
        const [treeRes, mapRes] = await Promise.all([
          axios.get('http://localhost:8000/api/v2/tree'),
          axios.get('http://localhost:8000/api/node-performance') // Legacy V1 endpoint still useful
        ]);

        setTreeData(treeRes.data);
        setNodes(mapRes.data);
      } catch (e) {
        console.error("Init Error", e);
      }
    };
    init();
  }, []);

  // Handling Clicking a Tree Node
  const onNodeClick = (event, node) => {
    setSelectedMetric(node);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans overflow-hidden flex flex-col">

      {/* ZONE A: Executive Ribbon (Top 10-15%) */}
      <header className="h-20 bg-gray-900 border-b border-gray-800 flex items-center px-6 justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-600 rounded">
            <Database className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-wider">SUPPLY CHAIN INTELLIGENCE <span className="text-gray-500 font-normal">V2.0</span></h1>
        </div>

        <div className="flex gap-6">
          {/* Mock KPIs for V2 Ribbon */}
          <div className="flex gap-8">
            <div className="text-right">
              <div className="text-xs text-gray-500 uppercase">Reliability</div>
              <div className="text-xl font-bold text-green-400">98.2%</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 uppercase">Avg Latency</div>
              <div className="text-xl font-bold text-yellow-400">4.2h</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 uppercase">QC Pass Rate</div>
              <div className="text-xl font-bold text-blue-400">94.1%</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area: Grid */}
      <div className="flex-1 p-4 grid grid-cols-12 grid-rows-2 gap-4 h-[calc(100vh-80px)]">

        {/* ZONE B: Diagnostic Metric Tree (Center Left) */}
        <div className="col-span-8 row-span-1 bg-gray-900 rounded-lg border border-gray-800 shadow-xl overflow-hidden relative group">
          <div className="absolute top-3 left-3 z-10 bg-gray-900/80 px-2 py-1 rounded border border-gray-700 text-xs font-mono text-gray-400 pointer-events-none">
            METRIC_DEPENDENCY_GRAPH
          </div>
          <MetricTree
            nodes={treeData.nodes}
            edges={treeData.edges}
            onNodeClick={onNodeClick}
          />
        </div>

        {/* ZONE C: AI Decision & Simulation (Right) */}
        <div className="col-span-4 row-span-1">
          <SimulationPanel selectedMetric={selectedMetric} />
        </div>

        {/* ZONE D: Global Network Map (Bottom) */}
        <div className="col-span-12 row-span-1 bg-gray-900 rounded-lg border border-gray-800 shadow-xl overflow-hidden relative">
          <div className="absolute top-3 left-3 z-[400] bg-gray-900/80 px-2 py-1 rounded border border-gray-700 text-xs font-mono text-gray-400 pointer-events-none">
            LIVE_NETWORK_TELEMETRY
          </div>
          <MapContainer
            center={[20, 0]}
            zoom={2}
            style={{ height: '100%', width: '100%', background: '#111827' }}
          >
            <TileLayer
              attribution='&copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {nodes.map(node => (
              <CircleMarker
                key={node.node_id}
                center={[node.lat, node.lng]}
                pathOptions={{
                  color: node.avg_variance > 5 ? '#ef4444' : '#10b981',
                  fillColor: node.avg_variance > 5 ? '#ef4444' : '#10b981',
                  fillOpacity: 0.6
                }}
                radius={node.avg_variance > 5 ? 6 : 3}
              >
                <Popup className="glass-popup">
                  <strong>{node.node_name}</strong><br />
                  Var: {node.avg_variance}h
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default App;
