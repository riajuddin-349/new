"use client";

import Link from "next/link";
import { ArrowLeft, X, Maximize2, ChevronLeft, ChevronRight, Grid2X2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryItem } from "@/lib/content";

export function GalleryView({ items }: { items: GalleryItem[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const warmedImages = useRef(new Set<string>());
  const warmImage = useCallback((src: string) => {
    if (!src || warmedImages.current.has(src)) return;
    warmedImages.current.add(src);
    const image = new window.Image();
    image.decoding = "async";
    image.src = src;
  }, []);
  const selected = selectedIndex === null ? null : items[selectedIndex] ?? null;

  useEffect(() => {
    setZoom(1);
  }, [selectedIndex]);

  const closePreview = useCallback(() => setSelectedIndex(null), []);
  const showPrevious = useCallback(() => {
    setSelectedIndex((index) => index === null || items.length === 0 ? index : (index - 1 + items.length) % items.length);
  }, [items.length]);
  const showNext = useCallback(() => {
    setSelectedIndex((index) => index === null || items.length === 0 ? index : (index + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (selectedIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePreview();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedIndex, closePreview, showPrevious, showNext]);

  return (
    <main className="min-h-screen bg-[#080808] px-5 pb-32 pt-28 text-white sm:px-8 md:px-10 md:pt-36">
      <div className="mx-auto w-full max-w-[1500px]">
        <Link href="/" className="mb-16 inline-flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.24em] text-neutral-500 transition-colors hover:text-white md:mb-24">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <header className="mb-14 flex flex-col justify-between gap-8 border-b border-white/10 pb-12 md:mb-20 md:flex-row md:items-end md:pb-14">
          <div>
            <p className="mb-6 text-[10px] font-mono uppercase tracking-[0.36em] text-neutral-500">The visual collection</p>
            <h1 className="text-[3.6rem] font-medium leading-[0.9] tracking-[-0.075em] sm:text-7xl md:text-8xl lg:text-[8rem]">
              Selected <span className="font-serif font-normal italic text-neutral-500">Visuals.</span>
            </h1>
          </div>
          <div className="flex max-w-md items-end justify-between gap-8 md:pb-2">
            <p className="max-w-[19rem] text-[13px] leading-7 text-neutral-400">A growing archive of visual experiments, identities, campaigns, and digital craft.</p>
            <span className="shrink-0 pb-1 text-xs font-mono tabular-nums text-neutral-600">{String(items.length).padStart(2, "0")} WORKS</span>
          </div>
        </header>

        {items.length ? (
          <div className="columns-1 gap-x-6 sm:columns-2 xl:columns-3 2xl:gap-x-8">
            {items.map((item, index) => (
              <motion.button
                type="button"
                key={item.id}
                onClick={() => { warmImage(item.image); setSelectedIndex(index); }}
                onPointerEnter={() => warmImage(item.image)}
                onFocus={() => warmImage(item.image)}
                onPointerDown={() => warmImage(item.image)}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.025, 0.4), duration: 0.45 }}
                className="group relative mb-10 block w-full break-inside-avoid text-left outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:mb-12"
                aria-label={`Open ${item.title}`}
              >
                <div className="relative overflow-hidden bg-[#111] ring-1 ring-inset ring-white/[0.08] transition duration-500 group-hover:ring-white/25">
                  <img src={item.image} alt={item.title} loading={index > 5 ? "lazy" : "eager"} className="block h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.035]" />
                  <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-white/[0.09] py-4 transition-colors duration-300 group-hover:border-white/30">
                  <span className="min-w-0 truncate text-[11px] font-medium tracking-[0.02em] text-neutral-400 transition-colors group-hover:text-white">{item.title}</span>
                  <span className="shrink-0 text-[9px] font-mono tabular-nums tracking-widest text-neutral-700">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <span className="pointer-events-none absolute right-3 top-3 flex h-9 w-9 translate-y-1 items-center justify-center border border-white/20 bg-black/40 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <Maximize2 className="h-4 w-4" />
                </span>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-white/10 py-32 text-center text-neutral-500">Gallery is ready. Add your first images from the admin panel.</div>
        )}
      </div>

      {selected ? (
          <div
            className="fixed inset-0 z-[100] flex flex-col bg-[#050505]/[0.98] text-white backdrop-blur-2xl"
            onMouseDown={(event) => { if (event.target === event.currentTarget) closePreview(); }}
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] px-4 sm:px-7">
              <div className="flex items-center gap-3">
                <Grid2X2 className="h-4 w-4 text-neutral-500" />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400">Visual archive</span>
                <span className="hidden text-[10px] text-neutral-700 sm:inline">/</span>
                <span className="hidden max-w-[35vw] truncate text-[10px] font-mono uppercase tracking-widest text-neutral-500 sm:inline">{selected.title}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono tabular-nums tracking-widest text-neutral-500">
                  <span className="text-white">{String(selectedIndex! + 1).padStart(2, "0")}</span>
                  <span className="mx-2 text-neutral-700">/</span>
                  {String(items.length).padStart(2, "0")}
                </span>
                <button type="button" onClick={closePreview} aria-label="Close preview" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-neutral-400 transition hover:border-white/40 hover:bg-white hover:text-black">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto px-14 py-5 sm:px-24 md:px-28 md:py-8">
              <div className="pointer-events-none absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(#888 0.6px, transparent 0.6px)", backgroundSize: "18px 18px" }} />
              <div className="relative flex h-full w-full items-center justify-center">
                  <img
                    src={selected.image}
                    alt={selected.title}
                    fetchPriority="high"
                    decoding="async"
                    style={{ maxHeight: `${zoom * 100}%`, maxWidth: `${zoom * 100}%` }}
                    className="h-auto w-auto shrink-0 rounded-sm object-contain shadow-[0_25px_100px_rgba(0,0,0,0.55)]"
                  />
              </div>

              {items.length > 1 ? (
                <>
                  <button type="button" onClick={showPrevious} aria-label="Previous image" className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-neutral-400 backdrop-blur transition hover:border-white/30 hover:bg-white hover:text-black sm:left-6 sm:h-12 sm:w-12">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button type="button" onClick={showNext} aria-label="Next image" className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-neutral-400 backdrop-blur transition hover:border-white/30 hover:bg-white hover:text-black sm:right-6 sm:h-12 sm:w-12">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              ) : null}

              <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 sm:bottom-6">
                <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-white/10 bg-[#111]/90 px-2 py-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl">
                  <button type="button" onClick={() => setZoom((value) => Math.max(1, Number((value - 0.25).toFixed(2))))} disabled={zoom <= 1} aria-label="Zoom out" className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30">
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="min-w-11 text-center text-[10px] font-mono tabular-nums text-neutral-300">{Math.round(zoom * 100)}%</span>
                  <button type="button" onClick={() => setZoom((value) => Math.min(3, Number((value + 0.25).toFixed(2))))} disabled={zoom >= 3} aria-label="Zoom in" className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30">
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <span className="mx-0.5 h-5 w-px bg-white/10" />
                  <button type="button" onClick={() => setZoom(1)} disabled={zoom === 1} aria-label="Reset zoom" className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30">
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-white/[0.08] px-5 pb-5 pt-4 sm:px-8 sm:pb-6">
              <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div className="min-w-0">
                  <p className="mb-2 text-[9px] font-mono uppercase tracking-[0.28em] text-neutral-600">Selected artwork</p>
                  <h2 className="max-w-3xl truncate text-lg font-medium tracking-tight sm:text-2xl">{selected.title}</h2>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-[9px] font-mono uppercase tracking-[0.16em] text-neutral-600">
                  <span className="hidden sm:inline">Navigate</span>
                  <kbd className="rounded border border-white/10 px-2 py-1 text-neutral-400">←</kbd>
                  <kbd className="rounded border border-white/10 px-2 py-1 text-neutral-400">→</kbd>
                  <span className="ml-1 text-neutral-700">ESC</span>
                  <span>Close</span>
                </div>
              </div>
              {items.length > 1 ? (
                <div className="mx-auto mt-5 flex max-w-6xl gap-2 overflow-x-auto pb-2 [scrollbar-width:thin] [scrollbar-color:#444_transparent]">
                  {items.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { warmImage(item.image); setSelectedIndex(index); }}
                      onPointerEnter={() => warmImage(item.image)}
                      aria-label={`View ${item.title}`}
                      aria-current={selectedIndex === index ? "true" : undefined}
                      className={`relative h-12 w-12 shrink-0 overflow-hidden border transition-all duration-300 sm:h-14 sm:w-14 ${selectedIndex === index ? "border-white opacity-100" : "border-white/10 opacity-40 hover:border-white/40 hover:opacity-80"}`}
                    >
                      <img src={item.image} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="mx-auto mt-3 h-px max-w-6xl overflow-hidden bg-white/[0.08]">
                <motion.div className="h-full bg-white/70" initial={false} animate={{ width: `${((selectedIndex! + 1) / items.length) * 100}%` }} transition={{ duration: 0.3 }} />
              </div>
            </div>
          </div>
        ) : null}
    </main>
  );
}
