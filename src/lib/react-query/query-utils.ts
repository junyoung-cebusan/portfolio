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
  analysis: (jdText: string, locale: string) =>
    [...detailKeys.all, "analysis", locale, jdText] as const,
  highlight: (jdText: string, locale: string) =>
    [...detailKeys.all, "highlight", locale, jdText] as const,
  graph: (jdText: string, locale: string) =>
    [...detailKeys.all, "graph", locale, jdText] as const,
};

export const queryKeys = {
  chat: chatKeys,
  detail: detailKeys,
};
