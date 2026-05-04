"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  type Edge,
  type EdgeProps,
  getSmoothStepPath,
} from "@xyflow/react";
import { Link2, ArrowRight, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useCallback, useRef } from "react";

import { Button } from "@/components/button";
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@/components/popover";

type CustomEdgeData = {
  visual_intent?: "dashed" | "solid" | "animated";
  tooltip?: string;
};

const intentConfig = {
  dashed: {
    icon: Link2,
    label: "Bridging",
    className:
      "hover:border-purple-500 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900/30 dark:hover:text-purple-300 dark:data-[state=open]:bg-purple-900/30 dark:data-[state=open]:text-purple-300",
    iconClassName:
      "text-purple-600 group-hover:text-purple-600 group-data-[state=open]:text-purple-600 dark:text-purple-400 dark:group-hover:text-purple-400 dark:group-data-[state=open]:text-purple-400",
  },
  solid: {
    icon: ArrowRight,
    label: "Direct Engine",
    className:
      "hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-300 dark:data-[state=open]:bg-blue-900/30 dark:data-[state=open]:text-blue-300",
    iconClassName:
      "text-blue-600 group-hover:text-blue-600 group-data-[state=open]:text-blue-600 dark:text-blue-400 dark:group-hover:text-blue-400 dark:group-data-[state=open]:text-blue-400",
  },
  animated: {
    icon: Shield,
    label: "Active Defense",
    className:
      "hover:border-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-300 dark:data-[state=open]:bg-red-900/30 dark:data-[state=open]:text-red-300",
    iconClassName:
      "text-red-600 group-hover:text-red-600 group-data-[state=open]:text-red-600 dark:text-red-400 dark:group-hover:text-red-400 dark:group-data-[state=open]:text-red-400",
  },
};

const HOVER_DELAY = 150;

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
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const intent = data?.visual_intent || "solid";
  const config = intentConfig[intent] || intentConfig.solid;
  const Icon = config.icon;

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, HOVER_DELAY);
  }, []);

  const handlePopoverMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handlePopoverMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, HOVER_DELAY);
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    // Only allow opening via hover, ignore close events from clicks
    if (open) {
      setIsOpen(true);
    }
    // Don't close on click - only hover leave should close
  }, []);

  return (
    <>
      {/* Group wrapper - only this handles mouse events to prevent flickering */}
      <g onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {/* Invisible wide path for hover detection */}
        <path
          d={edgePath}
          fill="none"
          stroke="transparent"
          strokeWidth={40}
          style={{ pointerEvents: "none" }}
        />
        {/* Visible edge path */}
        <BaseEdge
          path={edgePath}
          markerEnd={markerEnd}
          style={{
            ...style,
            transition: "stroke-width 0.2s",
            strokeWidth: isOpen ? 3 : 2,
            pointerEvents: "none",
          }}
        />
      </g>
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
          className="nodrag nopan"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={data?.tooltip ?? tDetail("connectionBetweenNodes")}
                className={`group h-6 w-6 rounded-full border-2 border-slate-300 bg-white p-0 shadow-lg transition-all hover:scale-125 dark:border-slate-700 dark:bg-slate-800 ${config.className}`}
                style={{
                  borderColor: style?.stroke || "#64748b",
                }}
              >
                <Icon
                  className={`h-3 w-3 transition-colors ${config.iconClassName}`}
                  strokeWidth={2.5}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="max-w-xs rounded-lg border border-border bg-popover px-4 py-3 text-sm leading-relaxed text-popover-foreground shadow-2xl dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              sideOffset={8}
              onMouseEnter={handlePopoverMouseEnter}
              onMouseLeave={handlePopoverMouseLeave}
            >
              {data?.tooltip ?? tDetail("connectionBetweenNodes")}
              <PopoverArrow className="fill-popover dark:fill-slate-800" />
            </PopoverContent>
          </Popover>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default CustomEdge;
