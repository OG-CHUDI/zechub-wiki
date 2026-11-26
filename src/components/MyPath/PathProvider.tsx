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
import { Dialog, DialogPanel, DialogTitle, Description } from "@headlessui/react";
import { usePathCopy } from "./usePathCopy";

const STORAGE_KEY = "zechub-my-path-v1";
const CHANGE_EVENT = "zechub:my-path-changed";
type SavedPage = { href: string; title: string };
type PathState = {
  activePath: string | null;
  completed: Record<string, string[]>;
  saved: SavedPage[];
};
const emptyState: PathState = { activePath: null, completed: {}, saved: [] };
type StorageMode = "undecided" | "memory" | "persistent";
let sharedState: PathState = emptyState;
let sharedMode: StorageMode = "undecided";
let initialized = false;

/** Reset in-memory state between isolated tests. */
export function resetPathSessionForTests() {
  if (process.env.NODE_ENV !== "test") return;
  sharedState = emptyState;
  sharedMode = "undecided";
  initialized = false;
}

function readConsented(raw: string | null): PathState | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    return value?.version === 2 && value?.consent === true
      ? parsePathState(JSON.stringify(value.state)) : null;
  } catch { return null; }
}

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
  storageMode: StorageMode;
  requestSaving: () => void;
  choosePath: (id: string) => void;
  toggleStep: (id: string, href: string) => void;
  toggleSaved: (href: string, title: string) => void;
  resetPath: (id: string) => void;
  clearAll: () => void;
};
const PathContext = createContext<PathContextValue | null>(null);

export function PathProvider({ children }: { children: ReactNode }) {
  const { copy } = usePathCopy();
  const [state, setState] = useState<PathState>(emptyState);
  const [storageMode, setStorageMode] = useState<StorageMode>("undecided");
  const pending = useRef<((state: PathState) => PathState) | null>(null);
  const [promptOpen, setPromptOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  useEffect(() => {
    try {
      if (!initialized) {
        const initial = readConsented(localStorage.getItem(STORAGE_KEY));
        sharedState = initial ?? emptyState;
        sharedMode = initial ? "persistent" : "undecided";
        initialized = true;
      }
    } catch {
      setStorageAvailable(false);
    }
    setState(sharedState);
    setStorageMode(sharedMode);
    setReady(true);
    const sync = (event: StorageEvent) => {
      if ((event.key === STORAGE_KEY || event.key === null) && sharedMode === "persistent") {
        const next = readConsented(event.newValue);
        sharedState = next ?? emptyState;
        sharedMode = next ? "persistent" : "undecided";
        window.dispatchEvent(new Event(CHANGE_EVENT));
      }
    };
    window.addEventListener("storage", sync);
    const syncLocal = () => {
      setState(sharedState);
      setStorageMode(sharedMode);
    };
    window.addEventListener(CHANGE_EVENT, syncLocal);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(CHANGE_EVENT, syncLocal);
    };
  }, []);
  const apply = useCallback((fn: (previous: PathState) => PathState, removeStored = false) => {
    const next = fn(sharedState);
    sharedState = next;
    setState(next);
    try {
      if (removeStored) localStorage.removeItem(STORAGE_KEY);
      else if (sharedMode === "persistent") localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, consent: true, state: next }));
    } catch {
      setStorageAvailable(false);
      sharedMode = "memory";
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);
  const update = useCallback((fn: (previous: PathState) => PathState) => {
    if (sharedMode === "undecided") {
      pending.current = fn;
      setPromptOpen(true);
    } else apply(fn);
  }, [apply]);
  const chooseStorage = (save: boolean) => {
    const action = pending.current;
    pending.current = null;
    if (save) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        // A prior version saved progress without asking. Only restore it after opt-in.
        if (sharedMode === "undecided" && raw && !readConsented(raw)) sharedState = parsePathState(raw);
      } catch { setStorageAvailable(false); }
      sharedMode = "persistent";
    } else {
      sharedMode = "memory";
      try { localStorage.removeItem(STORAGE_KEY); } catch { setStorageAvailable(false); }
    }
    setPromptOpen(false);
    if (action) apply(action);
  };
  const value = useMemo<PathContextValue>(
    () => ({
      state,
      ready,
      storageAvailable,
      storageMode,
      requestSaving: () => { pending.current = (current) => current; setPromptOpen(true); },
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
      clearAll: () => { sharedMode = "undecided"; apply(() => emptyState, true); },
    }),
    [state, ready, storageAvailable, storageMode, update, apply],
  );
  return <PathContext.Provider value={value}>{children}
    <Dialog open={promptOpen} onClose={() => { pending.current = null; setPromptOpen(false); }} className="relative z-[11000]">
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-300 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-600 dark:bg-slate-900 dark:text-white sm:p-8">
          <DialogTitle className="text-2xl font-semibold">{copy.consentTitle}</DialogTitle>
          <Description className="mt-4 leading-relaxed text-slate-700 dark:text-slate-200">{copy.consentIntro}</Description>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{copy.consentDetails}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{copy.consentMemory}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => chooseStorage(true)} className="min-h-11 rounded-lg bg-[color:color-mix(in_srgb,var(--color-brand)_75%,black)] px-4 py-2 font-semibold text-on-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">{copy.consentSave}</button>
            <button type="button" onClick={() => chooseStorage(false)} className="min-h-11 rounded-lg border border-slate-400 px-4 py-2 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">{copy.consentNoSave}</button>
          </div>
          <button type="button" onClick={() => { pending.current = null; setPromptOpen(false); }} className="mt-4 text-sm underline underline-offset-4">{copy.consentCancel}</button>
        </DialogPanel>
      </div>
    </Dialog>
  </PathContext.Provider>;
}

export function useMyPath() {
  const value = useContext(PathContext);
  if (!value) throw new Error("useMyPath must be used inside PathProvider");
  return value;
}
