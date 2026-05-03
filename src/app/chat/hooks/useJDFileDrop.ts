import { useEffect, useRef } from "react";
import { useDrop } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";

const ACCEPTED_JD_FILE_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const JD_FILE_ACCEPT =
  "application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type NativeFileDropItem = {
  files?: File[];
};

type UseJDFileDropOptions = {
  disabled?: boolean;
  onDropFile: (file: File) => void;
};

export function isAcceptedJDFile(file: File) {
  const fileName = file.name.toLowerCase();

  return (
    ACCEPTED_JD_FILE_TYPES.has(file.type) ||
    fileName.endsWith(".pdf") ||
    fileName.endsWith(".docx")
  );
}

export function useJDFileDrop({
  disabled = false,
  onDropFile,
}: UseJDFileDropOptions) {
  const dropRef = useRef<HTMLDivElement>(null);
  const [{ isDraggingFile, canDropFile }, connectDropTarget] = useDrop<
    NativeFileDropItem,
    void,
    { isDraggingFile: boolean; canDropFile: boolean }
  >(
    () => ({
      accept: NativeTypes.FILE,
      canDrop: () => !disabled,
      drop: (item, monitor) => {
        if (disabled || monitor.didDrop()) return;

        const file = item.files?.[0];
        if (file) {
          onDropFile(file);
        }
      },
      collect: (monitor) => ({
        isDraggingFile: monitor.isOver({ shallow: true }),
        canDropFile: monitor.canDrop(),
      }),
    }),
    [disabled, onDropFile],
  );

  useEffect(() => {
    connectDropTarget(dropRef);
  }, [connectDropTarget]);

  return {
    dropRef,
    isDraggingFile,
    canDropFile,
  };
}
