"use client";

import Link from "next/link";
import { ArrowLeft, X, Maximize2, ChevronLeft, ChevronRight, Grid2X2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import type { GalleryItem } from "@/lib/content";

export function GalleryView({ items }: { items: GalleryItem[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selected = selectedIndex === null ? null : items[selectedIndex] ?? null;

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
    <main className="min-h-screen bg-[#080808] px-4 pb-28 pt-32 text-white sm:px-6 md:pt-36">
      <div className="container mx-auto">
        <Link href="/" className="mb-12 inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <header className="mb-12 flex flex-col justify-between gap-7 border-b border-white/10 pb-10 md:mb-16 md:flex-row md:items-end md:pb-12">
          <div>
            <p className="mb-5 text-[10px] font-mono uppercase tracking-[0.32em] text-neutral-500">The visual collection</p>
            <h1 className="text-6xl font-medium leading-[0.88] tracking-[-0.07em] sm:text-7xl md:text-8xl lg:text-[7.5rem]">
              Selected <span className="font-serif font-normal italic text-neutral-500">Visuals.</span>
            </h1>
          </div>
          <div className="flex max-w-sm items-end justify-between gap-8 md:pb-1">
            <p className="max-w-[17rem] text-sm leading-7 text-neutral-400">A growing archive of visual experiments, identities, campaigns, and digital craft.</p>
            <span className="shrink-0 pb-1 text-xs font-mono tabular-nums text-neutral-600">{String(items.length).padStart(2, "0")} WORKS</span>
          </div>
        </header>

        {items.length ? (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
            {items.map((item, index) => (
              <motion.button
                type="button"
                key={item.id}
                onClick={() => setSelectedIndex(index)}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.025, 0.4), duration: 0.45 }}
                className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl border border-white/[0.07] bg-[#141414] text-left outline-none transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_18px_55px_rgba(0,0,0,0.35)] focus-visible:ring-2 focus-visible:ring-white/70"
                aria-label={`Open ${item.title}`}
              >
                <img src={item.image} alt={item.title} loading={index > 5 ? "lazy" : "eager"} className="block h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.035]" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-between gap-3 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="min-w-0 truncate text-[10px] font-mono uppercase tracking-[0.16em] text-white">{item.title}</span>
                  <Maximize2 className="h-4 w-4 shrink-0 text-white" />
                </div>
                <span className="pointer-events-none absolute right-3 top-3 rounded-full border border-white/20 bg-black/35 px-2 py-1 text-[9px] font-mono tabular-nums text-white/80 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">{String(index + 1).padStart(2, "0")}</span>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-white/10 py-32 text-center text-neutral-500">Gallery is ready. Add your first images from the admin panel.</div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div
            key="gallery-lightbox"
            className="fixed inset-0 z-[100] flex flex-col bg-[#050505]/[0.98] text-white backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
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

            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-14 py-5 sm:px-24 md:px-28 md:py-8">
              <div className="pointer-events-none absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(#888 0.6px, transparent 0.6px)", backgroundSize: "18px 18px" }} />
              <AnimatePresence mode="wait">
                <motion.div
                  key={selected.id}
                  className="relative flex h-full w-full items-center justify-center"
                  initial={{ opacity: 0, scale: 0.985, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.985, y: -5 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                >
                  <img
                    src={selected.image}
                    alt={selected.title}
                    className="max-h-full max-w-full rounded-sm object-contain shadow-[0_25px_100px_rgba(0,0,0,0.55)]"
                  />
                </motion.div>
              </AnimatePresence>

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
              <div className="mx-auto mt-5 h-px max-w-6xl overflow-hidden bg-white/[0.08]">
                <motion.div className="h-full bg-white/70" initial={false} animate={{ width: `${((selectedIndex! + 1) / items.length) * 100}%` }} transition={{ duration: 0.3 }} />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
