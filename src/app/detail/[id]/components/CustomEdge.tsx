"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  type Edge,
  type EdgeProps,
  getBezierPath,
} from "@xyflow/react";
import { Link2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/button";
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@/components/popover";

type CustomEdgeData = {
  label?: string;
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
  const tDetail = useTranslations("detail");
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={data?.label ?? tDetail("connectionBetweenNodes")}
                className="group h-7 max-w-32 rounded-full border-2 border-slate-300 bg-white px-2 py-0 text-[10px] font-semibold leading-none text-slate-700 shadow-lg transition-all hover:scale-110 hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-700 hover:shadow-cyan-500/30 data-[state=open]:scale-110 data-[state=open]:border-cyan-500 data-[state=open]:bg-cyan-50 data-[state=open]:text-cyan-700 data-[state=open]:shadow-cyan-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-cyan-300 dark:hover:shadow-cyan-500/50 dark:data-[state=open]:bg-slate-700 dark:data-[state=open]:text-cyan-300 dark:data-[state=open]:shadow-cyan-500/50"
                style={{
                  borderColor: style?.stroke || "#64748b",
                }}
              >
                <Link2
                  className="h-3 w-3 text-slate-600 transition-colors group-hover:text-cyan-600 group-data-[state=open]:text-cyan-600 dark:text-slate-400 dark:group-hover:text-cyan-400 dark:group-data-[state=open]:text-cyan-400"
                  strokeWidth={2.5}
                />
                {data?.label && <span className="truncate">{data.label}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="max-w-xs rounded-lg border border-border bg-popover px-4 py-3 text-sm leading-relaxed text-popover-foreground shadow-2xl dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              sideOffset={8}
            >
              {data?.context ?? tDetail("connectionBetweenNodes")}
              <PopoverArrow className="fill-popover dark:fill-slate-800" />
            </PopoverContent>
          </Popover>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default CustomEdge;
