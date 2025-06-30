"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';
import dagre from 'dagre';

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

let nodeId = 1; // Start node ID from 1 for a clean slate
const FLOW_STORAGE_KEY = 'data-lineage-flow';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    return node;
  });

  return { nodes, edges };
};

export default function Flow() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [copiedNodes, setCopiedNodes] = useState<Node[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on initial mount
  useEffect(() => {
    const savedData = localStorage.getItem(FLOW_STORAGE_KEY);
    if (savedData) {
      try {
        const flowData = JSON.parse(savedData);
        if (flowData && Array.isArray(flowData.nodes) && Array.isArray(flowData.edges)) {
          setNodes(flowData.nodes);
          setEdges(flowData.edges);
          const maxId = Math.max(0, ...flowData.nodes.map((n: Node) => parseInt(n.id, 10) || 0));
          nodeId = maxId + 1;
        }
      } catch (error) {
        console.error("Error parsing flow data from localStorage", error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage whenever nodes or edges change
  useEffect(() => {
    if (isInitialized) {
      const cleanedNodes = nodes.map(({ data, ...node }) => ({ ...node, data: { label: data.label, style: data.style } }));
      const cleanedEdges = edges.map(({ data, ...edge }) => ({ ...edge, data: { label: data.label } }));
      const flowData = { nodes: cleanedNodes, edges: cleanedEdges };
      localStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify(flowData));
    }
  }, [nodes, edges, isInitialized]);

  const onNodeLabelChange = (id: string, newLabel: string) => {
    setNodes((nds) => nds.map((node) => {
      if (node.id === id) node.data.label = newLabel;
      return node;
    }));
  };

  const onStyleChange = (id: string, newStyle: object) => {
    setNodes((nds) => nds.map((node) => {
      if (node.id === id) node.data.style = { ...node.data.style, ...newStyle };
      return node;
    }));
  };

  const onEdgeLabelChange = (id: string, newLabel: string) => {
    setEdges((eds) => eds.map((edge) => {
      if (edge.id === id) edge.data.label = newLabel;
      return edge;
    }));
  };

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);

  const onConnect = useCallback((params: Connection) => {
    const newEdge = { 
      ...params, 
      type: 'custom', 
      markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#000' }, 
      data: { label: 'New Relation' },
      style: { stroke: '#000' },
    };
    setEdges((eds) => addEdge(newEdge, eds));
  }, [setEdges]);

  const addNode = useCallback(() => {
    const newNode: Node = {
      id: `${nodeId++}`,
      type: 'custom',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: `Node ${nodeId - 1}`, style: { color: '#555', shape: 'rectangle' } },
    };
    setNodes((nds) => nds.concat(newNode));
  }, []);

  const onLayout = useCallback((direction: string) => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, direction);
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [nodes, edges]);

  const handleExport = () => {
    const cleanedNodes = nodes.map(({ data, ...node }) => ({ ...node, data: { label: data.label, style: data.style } }));
    const cleanedEdges = edges.map(({ data, ...edge }) => ({ ...edge, data: { label: data.label } }));
    const flowData = { nodes: cleanedNodes, edges: cleanedEdges };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(flowData, null, 2))}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = 'data-lineage.json';
    link.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const flowData = JSON.parse(e.target?.result as string);
        if (flowData && Array.isArray(flowData.nodes) && Array.isArray(flowData.edges)) {
          setNodes(flowData.nodes);
          setEdges(flowData.edges);
          const maxId = Math.max(0, ...flowData.nodes.map((n: Node) => parseInt(n.id, 10) || 0));
          nodeId = maxId + 1;
        } else {
          alert('Invalid JSON format.');
        }
      } catch (error) {
        console.error(error);
        alert('Error parsing JSON file.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'c') {
          const selectedNodes = nodes.filter((node) => node.selected);
          if (selectedNodes.length > 0) setCopiedNodes(selectedNodes);
        }
        if (event.key === 'v' && copiedNodes.length > 0) {
          const newNodes = copiedNodes.map((node) => ({
            ...node,
            id: `${nodeId++}`,
            position: { x: node.position.x + 20, y: node.position.y + 20 },
            data: { ...node.data, label: `${node.data.label} (Copy)` },
            selected: false,
          }));
          setNodes((nds) => nds.concat(newNodes));
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nodes, copiedNodes]);

  const nodesWithCallbacks = nodes.map((node) => ({ ...node, data: { ...node.data, onChange: onNodeLabelChange, onStyleChange: onStyleChange } }));
  const edgesWithCallbacks = edges.map((edge) => ({ ...edge, data: { ...edge.data, onChange: onEdgeLabelChange } }));

  if (!isInitialized) {
    return null; // Render nothing on the server and during initial client hydration
  }

  return (
    <div style={{ height: 'calc(100vh - 80px)' }}>
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 w-40">
        <button onClick={addNode} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-left w-full">Add Node</button>
        <button onClick={() => onLayout('TB')} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-left w-full">Auto Layout</button>
        <button onClick={handleExport} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-left w-full">Export JSON</button>
        <button onClick={() => fileInputRef.current?.click()} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-left w-full">Import JSON</button>
        <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" style={{ display: 'none' }} />
      </div>
      <ReactFlow
        nodes={nodesWithCallbacks}
        edges={edgesWithCallbacks}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
