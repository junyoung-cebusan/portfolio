import { Background, BackgroundVariant } from "@xyflow/react";

export function CustomBackground() {
  return (
    <Background
      variant={BackgroundVariant.Dots}
      gap={16}
      size={1}
      color="var(--graph-dot-color, #94a3b8)"
    />
  );
}
