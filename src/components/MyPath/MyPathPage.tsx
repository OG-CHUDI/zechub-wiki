"use client";

import {
  Bookmark,
  BookOpen,
  Code2,
  Check,
  ChevronRight,
  Compass,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { findPath, learningPaths } from "@/lib/learningPaths";
import { useMyPath } from "./PathProvider";

const button =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[color:color-mix(in_srgb,var(--color-brand)_75%,black)] px-4 py-2 text-sm font-semibold text-on-brand transition hover:bg-[color:color-mix(in_srgb,var(--color-brand)_65%,black)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900";
const secondary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800";

export default function MyPathPage() {
  const {
    state,
    ready,
    storageAvailable,
    choosePath,
    toggleStep,
    toggleSaved,
    resetPath,
    clearAll,
  } = useMyPath();
  const active = findPath(state.activePath);
  const completed = active ? (state.completed[active.id] ?? []) : [];
  const next = active?.steps.find((step) => !completed.includes(step.href));

  return (
    <main className="mx-auto max-w-6xl px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
      <div className="max-w-3xl">
        <p className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-slate-700 dark:text-slate-200">
          <Compass size={17} aria-hidden="true" /> Your space to learn
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
          Find your way with Zcash.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
          Choose a goal, explore at your own pace, and pick up where you left
          off. Your progress stays in this browser.
        </p>
        <p className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <LockKeyhole size={16} aria-hidden="true" /> No account or wallet
          connection needed.
        </p>
        {ready && !storageAvailable && (
          <p
            role="status"
            className="mt-4 rounded-lg border border-amber-400 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100"
          >
            Browser storage is unavailable. Your progress is temporary and may
            be lost when you leave this view.
          </p>
        )}
      </div>

      {ready && active && (
        <section
          className="mt-10 rounded-2xl border border-brand/25 bg-white p-6 shadow-sm dark:bg-slate-900 sm:p-8"
          aria-labelledby="active-path-heading"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                YOUR CURRENT PATH
              </p>
              <h2
                id="active-path-heading"
                tabIndex={-1}
                className="mt-2 scroll-mt-28 text-2xl font-semibold text-slate-950 dark:text-white"
              >
                {active.title}
              </h2>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                {active.description}
              </p>
            </div>
            <span className="rounded-full bg-brand/10 px-3 py-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
              {completed.length} of {active.steps.length} complete
            </span>
          </div>
          <div
            className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
            role="progressbar"
            aria-label={`${active.title} progress`}
            aria-valuemin={0}
            aria-valuemax={active.steps.length}
            aria-valuenow={completed.length}
          >
            <div
              className="h-full rounded-full bg-brand transition-[width] motion-reduce:transition-none"
              style={{
                width: `${(completed.length / active.steps.length) * 100}%`,
              }}
            />
          </div>
          {next ? (
            <Link className={`${button} mt-6`} href={next.href}>
              Continue: {next.title}
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
          ) : (
            <p className="mt-6 font-semibold text-emerald-700 dark:text-emerald-300">
              You completed this path. Explore another whenever you’re ready.
            </p>
          )}
          <ol className="mt-7 divide-y divide-slate-200 border-t border-slate-200 dark:divide-slate-700 dark:border-slate-700">
            {active.steps.map((step, index) => {
              const done = completed.includes(step.href);
              return (
                <li
                  key={step.href}
                  className="flex flex-wrap items-center gap-4 py-4 sm:flex-nowrap"
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${done ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
                  >
                    {done ? <Check size={18} /> : index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={step.href}
                      className="font-semibold text-slate-900 underline-offset-4 hover:underline dark:text-white"
                    >
                      {step.title}
                    </Link>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {step.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleStep(active.id, step.href)}
                    aria-pressed={done}
                    className={secondary}
                  >
                    {done ? "Completed" : "Mark complete"}
                    <span className="sr-only">: {step.title}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  `Reset progress for ${active.title}? Saved pages will stay.`,
                )
              )
                resetPath(active.id);
            }}
            className="mt-4 inline-flex items-center gap-2 text-sm text-slate-600 underline underline-offset-4 hover:text-brand dark:text-slate-400"
          >
            <RotateCcw size={14} aria-hidden="true" /> Reset this path
          </button>
        </section>
      )}

      <section className="mt-14" aria-labelledby="paths-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Choose your direction
            </p>
            <h2
              id="paths-heading"
              className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white"
            >
              {active
                ? "Explore other paths"
                : "Where would you like to start?"}
            </h2>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 min-[640px]:grid-cols-2">
          {learningPaths.map((path) => {
            const count = (state.completed[path.id] ?? []).length;
            const selected = active?.id === path.id;
            const PathIcon =
              path.id === "use"
                ? ShieldCheck
                : path.id === "build"
                  ? Code2
                  : path.id === "contribute"
                    ? Users
                    : BookOpen;
            return (
              <article
                key={path.id}
                className={`flex flex-col rounded-2xl border p-6 ${selected ? "border-brand bg-brand/5" : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-lg bg-brand/10 p-2 text-brand dark:text-brand-soft">
                    <PathIcon size={20} aria-hidden="true" />
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {path.steps.length} steps
                  </span>
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  {path.audience}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                  {path.title}
                </h3>
                <p className="mt-2 flex-1 leading-relaxed text-slate-600 dark:text-slate-300">
                  {path.description}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={!ready || selected}
                    onClick={() => {
                      choosePath(path.id);
                      requestAnimationFrame(() =>
                        document.getElementById("active-path-heading")?.focus(),
                      );
                    }}
                    className={selected ? secondary : button}
                  >
                    {selected
                      ? "Current path"
                      : count
                        ? "Return to path"
                        : "Start this path"}
                  </button>
                  {count > 0 && (
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {count} completed
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="saved-heading">
        <div className="flex items-center gap-3">
          <Bookmark className="text-brand" aria-hidden="true" />
          <h2
            id="saved-heading"
            className="text-2xl font-semibold text-slate-950 dark:text-white"
          >
            Saved pages
          </h2>
        </div>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Keep useful pages close, even when they’re not part of a path.
        </p>
        {!ready || state.saved.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
            <Sparkles className="mx-auto text-brand" aria-hidden="true" />
            <p className="mt-3 font-semibold text-slate-800 dark:text-slate-200">
              Your reading list starts here.
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Use “Save page” while exploring the wiki.
            </p>
          </div>
        ) : (
          <ul className="mt-5 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-5 dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-900">
            {state.saved.map((page) => (
              <li
                key={page.href}
                className="flex items-center justify-between gap-4 py-4"
              >
                <Link
                  href={page.href}
                  className="font-semibold text-slate-900 underline-offset-4 hover:underline dark:text-white"
                >
                  {page.title}
                </Link>
                <button
                  type="button"
                  onClick={() => toggleSaved(page.href, page.title)}
                  className="text-sm text-slate-600 underline underline-offset-4 dark:text-slate-300"
                >
                  Remove<span className="sr-only"> {page.title}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {ready && (state.activePath || state.saved.length > 0) && (
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "Clear all My Path progress and saved pages from this browser?",
                )
              )
                clearAll();
            }}
            className="mt-6 text-sm text-slate-500 underline underline-offset-4 hover:text-red-700 dark:text-slate-400"
          >
            Clear all My Path data
          </button>
        )}
      </section>
    </main>
  );
}
