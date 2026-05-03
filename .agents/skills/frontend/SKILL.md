---
name: frontend
description: "Use when creating or modifying Next.js frontend code: UI components, pages, layouts, route handlers, API routes, server actions, forms, hooks, client/server boundaries, TanStack Query hooks, or Zustand stores. Applies Next.js best practices and requires agent-friendly components that are easy for future agents to inspect, edit, test, and reuse."
metadata:
  version: "0.1.0"
---

# Frontend

Use this skill for any Next.js UI, API route/Route Handler, Server Action, hook, TanStack Query, Zustand, or client/server boundary work.

## First Steps

1. Read the repo patterns before editing: nearby components, routes, actions, hooks, styling, validation, and tests.
2. For Next.js APIs or conventions, read the relevant local guide under `node_modules/next/dist/docs/` before coding. This repo may use a Next version with breaking changes.
3. Keep changes scoped. Prefer existing project helpers, components, tokens, and filesystem conventions.
4. Verify with `yarn tsc --noEmit`, lint, and focused tests/builds when available.

## Next.js Defaults

- Prefer Server Components. Add `"use client"` only when the file needs browser state, effects, refs, event handlers, or browser-only APIs.
- Keep server-only work on the server: secrets, database clients, file access, provider SDK calls, and privileged API calls.
- Use Route Handlers in `app/api/**/route.ts` for HTTP endpoints. Use Web `Request`/`Response` APIs unless the project has a wrapper.
- Use Server Actions for trusted mutations initiated by the app UI. Validate inputs, return predictable typed results, and revalidate or redirect intentionally.
- Avoid mixing data fetching, mutation logic, and dense UI in one large component. Extract helpers or child components when a file stops being easy to scan.
- Preserve accessibility: semantic elements first, labels for inputs, keyboard access for controls, and meaningful disabled/loading/error states.

## UI Component Pattern

Use this shape for new reusable components:

```tsx
import type { ComponentProps } from "react";

type ExampleCardProps = ComponentProps<"article"> & {
  title: string;
  description?: string;
};

export function ExampleCard({ title, description, className, ...props }: ExampleCardProps) {
  return (
    <article className={className} {...props}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </article>
  );
}
```

Prefer:
- Named exports over anonymous defaults for reusable components.
- Explicit `Props` types near the component.
- Native element props via `ComponentProps<"button">`, `ComponentProps<"section">`, etc. when wrapping HTML.
- Controlled inputs for forms unless an existing form library pattern says otherwise.
- Small pure helpers outside the component when they make rendering easier to understand.
- Conditional rendering with `condition && <Element />` when the false branch renders nothing; avoid `condition ? <Element /> : null` because `null` adds no meaning.

Avoid:
- Large prop bags with unclear shape.
- Hidden module-level mutable state.
- Unnecessary `useEffect` for derived values.
- Client components just to use formatting or constants.
- Overly generic abstractions before a second concrete use exists.

## TanStack Query Pattern

Any client-side fetch or remote data access must use TanStack Query through a dedicated hook. Do not call `fetch`, provider clients, or async data loaders directly inside UI components, event handlers, or `useEffect` when the data is server state. The main exception is streaming/one-shot commands, such as chat streaming, uploads, downloads, or fire-and-forget actions; still isolate those behind a named helper or dedicated hook when they grow beyond a small handler.

Do not use `useQuery`, `useSuspenseQuery`, `useMutation`, `useQueryClient`, or raw query keys directly in UI components. Always create a dedicated feature hook, then consume that hook from the component.

All query keys must be defined in `src/lib/react-query/queryUtils.ts`. Do not define query keys inside components or feature hooks. Feature hooks import key factories from `queryUtils.ts`.

Use this shape for queries:

```ts
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryUtils";

async function fetchProfile(userId: string) {
  const response = await fetch(`/api/profiles/${userId}`);
  if (!response.ok) throw new Error("Failed to load profile.");
  return response.json();
}

export function useProfileQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.profile.detail(userId),
    queryFn: () => fetchProfile(userId),
    enabled: Boolean(userId),
  });
}
```

Use this shape in `src/lib/react-query/queryUtils.ts`:

```ts
export const queryKeys = {
  profile: {
    all: ["profile"] as const,
    detail: (userId: string) => [...queryKeys.profile.all, userId] as const,
  },
};
```

Use this shape for mutations:

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryUtils";

export function useUpdateProfileMutation(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile.detail(userId) });
    },
  });
}
```

Rules:
- Any new client-side data fetching must be implemented with TanStack Query unless it is a deliberate streaming/command exception.
- Query keys live in `src/lib/react-query/queryUtils.ts` and are imported by dedicated hooks.
- Dedicated hooks may use `useQueryClient` for invalidation, prefetching, or cache updates, but UI components must not.
- Components consume `useProfileQuery()` or `useUpdateProfileMutation()`, not `useQuery()` or `useQueryClient()`.
- Keep fetchers small, typed, and outside React components.
- Use TanStack Query for server state: remote data, loading/error states, caching, invalidation, refetching, and mutations.
- Do not duplicate server state into Zustand unless there is a concrete UI-state reason.

## Zustand Pattern

Use Zustand only when data must be stored as client UI/application state across components and TanStack Query is not the right owner.

Good Zustand use cases:
- UI preferences and controls: selected tab, sidebar state, filters, draft wizard state, local layout settings.
- Cross-component ephemeral state that does not belong in the URL and is not remote server data.
- Optimistic local workflow state that needs to outlive one component.

Avoid Zustand for:
- Data fetched from APIs that TanStack Query can cache.
- Values that can be derived from props, URL params, query results, or component state.
- Secrets or server-only data.

Use this shape:

```ts
import { create } from "zustand";

type CareerChatState = {
  activeSessionId: string | null;
  setActiveSessionId: (sessionId: string | null) => void;
};

export const useCareerChatStore = create<CareerChatState>((set) => ({
  activeSessionId: null,
  setActiveSessionId: (activeSessionId) => set({ activeSessionId }),
}));
```

Rules:
- Keep stores focused by feature, not global catch-all stores.
- Export selectors or small hooks when the same selection is reused.
- Store the minimum state needed; derive everything else in selectors/components.
- Never use Zustand to bypass clear props for simple parent-child state.

## Route Handler Pattern

Use this shape for new API routes:

```ts
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // validate body before use

    return Response.json({ ok: true });
  } catch (error) {
    console.error("[api/name] request failed", error);
    return Response.json({ error: "Request failed." }, { status: 500 });
  }
}
```

For Route Handlers:
- Check required env vars before provider calls.
- Never expose secret values in responses or client code.
- Validate JSON and search params at runtime.
- Return consistent status codes and response shapes.
- Log enough context to debug failures without logging secrets or large user payloads.
- Add `export const runtime`, `maxDuration`, or caching config only when the route needs it.

## Server Action Pattern

Use this shape for new actions:

```ts
"use server";

type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function saveThing(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  // validate formData before mutation
  return { ok: true };
}
```

For Server Actions:
- Keep actions in server-only files.
- Validate and normalize `FormData`/input before mutation.
- Return serializable results.
- Use `revalidatePath`, `revalidateTag`, or `redirect` deliberately.
- Do not catch `redirect`/`notFound` as normal errors.

## Agent-Friendly Components

An agent-friendly component is optimized for future automated edits: its behavior is explicit, its boundaries are small, and an agent can modify one concern without rereading the whole feature.

File-splitting rule:
- Keep tiny, component-specific helpers in the same component file when they only clarify local rendering or event flow.
- Move pure data transforms, array updates, API-shape mappers, formatters, validators, and behavior-heavy helpers into a nearby `utils` file when they are reusable, testable without React, or make the component harder to scan.
- Move shared types into a feature-level `types.ts` when more than one file imports them.
- Prefer feature-local organization like `app/feature/components`, `app/feature/hooks`, `app/feature/utils`, and `app/feature/types.ts`.
- Avoid one large generic `utils.ts`; use specific files such as `messageUtils.ts`, `chatMappers.ts`, or `dateFormatters.ts`.

Best pattern:
- One primary responsibility per file. Split `Container`, repeated item components, and pure helpers when a component grows past a quick scan.
- Clear server/client boundary. Keep data loading and secrets in Server Components/actions/routes; keep interaction-only state in Client Components.
- Typed props are the public contract. Use narrow names, required fields for required UI, optional fields only when the fallback is obvious.
- Rendering is mostly declarative. Prefer derived constants over nested ternaries; extract complicated branches into named child components.
- States are explicit: empty, loading, error, disabled, optimistic, and success states should be visible in the code and UI where relevant.
- Styling is local and predictable. Use existing design tokens/classes and avoid dynamic class construction that hides layout behavior.
- Accessibility is built in, not patched later. Buttons are buttons, links are links, inputs have labels, icon-only controls have accessible names.
- Side effects are isolated. Effects should synchronize with external systems, not compute render data.
- Stable hooks and handlers. Use simple handler names (`handleSubmit`, `handleDelete`) and avoid inline complex logic inside JSX.
- Easy deletion and reuse. Avoid reaching into unrelated modules, global mutable state, or route-specific assumptions unless the filename makes that scope obvious.

Before finishing, reread the component as if another agent must change it tomorrow: the next edit point should be obvious.
