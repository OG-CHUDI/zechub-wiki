"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { findPath, learningPaths, normalizePath } from "@/lib/learningPaths";

const STORAGE_KEY = "zechub-my-path-v1";
type SavedPage = { href: string; title: string };
type PathState = {
  activePath: string | null;
  completed: Record<string, string[]>;
  saved: SavedPage[];
};
const emptyState: PathState = { activePath: null, completed: {}, saved: [] };

export function parsePathState(raw: string | null): PathState {
  if (!raw) return emptyState;
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value))
      return emptyState;
    const completed: Record<string, string[]> = {};
    for (const path of learningPaths) {
      const entries = value.completed?.[path.id];
      if (Array.isArray(entries))
        completed[path.id] = [
          ...new Set(
            entries.filter(
              (entry: unknown): entry is string =>
                typeof entry === "string" &&
                path.steps.some((step) => step.href === entry),
            ),
          ),
        ];
    }
    const saved: SavedPage[] = [];
    if (Array.isArray(value.saved))
      for (const item of value.saved.slice(0, 200)) {
        if (
          typeof item?.href !== "string" ||
          !/^\/(?!\/)[a-zA-Z0-9/_-]+\/?$/.test(item.href) ||
          typeof item.title !== "string"
        )
          continue;
        const href = normalizePath(item.href);
        if (!saved.some((page) => page.href === href))
          saved.push({ href, title: item.title.slice(0, 150) });
      }
    return {
      activePath: findPath(value.activePath)?.id ?? null,
      completed,
      saved,
    };
  } catch {
    return emptyState;
  }
}

type PathContextValue = {
  state: PathState;
  ready: boolean;
  storageAvailable: boolean;
  choosePath: (id: string) => void;
  toggleStep: (id: string, href: string) => void;
  toggleSaved: (href: string, title: string) => void;
  resetPath: (id: string) => void;
  clearAll: () => void;
};
const PathContext = createContext<PathContextValue | null>(null);

export function PathProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PathState>(emptyState);
  const stateRef = useRef<PathState>(emptyState);
  const [ready, setReady] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  useEffect(() => {
    try {
      const initial = parsePathState(localStorage.getItem(STORAGE_KEY));
      stateRef.current = initial;
      setState(initial);
    } catch {
      setStorageAvailable(false);
    }
    setReady(true);
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        const next = parsePathState(event.newValue);
        stateRef.current = next;
        setState(next);
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const update = useCallback((fn: (previous: PathState) => PathState) => {
    const next = fn(stateRef.current);
    stateRef.current = next;
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      setStorageAvailable(false);
    }
  }, []);
  const value = useMemo<PathContextValue>(
    () => ({
      state,
      ready,
      storageAvailable,
      choosePath: (id) => {
        if (findPath(id)) update((s) => ({ ...s, activePath: id }));
      },
      toggleStep: (id, href) => {
        if (!findPath(id)?.steps.some((step) => step.href === href)) return;
        update((s) => {
          const current = s.completed[id] ?? [];
          return {
            ...s,
            completed: {
              ...s.completed,
              [id]: current.includes(href)
                ? current.filter((item) => item !== href)
                : [...current, href],
            },
          };
        });
      },
      toggleSaved: (href, title) => {
        const path = normalizePath(href);
        if (!/^\/(?!\/)[a-zA-Z0-9/_-]+$/.test(path)) return;
        update((s) => ({
          ...s,
          saved: s.saved.some((page) => page.href === path)
            ? s.saved.filter((page) => page.href !== path)
            : [{ href: path, title: title.slice(0, 150) }, ...s.saved].slice(
                0,
                200,
              ),
        }));
      },
      resetPath: (id) =>
        update((s) => ({ ...s, completed: { ...s.completed, [id]: [] } })),
      clearAll: () => update(() => emptyState),
    }),
    [state, ready, storageAvailable, update],
  );
  return <PathContext.Provider value={value}>{children}</PathContext.Provider>;
}

export function useMyPath() {
  const value = useContext(PathContext);
  if (!value) throw new Error("useMyPath must be used inside PathProvider");
  return value;
}
