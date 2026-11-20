"use client";

import { Bookmark, Check, Compass } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { findPath, normalizePath } from "@/lib/learningPaths";
import type { Searcher } from "@/types";
import { useMyPath } from "./PathProvider";

export function PathEntry() {
  const { state, ready } = useMyPath();
  const path = findPath(state.activePath);
  const done = path ? (state.completed[path.id] ?? []).length : 0;
  return (
    <Link
      href="/my-path"
      aria-label={
        path && ready
          ? `My Path: ${done} of ${path.steps.length} steps complete`
          : "My Path"
      }
      className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-nav-foreground hover:bg-brand/10 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:px-3"
    >
      <Compass size={18} aria-hidden="true" />
      <span className="hidden sm:inline">My Path</span>
      {ready && path && (
        <span className="hidden rounded-full bg-brand/10 px-2 py-0.5 text-xs text-slate-800 dark:text-slate-100 md:inline">
          {done}/{path.steps.length}
        </span>
      )}
    </Link>
  );
}

export function HomePathCard() {
  const { state, ready } = useMyPath();
  const path = ready ? findPath(state.activePath) : undefined;
  const completed = path ? (state.completed[path.id] ?? []) : [];
  const next = path?.steps.find((step) => !completed.includes(step.href));
  return (
    <section
      className="mx-auto w-full max-w-7xl px-5 pt-10 sm:px-8"
      aria-label="My Path"
    >
      <div className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-brand/20 bg-brand/5 p-6 dark:bg-slate-900 sm:p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            My Path
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
            {path ? path.title : "Learn at your own pace"}
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            {path
              ? `${completed.length} of ${path.steps.length} steps complete${next ? ` · Next: ${next.title}` : " · Path complete"}`
              : "Choose a path, track your progress, and save pages for later."}
          </p>
        </div>
        <Link
          href={next?.href ?? "/my-path"}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[color:color-mix(in_srgb,var(--color-brand)_75%,black)] px-5 py-2 text-sm font-semibold text-on-brand hover:bg-[color:color-mix(in_srgb,var(--color-brand)_65%,black)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {path && next
            ? "Continue your path"
            : path
              ? "View your path"
              : "Explore learning paths"}
        </Link>
      </div>
    </section>
  );
}

export function PagePathActions({
  searchItems,
}: {
  searchItems: readonly Searcher[];
}) {
  const pathname = normalizePath(usePathname() || "/");
  const { state, ready, toggleStep, toggleSaved } = useMyPath();
  const active = findPath(state.activePath);
  const step = active?.steps.find(
    (item) => normalizePath(item.href) === pathname,
  );
  const item = searchItems.find(
    (entry) => normalizePath(entry.url) === pathname,
  );
  const title = step?.title ?? item?.name;
  if (!ready || !title || pathname === "/" || pathname === "/my-path")
    return null;
  const done =
    !!active && (state.completed[active.id] ?? []).includes(pathname);
  const saved = state.saved.some((page) => page.href === pathname);
  const next = active?.steps.find(
    (entry) =>
      entry.href !== pathname &&
      !(state.completed[active.id] ?? []).includes(entry.href),
  );
  return (
    <aside
      aria-label="My Path page actions"
      className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8"
    >
      <div className="text-sm text-slate-600 dark:text-slate-300">
        {step && active ? (
          <>
            <span className="font-semibold text-slate-800 dark:text-slate-100">
              {active.title}
            </span>{" "}
            · Step {active.steps.indexOf(step) + 1} of {active.steps.length}
          </>
        ) : (
          "Keep this page for later"
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={saved}
          onClick={() => toggleSaved(pathname, title)}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Bookmark size={16} aria-hidden="true" />
          {saved ? "Saved" : "Save page"}
        </button>
        {step && active && (
          <button
            type="button"
            aria-pressed={done}
            onClick={() => toggleStep(active.id, pathname)}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-brand/40 px-3 text-sm font-medium text-slate-800 hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:text-slate-100"
          >
            <Check size={16} aria-hidden="true" />
            {done ? "Completed" : "Mark complete"}
          </button>
        )}
        {done && next && (
          <Link
            href={next.href}
            className="inline-flex min-h-10 items-center rounded-lg bg-[color:color-mix(in_srgb,var(--color-brand)_75%,black)] px-3 text-sm font-semibold text-on-brand hover:bg-[color:color-mix(in_srgb,var(--color-brand)_65%,black)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Next: {next.title}
          </Link>
        )}
      </div>
    </aside>
  );
}
