"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  type Edge,
  type EdgeProps,
  getBezierPath,
} from "@xyflow/react";
import { Link2 } from "lucide-react";

import { Button } from "@/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip";

type CustomEdgeData = {
  context?: string;
};

export function CustomEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps<Edge<CustomEdgeData>>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="group h-6 w-6 rounded-full border-2 border-slate-700 bg-slate-800 p-0 shadow-lg transition-all hover:scale-125 hover:border-cyan-500 hover:bg-slate-700 hover:shadow-cyan-500/50"
                  style={{
                    borderColor: style?.stroke || "#64748b",
                  }}
                >
                  <Link2
                    className="h-3 w-3 text-slate-400 transition-colors group-hover:text-cyan-400"
                    strokeWidth={2.5}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                className="max-w-xs rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm leading-relaxed text-slate-200 shadow-2xl"
                arrowClassName="bg-slate-800 fill-slate-800"
                sideOffset={8}
              >
                {data?.context ?? "Connection between nodes"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default CustomEdge;
