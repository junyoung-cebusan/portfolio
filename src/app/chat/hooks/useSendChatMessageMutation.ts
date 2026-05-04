import { useMutation } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/query-utils";
import type { ChatApiMessage } from "../types";
import { createChatCompletion } from "@/lib/api/generated/sdk.gen";

type SendChatMessageInput = {
  messages: ChatApiMessage[];
  onChunk: (content: string) => void;
};

async function sendChatMessage({ messages, onChunk }: SendChatMessageInput) {
  const response = await createChatCompletion({
    body: { messages },
    throwOnError: true,
  });

  const data = response.data;
  if (!data) {
    throw new Error("Failed to send message.");
  }

  // Handle streaming response
  const responseBody = response.response?.body;
  if (!responseBody) {
    throw new Error("The chat response did not include a stream.");
  }

  const reader = responseBody.getReader();
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
