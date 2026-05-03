"use client";

import { type CSSProperties, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  ReactFlow,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Edge,
  type EdgeTypes,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CareerPanel, LegendItem } from "@/components/career-ui";

import {
  analysisResults,
  analysisCategoryMeta,
  candidateGraphNodes,
  type AnalysisResult,
  type CandidateGraphNodeLabelKey,
  type DetailAnalysisTranslationKey,
} from "../utils/detailAnalysisConfig";
import CustomEdge from "./CustomEdge";
import { CustomBackground } from "./CustomBackground";

type GraphViewProps = {
  results?: AnalysisResult[];
};

type GraphNodeData = {
  label: string;
};

const graphControlsStyle = {
  "--xy-controls-button-background-color": "var(--graph-controls-background)",
  "--xy-controls-button-background-color-hover":
    "var(--graph-controls-background-hover)",
  "--xy-controls-button-border-color": "var(--graph-controls-border)",
  "--xy-controls-button-color": "var(--graph-controls-color)",
  "--xy-controls-button-color-hover": "var(--graph-controls-color-hover)",
} as CSSProperties;

function getNodeStyle(
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

type TranslationLookup = {
  categoryTitle: (key: DetailAnalysisTranslationKey) => string;
  graphNodeLabel: (
    key: CandidateGraphNodeLabelKey | "jdRequirements",
  ) => string;
};

function buildGraph(
  results: AnalysisResult[],
  translations: TranslationLookup,
) {
  const requirementNodes: Node<GraphNodeData>[] = results.map(
    (result, index) => {
      const meta = analysisCategoryMeta[result.category];
      const column = index % 4;
      const row = Math.floor(index / 4);

      return {
        id: result.id,
        data: { label: result.keyword },
        position: { x: 80 + column * 210, y: 160 + row * 120 },
        style: getNodeStyle(meta.color),
      };
    },
  );

  const candidateNodes: Node<GraphNodeData>[] = candidateGraphNodes.map(
    (node, index) => {
      const meta = analysisCategoryMeta[node.category];

      return {
        id: node.id,
        data: { label: translations.graphNodeLabel(node.labelKey) },
        position: {
          x: 90 + (index % 4) * 230,
          y: 560 + Math.floor(index / 4) * 110,
        },
        style: getNodeStyle(meta.color),
      };
    },
  );

  const nodes: Node<GraphNodeData>[] = [
    {
      id: "jd_requirements",
      data: { label: translations.graphNodeLabel("jdRequirements") },
      position: { x: 400, y: 30 },
      style: getNodeStyle("#0ea5e9", true),
    },
    ...requirementNodes,
    ...candidateNodes,
  ];

  const requirementEdges: Edge[] = results.map((result) => {
    const meta = analysisCategoryMeta[result.category];

    return {
      id: `edge-jd-${result.id}`,
      source: "jd_requirements",
      target: result.id,
      type: "custom",
      // animated: true,
      style: {
        stroke: meta.color,
        strokeWidth: 1 + result.graph_data.strength / 32,
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: meta.color },
      data: {
        context: `${translations.categoryTitle(meta.translationKey)} (${result.graph_data.strength}%): ${result.insight}`,
      },
    };
  });

  const proofEdges: Edge[] = results.flatMap((result) => {
    const meta = analysisCategoryMeta[result.category];

    return result.graph_data.connections.map((connection) => ({
      id: `edge-${result.id}-${connection}`,
      source: result.id,
      target: connection,
      type: "custom",
      animated: result.category === "Risk",
      style: {
        stroke: meta.color,
        strokeWidth: 1 + result.graph_data.strength / 40,
        strokeDasharray: result.category === "Risk" ? "6 6" : undefined,
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: meta.color },
      data: {
        context: result.proof,
      },
    }));
  });

  return { nodes, edges: [...requirementEdges, ...proofEdges] };
}

export function GraphView({ results = analysisResults }: GraphViewProps) {
  const tDetail = useTranslations("detail");
  const tCategories = useTranslations("analysis.categories");
  const initialGraph = useMemo(
    () =>
      buildGraph(results, {
        categoryTitle: (key) => tCategories(`${key}.title`),
        graphNodeLabel: (key) =>
          key === "jdRequirements"
            ? tDetail("jdRequirements")
            : tDetail(`graphNodes.${key}`),
      }),
    [results, tCategories, tDetail],
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(initialGraph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialGraph.edges);

  useEffect(() => {
    setNodes(initialGraph.nodes);
    setEdges(initialGraph.edges);
  }, [initialGraph, setEdges, setNodes]);

  const edgeTypes: EdgeTypes = useMemo(
    () => ({
      custom: CustomEdge,
    }),
    [],
  );

  return (
    <CareerPanel className="flex min-w-0 min-h-0 w-full flex-1 flex-col rounded-2xl p-4">
      <div className="mb-4 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-foreground dark:text-slate-100">
            {tDetail("correlationNetwork")}
          </h2>
          <p className="text-sm text-muted-foreground dark:text-slate-400">
            {tDetail("graphDescription")}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          {Object.entries(analysisCategoryMeta).map(([category, meta]) => (
            <LegendItem
              key={category}
              tone={meta.tone}
              label={tCategories(`${meta.translationKey}.label`)}
            />
          ))}
        </div>
      </div>

      <div className="min-w-0 min-h-0 w-full flex-1 overflow-hidden rounded-xl">
        <ReactFlow
          className="h-full w-full"
          nodes={nodes}
          edges={edges}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.18 }}
        >
          <CustomBackground />
          <Controls
            className="rounded-lg border border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
            style={graphControlsStyle}
          />
        </ReactFlow>
      </div>
    </CareerPanel>
  );
}

export default GraphView;
