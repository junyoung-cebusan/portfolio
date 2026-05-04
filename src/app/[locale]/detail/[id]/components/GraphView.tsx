"use client";

import { useEffect, type CSSProperties, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  ReactFlow,
  Controls,
  useNodesState,
  useEdgesState,
  type EdgeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CareerPanel, LegendItem } from "@/components/career-ui";

import {
  analysisCategoryMeta,
  type DetailAnalysisTone,
} from "../utils/detailAnalysisConfig";
import {
  buildGraphFromNodesEdges,
  categoryMapping,
} from "../utils/graphLayout";
import CustomEdge from "./CustomEdge";
import { CustomBackground } from "./CustomBackground";

const graphControlsStyle = {
  "--xy-controls-button-background-color": "var(--graph-controls-background)",
  "--xy-controls-button-background-color-hover":
    "var(--graph-controls-background-hover)",
  "--xy-controls-button-border-color": "var(--graph-controls-border)",
  "--xy-controls-button-color": "var(--graph-controls-color)",
  "--xy-controls-button-color-hover": "var(--graph-controls-color-hover)",
} as CSSProperties;

export function GraphView({
  nodes = [],
  edges = [],
}: {
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
}) {
  const tCategories = useTranslations("analysis.categories");

  const initialGraph = useMemo(
    () => buildGraphFromNodesEdges(nodes, edges),
    [nodes, edges],
  );

  const [reactFlowNodes, setNodes, onNodesChange] = useNodesState(
    initialGraph.nodes,
  );
  const [reactFlowEdges, setEdges, onEdgesChange] = useEdgesState(
    initialGraph.edges,
  );

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
            Correlation Network
          </h2>
          <p className="text-sm text-muted-foreground dark:text-slate-400">
            Multi-layered relationship graph between JD requirements and
            candidate capabilities
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          {Object.entries(categoryMapping).map(([schemaName, configName]) => {
            const meta = analysisCategoryMeta[configName];
            return (
              <LegendItem
                key={schemaName}
                tone={meta.tone as DetailAnalysisTone}
                label={tCategories(`${meta.translationKey}.label`)}
              />
            );
          })}
        </div>
      </div>

      <div className="min-w-0 min-h-0 w-full flex-1 overflow-hidden rounded-xl">
        <ReactFlow
          className="h-full w-full"
          nodes={reactFlowNodes}
          edges={reactFlowEdges}
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
