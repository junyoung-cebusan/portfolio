type LLMRole = "system" | "user" | "assistant";

export type LLMChatMessage = {
  role: LLMRole;
  content: string;
};

type LLMResponseFormat = {
  type: "json_object";
};

type StreamChatCompletionOptions = {
  messages: LLMChatMessage[];
  signal?: AbortSignal;
  timeoutMs?: number;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  numCtx?: number;
  numBatch?: number;
  topK?: number;
  repeatPenalty?: number;
  reasoningEffort?: "high" | "medium" | "low" | "none";
  seed?: number;
  keepAlive?: string;
  responseFormat?: LLMResponseFormat;
};

type EmbeddingOptions = {
  input: string | string[];
  model?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
};

type OpenAIStreamChunk = {
  choices?: Array<{
    delta?: {
      content?: string;
    };
    text?: string;
  }>;
};

type OpenAIEmbeddingResponse = {
  data?: Array<{
    embedding?: number[];
  }>;
  embeddings?: number[][];
};

type OllamaStreamChunk = {
  message?: {
    content?: string;
  };
  response?: string;
  done?: boolean;
};

const DEFAULT_TIMEOUT_MS = 60_000;

export class LLMApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "LLMApiError";
    this.status = status;
  }
}

function getLLMProfile() {
  return process.env.LLM_PROFILE?.trim().toLowerCase() === "cloud"
    ? "cloud"
    : "local";
}

function getProfileEnv(name: string) {
  const profile = getLLMProfile();
  return process.env[`LLM_${profile.toUpperCase()}_${name}`]?.trim();
}

function getLLMConfig() {
  const baseUrl = getProfileEnv("BASE_URL") ?? process.env.LLM_BASE_URL?.trim();
  const model = getProfileEnv("MODEL_NAME") ?? process.env.LLM_MODEL_NAME?.trim();
  const apiKey = getProfileEnv("API_KEY") ?? process.env.LLM_API_KEY?.trim();

  if (!baseUrl || !model) {
    throw new Error(
      "Missing LLM configuration. Set LLM_BASE_URL and LLM_MODEL_NAME.",
    );
  }

  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    model,
    apiKey,
  };
}

export function hasLLMConfig() {
  try {
    getLLMConfig();
    return true;
  } catch {
    return false;
  }
}

function getEmbeddingModel() {
  return process.env.LLM_EMBED_MODEL_NAME?.trim() || "nomic-embed-text";
}

function getEndpointStyle() {
  const configuredStyle = (
    getProfileEnv("ENDPOINT_STYLE") ?? process.env.LLM_ENDPOINT_STYLE
  )
    ?.trim()
    .toLowerCase();
  if (configuredStyle === "ollama" || configuredStyle === "openai") {
    return configuredStyle;
  }

  const baseUrl = getLLMConfig().baseUrl.toLowerCase();
  return baseUrl.includes("ollama.com") && !baseUrl.endsWith("/v1")
    ? "ollama"
    : "openai";
}

function isOllamaCloud() {
  return getLLMConfig().baseUrl.toLowerCase().includes("ollama.com");
}

function shouldSendAuthHeader() {
  return (
    getProfileEnv("SEND_AUTH") ?? process.env.LLM_SEND_AUTH
  )?.trim().toLowerCase() === "true";
}

function getKeepAlive(optionsKeepAlive?: string) {
  return optionsKeepAlive ?? process.env.LLM_KEEP_ALIVE?.trim();
}

function getThinkOption() {
  const configuredThink = (
    getProfileEnv("THINK") ?? process.env.LLM_THINK
  )?.trim().toLowerCase();

  if (!configuredThink) {
    return undefined;
  }

  if (configuredThink === "true") {
    return true;
  }

  if (configuredThink === "false") {
    return false;
  }

  if (
    configuredThink === "low" ||
    configuredThink === "medium" ||
    configuredThink === "high"
  ) {
    return configuredThink;
  }

  return undefined;
}

function getPositiveIntegerEnv(name: string) {
  const value = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function getNumberEnv(name: string) {
  const value = Number.parseFloat(process.env[name] ?? "");
  return Number.isFinite(value) ? value : undefined;
}

function getOllamaOptions(options: StreamChatCompletionOptions) {
  const numCtx = options.numCtx ?? getPositiveIntegerEnv("LLM_NUM_CTX");
  const numBatch = options.numBatch ?? getPositiveIntegerEnv("LLM_NUM_BATCH");
  const topK = options.topK ?? getPositiveIntegerEnv("LLM_TOP_K");
  const repeatPenalty =
    options.repeatPenalty ?? getNumberEnv("LLM_REPEAT_PENALTY");
  const numPredict =
    options.maxTokens ?? getPositiveIntegerEnv("LLM_NUM_PREDICT");

  const ollamaOptions = {
    ...(numCtx ? { num_ctx: numCtx } : {}),
    ...(numBatch ? { num_batch: numBatch } : {}),
    ...(numPredict ? { num_predict: numPredict } : {}),
    ...(topK ? { top_k: topK } : {}),
    ...(repeatPenalty ? { repeat_penalty: repeatPenalty } : {}),
  };

  return Object.keys(ollamaOptions).length > 0 ? ollamaOptions : undefined;
}

function getOllamaChatUrl(baseUrl: string) {
  return baseUrl.endsWith("/api") ? `${baseUrl}/chat` : `${baseUrl}/api/chat`;
}

function getOllamaEmbedUrl(baseUrl: string) {
  return baseUrl.endsWith("/api") ? `${baseUrl}/embed` : `${baseUrl}/api/embed`;
}

function getOpenAIChatUrl(baseUrl: string) {
  return `${baseUrl}/chat/completions`;
}

function getOpenAIEmbeddingUrl(baseUrl: string) {
  return `${baseUrl}/embeddings`;
}

function normalizeEmbeddingInput(input: string | string[]) {
  if (typeof input === "string") {
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      throw new LLMApiError("Embedding input must be a non-empty string.");
    }

    return trimmedInput;
  }

  const normalizedInput = input
    .map((item) => item.trim())
    .filter(Boolean);

  if (normalizedInput.length === 0) {
    throw new LLMApiError("Embedding input must include at least one non-empty string.");
  }

  return normalizedInput;
}

function createTimeoutSignal(timeoutMs: number, parentSignal?: AbortSignal) {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);

  if (!parentSignal) {
    return timeoutSignal;
  }

  return AbortSignal.any([parentSignal, timeoutSignal]);
}

function createHeaders(apiKey: string | undefined, includeAuth: boolean) {
  const headers: Record<string, string> = {
    Accept: "text/event-stream",
    "Content-Type": "application/json",
  };

  if (includeAuth && apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  return headers;
}

async function fetchChatCompletions(
  options: StreamChatCompletionOptions,
  signal: AbortSignal,
  includeAuth: boolean,
) {
  const { baseUrl, model, apiKey } = getLLMConfig();
  const keepAlive = getKeepAlive(options.keepAlive);
  const ollamaOptions = getOllamaOptions(options);
  const endpointStyle = getEndpointStyle();
  const includeOllamaRuntimeOptions = endpointStyle !== "ollama" || !isOllamaCloud();
  const think = getThinkOption();
  const url =
    endpointStyle === "ollama"
      ? getOllamaChatUrl(baseUrl)
      : getOpenAIChatUrl(baseUrl);
  const body =
    endpointStyle === "ollama"
      ? {
          model,
          messages: options.messages,
          stream: true,
          ...(think !== undefined ? { think } : {}),
          ...(includeOllamaRuntimeOptions && keepAlive
            ? { keep_alive: keepAlive }
            : {}),
          ...(options.responseFormat?.type === "json_object"
            ? { format: "json" }
            : {}),
          options: {
            temperature: options.temperature ?? 0.2,
            ...(options.topP ? { top_p: options.topP } : {}),
            ...(includeOllamaRuntimeOptions ? (ollamaOptions ?? {}) : {}),
            ...(options.seed ? { seed: options.seed } : {}),
          },
        }
      : {
          model,
          messages: options.messages,
          stream: true,
          temperature: options.temperature ?? 0.2,
          ...(options.topP ? { top_p: options.topP } : {}),
          ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
          ...(options.reasoningEffort || think === false
            ? { reasoning_effort: options.reasoningEffort ?? "none" }
            : {}),
          ...(options.seed ? { seed: options.seed } : {}),
          ...(keepAlive ? { keep_alive: keepAlive } : {}),
          ...(ollamaOptions ? { options: ollamaOptions } : {}),
          ...(options.responseFormat
            ? { response_format: options.responseFormat }
            : {}),
        };

  return fetch(url, {
    method: "POST",
    headers: createHeaders(apiKey, includeAuth),
    body: JSON.stringify(body),
    cache: "no-store",
    signal,
  });
}

async function fetchEmbeddings(
  options: EmbeddingOptions,
  signal: AbortSignal,
  includeAuth: boolean,
) {
  const { baseUrl, apiKey } = getLLMConfig();
  const endpointStyle = getEndpointStyle();
  const url =
    endpointStyle === "ollama"
      ? getOllamaEmbedUrl(baseUrl)
      : getOpenAIEmbeddingUrl(baseUrl);
  const input = normalizeEmbeddingInput(options.input);

  return fetch(url, {
    method: "POST",
    headers: createHeaders(apiKey, includeAuth),
    body: JSON.stringify(
      endpointStyle === "ollama"
        ? {
            model: options.model ?? getEmbeddingModel(),
            input,
          }
        : {
            model: options.model ?? getEmbeddingModel(),
            input,
          },
    ),
    cache: "no-store",
    signal,
  });
}

async function getErrorMessage(response: Response) {
  const fallback = `LLM request failed with ${response.status} ${response.statusText}.`;

  try {
    const body = await response.json();
    const message = body?.error?.message ?? body?.error;
    return typeof message === "string"
      ? message
      : `${fallback} ${JSON.stringify(body)}`;
  } catch {
    const text = await response.text().catch(() => "");
    return text || fallback;
  }
}

async function createCompletionResponse(options: StreamChatCompletionOptions) {
  const signal = createTimeoutSignal(
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    options.signal,
  );
  const includeAuth = shouldSendAuthHeader();
  let response = await fetchChatCompletions(options, signal, includeAuth);

  if (includeAuth && response.status === 403) {
    response = await fetchChatCompletions(options, signal, false);
  } else if (!includeAuth && response.status === 401) {
    response = await fetchChatCompletions(options, signal, true);
  }

  if (!response.ok) {
    throw new LLMApiError(await getErrorMessage(response), response.status);
  }

  return response;
}

function parseStreamLine(line: string) {
  const data = line.startsWith("data:")
    ? line.slice("data:".length).trim()
    : line.trim();

  if (!data) {
    return "";
  }

  if (data === "[DONE]") {
    return "";
  }

  const chunk = JSON.parse(data) as OpenAIStreamChunk & OllamaStreamChunk;
  const openAIText =
    chunk.choices
      ?.map((choice) => choice.delta?.content ?? choice.text ?? "")
      .join("") ?? "";

  return openAIText || chunk.message?.content || chunk.response || "";
}

export async function* streamChatCompletionText(
  options: StreamChatCompletionOptions,
) {
  const response = await createCompletionResponse(options);

  if (!response.body) {
    throw new LLMApiError(
      "The local LLM response did not include a stream.",
      response.status,
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const text = parseStreamLine(line.trim());
      if (text) {
        yield text;
      }
    }
  }

  buffer += decoder.decode();
  if (buffer.trim()) {
    const text = parseStreamLine(buffer.trim());
    if (text) {
      yield text;
    }
  }
}

export async function collectChatCompletionText(
  options: StreamChatCompletionOptions,
) {
  let content = "";

  for await (const textDelta of streamChatCompletionText(options)) {
    content += textDelta;
  }

  return content;
}

export async function createEmbedding(options: EmbeddingOptions) {
  const signal = createTimeoutSignal(
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    options.signal,
  );
  const includeAuth = shouldSendAuthHeader();
  let response = await fetchEmbeddings(options, signal, includeAuth);

  if (includeAuth && response.status === 403) {
    response = await fetchEmbeddings(options, signal, false);
  } else if (!includeAuth && response.status === 401) {
    response = await fetchEmbeddings(options, signal, true);
  }

  if (!response.ok) {
    throw new LLMApiError(await getErrorMessage(response), response.status);
  }

  const body = (await response.json()) as OpenAIEmbeddingResponse;
  const embedding = body.data?.[0]?.embedding ?? body.embeddings?.[0];

  if (!embedding) {
    throw new LLMApiError("The local embedding response did not include a vector.");
  }

  return embedding;
}

export function createTextStreamResponse(
  textStream: AsyncIterable<string>,
  init?: ResponseInit & {
    onStreamError?: (error: unknown) => string | undefined;
  },
) {
  const encoder = new TextEncoder();
  const { onStreamError, ...responseInit } = init ?? {};

  return new Response(
    new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const textDelta of textStream) {
            controller.enqueue(encoder.encode(textDelta));
          }
          controller.close();
        } catch (error) {
          const fallbackText = onStreamError?.(error);
          if (fallbackText) {
            controller.enqueue(encoder.encode(fallbackText));
            controller.close();
            return;
          }

          controller.error(error);
        }
      },
    }),
    {
      ...responseInit,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        ...responseInit.headers,
      },
    },
  );
}
