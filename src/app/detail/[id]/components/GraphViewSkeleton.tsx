import { CareerPanel, CareerSkeleton } from "@/components/career-ui";
import { ReactFlow, Position, Handle } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { CustomBackground } from "./CustomBackground";

function SkeletonNode() {
  return (
    <div className="h-16 w-40 animate-pulse rounded-md border border-transparent bg-muted dark:bg-slate-700/70">
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}

const skeletonNodes = [
  { id: "skel-1", type: "skeleton", position: { x: 250, y: 0 }, data: {} },
  { id: "skel-2", type: "skeleton", position: { x: 100, y: 150 }, data: {} },
  { id: "skel-3", type: "skeleton", position: { x: 400, y: 150 }, data: {} },
];

const skeletonEdges = [
  {
    id: "e-skel-1-2",
    source: "skel-1",
    target: "skel-2",
    animated: true,
    style: { stroke: "#94a3b8", strokeWidth: 2, opacity: 0.5 },
  },
  {
    id: "e-skel-1-3",
    source: "skel-1",
    target: "skel-3",
    animated: true,
    style: { stroke: "#94a3b8", strokeWidth: 2, opacity: 0.5 },
  },
];

const nodeTypes = {
  skeleton: SkeletonNode,
};

function GraphViewSkeleton() {
  return (
    <CareerPanel
      className="flex min-w-0 min-h-0 w-full flex-1 flex-col rounded-2xl p-4"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mb-4 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <CareerSkeleton className="mb-2 h-7 w-56 max-w-full" />
          <CareerSkeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <CareerSkeleton key={index} className="h-4 w-16" />
          ))}
        </div>
      </div>
      <div className="min-w-0 min-h-0 w-full flex-1 overflow-hidden rounded-xl">
        <ReactFlow
          className="h-full w-full"
          nodes={skeletonNodes}
          edges={skeletonEdges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          nodesDraggable={false}
          nodesConnectable={false}
          zoomOnScroll={false}
          panOnDrag={false}
        >
          <CustomBackground />
        </ReactFlow>
      </div>
    </CareerPanel>
  );
}

export default GraphViewSkeleton;
