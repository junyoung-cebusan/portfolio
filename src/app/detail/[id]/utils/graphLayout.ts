"use client";

import { type Node, type Edge, MarkerType, Position } from "@xyflow/react";

import type { DetailAnalysisCategory } from "./detailAnalysisConfig";

// ---------------------------------------------------------------------------
// Graph data types matching the updated schema
// ---------------------------------------------------------------------------

export type GraphNodeData = {
  label: string;
  category: string;
  detail: string;
  flow_level?: number;
};

export type GraphEdgeData = {
  visual_intent: "dashed" | "solid" | "animated";
  tooltip: string;
};

export type GraphViewProps = {
  nodes?: Array<{
    id: string;
    label: string;
    category: string;
    detail: string;
    flow_level?: number;
  }>;
  edges?: Array<{
    source: string;
    target: string;
    visual_intent: "dashed" | "solid" | "animated";
    tooltip: string;
  }>;
};

// ---------------------------------------------------------------------------
// Category mapping & colors
// ---------------------------------------------------------------------------

/** Maps schema category names → config category names */
export const categoryMapping: Record<string, DetailAnalysisCategory> = {
  TechAlignment: "TechAlignment",
  DomainTransfer: "DomainTransfer",
  FeatureOwnership: "FeatureOwnership",
  Velocity: "Velocity",
  Risk: "Risk",
};

/** Color map keyed by schema category name */
export const categoryColorMap: Record<string, string> = {
  TechAlignment: "#06b6d4",
  DomainTransfer: "#a855f7",
  FeatureOwnership: "#10b981",
  Velocity: "#f59e0b",
  Risk: "#ef4444",
};

// ---------------------------------------------------------------------------
// Style helpers
// ---------------------------------------------------------------------------

export function getNodeStyle(
  color: string,
  isRoot = false,
): Node<GraphNodeData>["style"] {
  return {
    background: isRoot ? "linear-gradient(135deg, #06b6d4, #2563eb)" : color,
    color: "#fff",
    border: `2px solid ${color}`,
    borderRadius: isRoot ? "12px" : "10px",
    fontSize: isRoot ? "14px" : "12px",
    fontWeight: 700,
    padding: isRoot ? "16px 20px" : "12px 16px",
    boxShadow: `0 6px 18px ${color}55`,
  };
}

export function getEdgeStyle(
  color: string,
  visualIntent: "dashed" | "solid" | "animated",
) {
  const baseStyle = {
    stroke: color,
    strokeWidth: 2,
  };

  switch (visualIntent) {
    case "dashed":
      return { ...baseStyle, strokeDasharray: "6 6" };
    case "animated":
    case "solid":
    default:
      return baseStyle;
  }
}

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

const LAYOUT = {
  nodeWidth: 200,
  nodeHeight: 80,
  minSpacingX: 150,
  minSpacingY: 84, // reduced by 30% from 120
  hubThreshold: 2, // nodes with 2+ connections are considered hubs
} as const;

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

/** Build a React Flow compatible graph from raw node/edge data */
export function buildGraphFromNodesEdges(
  nodes: GraphViewProps["nodes"] = [],
  edges: GraphViewProps["edges"] = [],
) {
  const nodeCategoryMap = new Map<string, string>();
  nodes.forEach((node) => {
    nodeCategoryMap.set(node.id, node.category);
  });

  // Count connections per node to identify hubs
  const connectionCount = new Map<string, number>();
  edges.forEach((edge) => {
    connectionCount.set(
      edge.source,
      (connectionCount.get(edge.source) || 0) + 1,
    );
    connectionCount.set(
      edge.target,
      (connectionCount.get(edge.target) || 0) + 1,
    );
  });

  // Categorize nodes
  const riskNodes = nodes.filter((node) => node.category === "Risk");
  const nonRiskNodes = nodes.filter((node) => node.category !== "Risk");

  const hubNodes = nonRiskNodes.filter(
    (node) => (connectionCount.get(node.id) || 0) >= LAYOUT.hubThreshold,
  );
  const leafNodes = nonRiskNodes.filter(
    (node) => (connectionCount.get(node.id) || 0) < LAYOUT.hubThreshold,
  );

  const reactFlowNodes: Node<GraphNodeData>[] = [];

  // --- Layout: Hub nodes (center area) ---
  const hubCount = hubNodes.length;
  hubNodes.forEach((node, idx) => {
    const color = categoryColorMap[node.category] || "#06b6d4";
    const x = 250 + (idx % 2) * 200;

    const totalHeight = Math.max(hubCount * LAYOUT.minSpacingY, 500);
    const startY = -totalHeight / 2;
    const ySpacing = hubCount > 1 ? totalHeight / (hubCount - 1) : 0;
    const baseY = startY + idx * ySpacing;

    const offsetMagnitude = Math.min(60, ySpacing * 0.3);
    const y = baseY + (idx % 2 === 0 ? -offsetMagnitude : offsetMagnitude);

    reactFlowNodes.push({
      id: node.id,
      data: {
        label: node.label,
        category: node.category,
        detail: node.detail,
        flow_level: node.flow_level,
      },
      position: { x, y },
      style: getNodeStyle(color),
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
    });
  });

  // --- Layout: Leaf nodes (left / center-spread) ---
  const leafCount = leafNodes.length;
  leafNodes.forEach((node, idx) => {
    const color = categoryColorMap[node.category] || "#06b6d4";
    const column = idx % 2;
    const x = 80 + column * 250 + (idx % 3) * 40;

    const totalHeight = Math.max(leafCount * LAYOUT.minSpacingY * 0.8, 600);
    const startY = -totalHeight / 2;
    const ySpacing = leafCount > 1 ? totalHeight / (leafCount - 1) : 0;
    const baseY = startY + idx * ySpacing;

    const waveOffset = Math.sin(idx * 1.2 + 0.5) * 180;
    const y = baseY + waveOffset;

    reactFlowNodes.push({
      id: node.id,
      data: {
        label: node.label,
        category: node.category,
        detail: node.detail,
        flow_level: node.flow_level,
      },
      position: { x, y },
      style: getNodeStyle(color),
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
    });
  });

  // --- Layout: Risk nodes (right periphery) ---
  const riskCount = riskNodes.length;
  riskNodes.forEach((node, idx) => {
    const color = categoryColorMap[node.category] || "#ef4444";
    const x = 700 + (idx % 2) * 100;

    const totalHeight = Math.max(riskCount * LAYOUT.minSpacingY, 400);
    const startY = -totalHeight / 2;
    const ySpacing = riskCount > 1 ? totalHeight / (riskCount - 1) : 0;
    const baseY = startY + idx * ySpacing;

    const offsetMagnitude = Math.min(50, ySpacing * 0.25);
    const y = baseY + (idx % 2 === 0 ? -offsetMagnitude : offsetMagnitude);

    reactFlowNodes.push({
      id: node.id,
      data: {
        label: node.label,
        category: node.category,
        detail: node.detail,
        flow_level: node.flow_level,
      },
      position: { x, y },
      style: getNodeStyle(color),
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
    });
  });

  // --- Edges ---
  const reactFlowEdges: Edge<GraphEdgeData>[] = edges.map((edge) => {
    const sourceCategory = nodeCategoryMap.get(edge.source) || "TechAlignment";
    const color = categoryColorMap[sourceCategory] || "#06b6d4";
    const isAnimated = edge.visual_intent === "animated";

    return {
      id: `edge-${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      type: "custom",
      animated: isAnimated,
      style: getEdgeStyle(color, edge.visual_intent),
      markerEnd: { type: MarkerType.ArrowClosed, color },
      data: {
        visual_intent: edge.visual_intent,
        tooltip: edge.tooltip,
      },
    };
  });

  return { nodes: reactFlowNodes, edges: reactFlowEdges };
}
