import {
  createTextStreamResponse,
  streamChatCompletionText,
  type LLMChatMessage,
} from "@/lib/llm/openai-compatible";
import type { ApiErrorResponse, ChatRequestBody } from "@/lib/api/contracts";

export const runtime = "nodejs";
export const maxDuration = 60;

const REQUEST_TIMEOUT_MS = 60_000;
const CHAT_MAX_TOKENS = Number.parseInt(
  process.env.LLM_CHAT_MAX_TOKENS ?? "600",
  10,
);

function isLLMChatMessage(value: unknown): value is LLMChatMessage {
  if (!value || typeof value !== "object") return false;

  const message = value as Partial<LLMChatMessage>;
  return (
    (message.role === "system" ||
      message.role === "user" ||
      message.role === "assistant") &&
    typeof message.content === "string"
  );
}

function getMessages(body: ChatRequestBody): LLMChatMessage[] {
  if (Array.isArray(body.messages) && body.messages.length > 0) {
    const messages = body.messages.filter(isLLMChatMessage);
    if (messages.length > 0) {
      return messages;
    }
  }

  if (typeof body.prompt === "string" && body.prompt.trim()) {
    return [{ role: "user", content: body.prompt.trim() }];
  }

  throw new Error("Request body must include a non-empty messages array or prompt.");
}

function getErrorDetails(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      status: "status" in error ? error.status : undefined,
    };
  }

  return { message: String(error) };
}

export async function POST(req: Request) {
  let messages: LLMChatMessage[];

  try {
    messages = getMessages(await req.json());
  } catch (error) {
    return Response.json(
      {
        error: "Invalid chat request.",
        details: getErrorDetails(error).message,
      } satisfies ApiErrorResponse,
      { status: 400 },
    );
  }

  try {
    return createTextStreamResponse(
      streamChatCompletionText({
        messages,
        timeoutMs: REQUEST_TIMEOUT_MS,
        temperature: 0.4,
        topP: 0.85,
        maxTokens: Number.isFinite(CHAT_MAX_TOKENS) ? CHAT_MAX_TOKENS : 600,
      }),
      {
        onStreamError: (error) => {
          console.error("[api/chat] local LLM stream failed.", {
            model: process.env.LLM_MODEL_NAME,
            error: getErrorDetails(error),
          });
          return "The local LLM failed to generate a response.";
        },
      },
    );
  } catch (error) {
    console.error("[api/chat] local LLM request failed.", {
      model: process.env.LLM_MODEL_NAME,
      error: getErrorDetails(error),
    });

    return Response.json(
      {
        error: "The local LLM failed to generate a response.",
      } satisfies ApiErrorResponse,
      { status: 502 },
    );
  }
}
