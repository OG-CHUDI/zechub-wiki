"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Compass, X } from "lucide-react";
import { PathProvider } from "@/components/MyPath/PathProvider";
import MyPathPage from "@/components/MyPath/MyPathPage";
import {
  DATA_ATTRIBUTE,
  DEFAULT_INTERFACE,
  INTERFACES,
  applyInterface,
  saveInterface,
} from "@/lib/interfaces";

export default function DesktopInterfaceHost({ locale }: { locale: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [active, setActive] = useState(DEFAULT_INTERFACE);
  const [frameSrc, setFrameSrc] = useState<string | null>(null);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [pathOpen, setPathOpen] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const pathButtonRef = useRef<HTMLButtonElement>(null);
  const pathPanelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (pathOpen) pathPanelRef.current?.focus();
  }, [pathOpen]);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () =>
      setActive(root.getAttribute(DATA_ATTRIBUTE) || DEFAULT_INTERFACE);
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, {
      attributes: true,
      attributeFilter: [DATA_ATTRIBUTE],
    });
    return () => observer.disconnect();
  }, []);

  const option = INTERFACES.find((item) => item.id === active && item.embedUrl);
  const open = Boolean(option?.embedUrl);
  const theme = resolvedTheme === "light" ? "paper" : "vault";
  const localePath = locale === "en" ? "" : `/${locale}`;

  useEffect(() => {
    if (open) return;
    setFrameSrc(null);
    setFrameLoaded(false);
    setVisible(false);
    setClosing(false);
    setPathOpen(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => setVisible(true), 10);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open || frameSrc || !option?.embedUrl) return;
    const url = new URL(`${option.embedUrl}${localePath}`);
    url.searchParams.set("theme", theme);
    url.searchParams.set("parentOrigin", window.location.origin);
    setFrameSrc(url.toString());
  }, [open, frameSrc, option?.embedUrl, localePath, theme]);

  useEffect(() => {
    if (!open || !frameLoaded || !option?.embedUrl) return;
    const frame = frameRef.current;
    if (!frame?.contentWindow) return;
    frame.contentWindow.postMessage(
      { type: "zechub:theme", theme },
      new URL(option.embedUrl).origin,
    );
  }, [open, frameLoaded, option?.embedUrl, theme]);

  const closeDesktop = useCallback(
    (next: string) => {
      if (closing) return;
      setClosing(true);
      window.setTimeout(() => {
        applyInterface(next);
        saveInterface(next);
        setActive(next);
        setClosing(false);
      }, 220);
    },
    [closing],
  );

  useEffect(() => {
    if (!open || !option?.embedUrl) return;
    const appOrigin = new URL(option.embedUrl).origin;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== appOrigin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      if (!event.data) return;
      if (event.data.type === "zechub:theme") {
        const next: unknown = event.data.theme;
        if (next !== "paper" && next !== "vault") return;
        setTheme(next === "paper" ? "light" : "dark");
        return;
      }
      if (event.data.type === "zechub:switch-interface") {
        const next: unknown = event.data.interface;
        if (next !== "classic" && next !== "reader") return;
        closeDesktop(next);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [open, option?.embedUrl, setTheme, closeDesktop]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (pathOpen) {
        setPathOpen(false);
        pathButtonRef.current?.focus();
        return;
      }
      closeDesktop(DEFAULT_INTERFACE);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, closeDesktop, pathOpen]);

  if (!open || !option?.embedUrl) return null;
  const embedUrl = option.embedUrl;

  const sendTheme = () => {
    frameRef.current?.contentWindow?.postMessage(
      { type: "zechub:theme", theme },
      new URL(embedUrl).origin,
    );
  };

  // The desktop is a different origin. Keep progress in the wiki's storage,
  // and open selected wiki pages inside the existing desktop frame.
  const openDesktopPage = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
    if (
      !anchor ||
      anchor.origin !== window.location.origin ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    )
      return;
    event.preventDefault();
    const url = new URL(
      anchor.pathname + anchor.search + anchor.hash,
      new URL(embedUrl).origin,
    );
    url.searchParams.set("theme", theme);
    url.searchParams.set("parentOrigin", window.location.origin);
    setFrameLoaded(false);
    setFrameSrc(url.toString());
    setPathOpen(false);
  };

  return (
    <div
      className={`fixed inset-0 z-[10000] transition-opacity duration-200 ${
        theme === "paper" ? "bg-[#f4efe4]" : "bg-black"
      } ${visible && !closing ? "opacity-100" : "opacity-0"}`}
    >
      {frameSrc ? (
        <iframe
          ref={frameRef}
          src={frameSrc}
          title="ZecHub Desktop"
          allow="clipboard-write; fullscreen"
          onLoad={() => {
            setFrameLoaded(true);
            sendTheme();
          }}
          className={`h-full w-full border-0 transition-opacity duration-300 ${
            frameLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : null}
      {!frameLoaded ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            aria-hidden="true"
            className={`h-6 w-6 animate-spin rounded-full border-2 border-t-transparent ${
              theme === "paper" ? "border-stone-400" : "border-white/40"
            }`}
          />
        </div>
      ) : null}
      <button
        ref={pathButtonRef}
        type="button"
        aria-expanded={pathOpen}
        aria-controls="desktop-my-path"
        onClick={() => setPathOpen((value) => !value)}
        className="absolute bottom-4 right-4 z-10 inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:border-slate-600 dark:bg-slate-900 dark:text-white"
      >
        <Compass size={18} aria-hidden="true" /> My Path
      </button>
      {pathOpen && (
        <aside
          ref={pathPanelRef}
          id="desktop-my-path"
          aria-label="My Path"
          tabIndex={-1}
          className="absolute inset-y-0 right-0 z-20 w-full max-w-2xl overflow-y-auto border-l border-slate-200 bg-page shadow-2xl dark:border-slate-700 dark:bg-surface"
        >
          <div className="sticky top-0 z-10 flex justify-end border-b border-slate-200 bg-page p-3 dark:border-slate-700 dark:bg-surface">
            <button
              type="button"
              onClick={() => {
                setPathOpen(false);
                pathButtonRef.current?.focus();
              }}
              aria-label="Close My Path"
              className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <div onClickCapture={openDesktopPage}>
            <PathProvider>
              <MyPathPage />
            </PathProvider>
          </div>
        </aside>
      )}
    </div>
  );
}
