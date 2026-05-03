import { useMutation } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryUtils";
import type { ChatApiMessage } from "../types";

type SendChatMessageInput = {
  messages: ChatApiMessage[];
  onChunk: (content: string) => void;
};

async function sendChatMessage({ messages, onChunk }: SendChatMessageInput) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to send message.");
  }

  if (!response.body) {
    throw new Error("The chat response did not include a stream.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let assistantContent = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    assistantContent += decoder.decode(value, { stream: true });
    onChunk(assistantContent);
  }

  assistantContent += decoder.decode();
  return assistantContent;
}

export function useSendChatMessageMutation(sessionId: string) {
  return useMutation({
    mutationKey: queryKeys.chat.sendMessage(sessionId),
    mutationFn: sendChatMessage,
  });
}
