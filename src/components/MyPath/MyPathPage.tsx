"use client";

import { useRef, useState } from "react";
import {
  Bookmark,
  BookOpen,
  Code2,
  Check,
  ChevronRight,
  ChevronLeft,
  Compass,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useMyPath } from "./PathProvider";
import { usePathCopy, formatPathText as fmt } from "./usePathCopy";

const button =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[color:color-mix(in_srgb,var(--color-brand)_75%,black)] px-4 py-2 text-sm font-semibold text-on-brand transition hover:bg-[color:color-mix(in_srgb,var(--color-brand)_65%,black)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900";
const secondary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800";

export default function MyPathPage() {
  const { copy, paths } = usePathCopy();
  const cardsRef = useRef<HTMLDivElement>(null);
  const [stepPage, setStepPage] = useState(0);
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
  const active = paths.find((path) => path.id === state.activePath);
  const completed = active ? (state.completed[active.id] ?? []) : [];
  const next = active?.steps.find((step) => !completed.includes(step.href));
  const recommended = paths.find((path) => path.id !== active?.id && path.steps.some((step) => !(state.completed[path.id] ?? []).includes(step.href)));
  const pageSize = 4;
  const pageCount = active ? Math.ceil(active.steps.length / pageSize) : 1;
  const currentPage = Math.min(stepPage, pageCount - 1);
  const scrollCards = (direction: number) => {
    const container = cardsRef.current;
    if (!container) return;
    const rtl = getComputedStyle(container).direction === "rtl";
    container.scrollBy({ left: direction * (rtl ? -1 : 1) * container.clientWidth * 0.8, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  return (
    <main className="mx-auto w-full min-w-0 max-w-6xl px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
      <div className="max-w-3xl">
        <p className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-slate-700 dark:text-slate-200">
          <Compass size={17} aria-hidden="true" /> {copy.learningPaths}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
          {copy.heading}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
          {copy.intro}
        </p>
        <p className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <LockKeyhole size={16} aria-hidden="true" /> {copy.privacy}
        </p>
        {ready && !storageAvailable && (
          <p
            role="status"
            className="mt-4 rounded-lg border border-amber-400 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100"
          >
            {copy.storageUnavailable}
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
                {copy.currentPath}
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
              {fmt(copy.completeCount, { done: completed.length, total: active.steps.length })}
            </span>
          </div>
          <div
            className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
            role="progressbar"
            aria-label={fmt(copy.progress, { title: active.title })}
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
              {fmt(copy.continueStep, { title: next.title })}
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
          ) : (
            <div className="mt-6 space-y-3">
              <p className="font-semibold text-emerald-700 dark:text-emerald-300">{copy.completedPath}</p>
              {recommended && <button type="button" className={button} onClick={() => { setStepPage(0); choosePath(recommended.id); requestAnimationFrame(() => document.getElementById("active-path-heading")?.focus()); }}>{fmt(copy.tryNextPath, { title: recommended.title })}</button>}
              <p><Link href="/sitemap" className="font-semibold text-slate-700 underline underline-offset-4 dark:text-slate-200">{copy.exploreWiki}</Link></p>
            </div>
          )}
          <ol className="mt-7 divide-y divide-slate-200 border-t border-slate-200 dark:divide-slate-700 dark:border-slate-700">
            {active.steps.slice(currentPage * pageSize, (currentPage + 1) * pageSize).map((step, pageIndex) => {
              const index = currentPage * pageSize + pageIndex;
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
                    {done ? copy.completed : copy.markComplete}
                    <span className="sr-only">: {step.title}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          {pageCount > 1 && <nav className="mt-4 flex flex-wrap items-center justify-between gap-3" aria-label={copy.stepPages}>
            <button type="button" className={`${secondary} disabled:opacity-40`} disabled={currentPage === 0} onClick={() => setStepPage((page) => Math.max(0, page - 1))}><ChevronLeft size={16} aria-hidden="true" className="rtl:rotate-180" />{copy.previous}</button>
            <span className="text-sm text-slate-600 dark:text-slate-300" aria-live="polite">{fmt(copy.pageOf, { page: currentPage + 1, total: pageCount })}</span>
            <button type="button" className={`${secondary} disabled:opacity-40`} disabled={currentPage >= pageCount - 1} onClick={() => setStepPage((page) => Math.min(pageCount - 1, page + 1))}>{copy.next}<ChevronRight size={16} aria-hidden="true" className="rtl:rotate-180" /></button>
          </nav>}
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  fmt(copy.resetConfirm, { title: active.title }),
                )
              )
                resetPath(active.id);
            }}
            className="mt-4 inline-flex items-center gap-2 text-sm text-slate-600 underline underline-offset-4 hover:text-brand dark:text-slate-400"
          >
            <RotateCcw size={14} aria-hidden="true" /> {copy.resetPath}
          </button>
        </section>
      )}

      <section className="mt-14" aria-labelledby="paths-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              {copy.learningPaths}
            </p>
            <h2
              id="paths-heading"
              className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white"
            >
              {active ? copy.allPaths : copy.choosePath}
            </h2>
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" disabled={!ready} className={`${secondary} disabled:opacity-40`} aria-label={copy.previousPaths} aria-controls="path-cards" onClick={() => scrollCards(-1)}><ChevronLeft size={18} aria-hidden="true" className="rtl:rotate-180" /></button>
            <button type="button" disabled={!ready} className={`${secondary} disabled:opacity-40`} aria-label={copy.nextPaths} aria-controls="path-cards" onClick={() => scrollCards(1)}><ChevronRight size={18} aria-hidden="true" className="rtl:rotate-180" /></button>
          </div>
        </div>
        <div id="path-cards" ref={cardsRef} role="region" tabIndex={0} aria-label={copy.allPaths} className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-5 pt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
          {paths.map((path) => {
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
                className={`flex w-[min(85%,22rem)] shrink-0 snap-start flex-col rounded-2xl border p-6 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none ${selected ? "border-brand bg-brand/5 shadow-sm" : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-lg bg-brand/10 p-2 text-brand dark:text-brand-soft">
                    <PathIcon size={20} aria-hidden="true" />
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {fmt(copy.stepCount, { count: path.steps.length })}
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
                      setStepPage(0);
                      choosePath(path.id);
                      requestAnimationFrame(() =>
                        document.getElementById("active-path-heading")?.focus(),
                      );
                    }}
                    className={selected ? secondary : button}
                  >
                    {selected
                      ? copy.currentPath
                      : count
                        ? copy.returnPath
                        : copy.startPath}
                  </button>
                  {count > 0 && (
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {fmt(copy.completedCount, { count })}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-14 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900" aria-labelledby="explore-wiki-heading">
        <h2 id="explore-wiki-heading" className="text-2xl font-semibold text-slate-950 dark:text-white">{copy.exploreWiki}</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{copy.exploreWikiDescription}</p>
        <Link href="/sitemap" className={`${secondary} mt-4`}>{copy.exploreWiki} <ChevronRight size={16} aria-hidden="true" /></Link>
      </section>

      <section className="mt-14" aria-labelledby="saved-heading">
        <div className="flex items-center gap-3">
          <Bookmark className="text-brand" aria-hidden="true" />
          <h2
            id="saved-heading"
            className="text-2xl font-semibold text-slate-950 dark:text-white"
          >
            {copy.savedPages}
          </h2>
        </div>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          {copy.savedDescription}
        </p>
        {!ready || state.saved.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
            <Bookmark className="mx-auto text-brand" aria-hidden="true" />
            <p className="mt-3 font-semibold text-slate-800 dark:text-slate-200">
              {copy.noSaved}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {copy.saveHint}
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
                  {copy.remove}<span className="sr-only"> {page.title}</span>
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
                  copy.clearConfirm,
                )
              )
                clearAll();
            }}
            className="mt-6 text-sm text-slate-500 underline underline-offset-4 hover:text-red-700 dark:text-slate-400"
          >
            {copy.clearAll}
          </button>
        )}
      </section>
    </main>
  );
}
