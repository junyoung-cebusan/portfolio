import { useSyncExternalStore } from "react";

type Subscribe = (onStoreChange: () => void) => () => void;

export function useClientHydration<TSnapshot = boolean>(
  subscribe: Subscribe = () => () => {},
  getSnapshot: () => TSnapshot = () => true as TSnapshot,
  getServerSnapshot: () => TSnapshot = () => false as TSnapshot,
) {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
