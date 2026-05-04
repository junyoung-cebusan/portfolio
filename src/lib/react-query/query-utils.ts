const chatKeys = {
  all: ["chat"] as const,
  session: (sessionId: string) =>
    [...chatKeys.all, "session", sessionId] as const,
  messages: (sessionId: string) =>
    [...chatKeys.session(sessionId), "messages"] as const,
  sendMessage: (sessionId: string) =>
    [...chatKeys.messages(sessionId), "send"] as const,
  readDocument: () => [...chatKeys.all, "read-document"] as const,
};

const detailKeys = {
  all: ["detail"] as const,
  analysis: (jdText: string) =>
    [...detailKeys.all, "analysis", jdText] as const,
  highlight: (jdText: string) =>
    [...detailKeys.all, "highlight", jdText] as const,
  graph: (jdText: string) => [...detailKeys.all, "graph", jdText] as const,
};

export const queryKeys = {
  chat: chatKeys,
  detail: detailKeys,
};
