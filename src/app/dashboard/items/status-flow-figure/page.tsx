'use client';

import { ITEM_STATUS } from '@/api/backend/configs.data';
import { StatusFlow } from '@/StatusFlow';
import {
  Background,
  Controls,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
  type NodeMouseHandler,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { useCallback, useMemo, useState } from 'react';
import copy from 'copy-to-clipboard';

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

function generateGraph(): GraphData {
  const nodeMap = new Map<string, Node>();
  const edges: Edge[] = [];
  const nodes: Node[] = [];

  const getNode = (id: string, depth: number): Node => {
    if (!nodeMap.has(id)) {
      const statusKey = id as ITEM_STATUS['key'];
      const node: Node = {
        id,
        data: {
          label: (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold' }}>
                {ITEM_STATUS.get('key', statusKey).message} <span>({ITEM_STATUS.enum(statusKey)})</span>
              </div>
              {
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                <div onClick={() => copy(id)}>{id}</div>
              }
            </div>
          ),
        },
        position: { x: 0, y: depth * 200 }, // Increased vertical spacing
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        style: {
          background: '#f0f0f0',
          border: '1px solid #ddd',
          borderRadius: '5px',
          padding: '10px',
          fontSize: '12px',
          width: 200, // Increased width
          height: 'auto', // Allow height to adjust to content
          textAlign: 'center' as const,
        },
      };
      nodeMap.set(id, node);
      nodes.push(node);
    }
    return nodeMap.get(id)!;
  };

  const queue: [string, number][] = [['SubmitAppraisalStatus', 0]];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const [currentId, depth] = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const currentNode = getNode(currentId, depth);
    const step = StatusFlow.flow[currentId as keyof typeof StatusFlow.flow];

    for (const nextId of step.nexts) {
      getNode(nextId, depth + 1);
      edges.push({
        id: `${currentId}-${nextId}`,
        source: currentId,
        target: nextId,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: '#b1b1b7',
        },
      });

      if (!visited.has(nextId)) {
        queue.push([nextId, depth + 1]);
      }
    }
  }

  centerNodesHorizontally(nodes);

  return { nodes, edges };
}

function centerNodesHorizontally(nodes: Node[]): void {
  const nodesPerRow = new Map<number, Node[]>();
  nodes.forEach((node) => {
    const row = node.position.y;
    if (!nodesPerRow.has(row)) nodesPerRow.set(row, []);
    nodesPerRow.get(row)!.push(node);
  });

  nodesPerRow.forEach((rowNodes) => {
    const totalWidth = rowNodes.length * 300; // Increased horizontal spacing
    const startX = -totalWidth / 2;
    rowNodes.forEach((node, index) => {
      node.position.x = startX + index * 300; // Increased horizontal spacing
    });
  });
}

function getHighlightedEdges(edges: Edge[], nodeId: string): Set<string> {
  return new Set(edges.filter((edge) => edge.source === nodeId || edge.target === nodeId).map((edge) => edge.id));
}

function applyEdgeHighlight(edge: Edge, isHighlighted: boolean): Edge {
  const highlightColor = '#6366f1';
  const normalColor = '#b1b1b7';
  return {
    ...edge,
    style: {
      stroke: isHighlighted ? highlightColor : normalColor,
      strokeWidth: isHighlighted ? 2 : 1,
    },
    markerEnd: {
      ...(edge.markerEnd as { type: MarkerType; width: number; height: number; color: string }),
      color: isHighlighted ? highlightColor : normalColor,
    },
  };
}

function StatusFlowGraph() {
  const [highlightedEdges, setHighlightedEdges] = useState<Set<string>>(new Set());

  const { nodes, edges } = useMemo(() => generateGraph(), []);

  const onNodeMouseEnter: NodeMouseHandler = useCallback(
    (_, node) => {
      setHighlightedEdges(getHighlightedEdges(edges, node.id));
    },
    [edges]
  );

  const onNodeMouseLeave: NodeMouseHandler = useCallback(() => {
    setHighlightedEdges(new Set());
  }, []);

  const edgesWithHighlight = useMemo(
    () => edges.map((edge) => applyEdgeHighlight(edge, highlightedEdges.has(edge.id))),
    [edges, highlightedEdges]
  );

  return (
    <ReactFlowProvider>
      <div style={{ width: '100%', height: '800px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edgesWithHighlight}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          fitView
          nodesDraggable={false}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}

export default StatusFlowGraph;
