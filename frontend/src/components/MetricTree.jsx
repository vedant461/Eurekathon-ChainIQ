import React, { useCallback } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Handle,
    Position
} from 'reactflow';
import 'reactflow/dist/style.css';

const CustomNode = ({ data, style }) => {
    return (
        <div style={{
            padding: '10px',
            borderRadius: '5px',
            background: style?.background || '#fff',
            border: style?.border || '1px solid #777',
            minWidth: '150px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#1e293b'
        }}>
            <Handle type="target" position={Position.Top} />
            <div style={{ fontWeight: 'bold' }}>{data.label}</div>
            <div>{data.level}</div>
            {data.variance !== undefined && (
                <div style={{ marginTop: '5px', fontWeight: 'bold' }}>
                    Var: {data.variance > 0 ? '+' : ''}{data.variance}
                </div>
            )}
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};

const nodeTypes = {
    custom: CustomNode,
};

export default function MetricTree({ nodes: initialNodes, edges: initialEdges, onNodeClick }) {
    // We rely on the parent to pass layouted nodes, or we can use dagre here if needed.
    // For MVP, if backend provides x/y as 0,0, we might need a layout engine on frontend.
    // Let's assume for now we might need a simple auto-layout or just render what we get.
    // If backend returns all 0,0, they will stack.

    // Quick layout fix for Hackathon: simple tiered layout
    // Actually, let's use a simple DAGRE layout if we have time, 
    // but for now let's just render and maybe the backend *should* have sent coordinates.
    // The backend `api_v2.py` sent x:0, y:0. 
    // Let's rely on ReactFlow's default or just spread them out manually.

    // Better: Helper to calculate layout
    const getLayoutedElements = (nodes, edges) => {
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));

        // Dagre setup would go here, but avoiding external dep 'dagre' unless installed.
        // Let's just create a basic Grid layout based on levels.
        const levels = {
            'L1_Exec': 0,
            'L2_Category': 1,
            'L3_Leaf': 2
        };

        const levelCounts = { 0: 0, 1: 0, 2: 0 };

        return nodes.map(node => {
            const level = levels[node.data.level] || 0;
            const rank = levelCounts[level]++;
            return {
                ...node,
                position: {
                    x: rank * 200,
                    y: level * 150
                }
            };
        });
    };

    // We need to layout on load.
    const layoutedNodes = React.useMemo(() => {
        if (!initialNodes) return [];
        // Simple manual layout logic
        const levels = { 'L1_Exec': 0, 'L2_Category': 1, 'L3_Leaf': 2 };
        const counts = { 0: 0, 1: 0, 2: 0 };
        return initialNodes.map(n => {
            const l = levels[n.data.level] || 0;
            const x = counts[l] * 180 + 50;
            counts[l]++;
            return { ...n, position: { x, y: l * 120 + 50 } };
        });
    }, [initialNodes]);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ReactFlow
                nodes={layoutedNodes}
                edges={initialEdges}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
                fitView
                attributionPosition="bottom-right"
            >
                <MiniMap style={{ height: 100 }} zoomable pannable />
                <Controls />
                <Background color="#aaa" gap={16} />
            </ReactFlow>
        </div>
    );
}
