"use client";

import Link from "next/link";
import { ArrowLeft, X, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import type { GalleryItem } from "@/lib/content";

export function GalleryView({ items }: { items: GalleryItem[] }) {
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [selected]);

  return (
    <main className="min-h-screen bg-[#090909] px-4 pb-28 pt-32 text-white sm:px-6 md:pt-36">
      <div className="container mx-auto">
        <Link
          href="/"
          className="mb-12 inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <header className="mb-12 flex flex-col justify-between gap-7 border-b border-white/10 pb-10 md:mb-16 md:flex-row md:items-end md:pb-12">
          <div>
            <p className="mb-5 text-[10px] font-mono uppercase tracking-[0.32em] text-neutral-500">
              The visual collection
            </p>
            <h1 className="text-6xl font-medium leading-[0.88] tracking-[-0.07em] sm:text-7xl md:text-8xl lg:text-[7.5rem]">
              Selected <span className="font-serif font-normal italic text-neutral-500">Visuals.</span>
            </h1>
          </div>
          <div className="flex max-w-sm items-end justify-between gap-8 md:pb-1">
            <p className="max-w-[17rem] text-sm leading-7 text-neutral-400">
              A growing archive of visual experiments, identities, campaigns, and digital craft.
            </p>
            <span className="shrink-0 pb-1 text-xs font-mono tabular-nums text-neutral-600">
              {String(items.length).padStart(2, "0")} WORKS
            </span>
          </div>
        </header>

        {items.length ? (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
            {items.map((item, index) => (
              <motion.button
                type="button"
                key={item.id}
                onClick={() => setSelected(item)}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.025, 0.4), duration: 0.45 }}
                className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl border border-white/[0.07] bg-[#141414] text-left outline-none transition-colors duration-300 hover:border-white/20 focus-visible:ring-2 focus-visible:ring-white/70"
                aria-label={`Open ${item.title}`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  loading={index > 5 ? "lazy" : "eager"}
                  className="block h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-between gap-3 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="min-w-0 truncate text-[10px] font-mono uppercase tracking-[0.16em] text-white">
                    {item.title}
                  </span>
                  <Maximize2 className="h-4 w-4 shrink-0 text-white" />
                </div>
                <span className="pointer-events-none absolute right-3 top-3 rounded-full border border-white/20 bg-black/35 px-2 py-1 text-[9px] font-mono tabular-nums text-white/80 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-white/10 py-32 text-center text-neutral-500">
            Gallery is ready. Add your first images from the admin panel.
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected ? (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelected(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ duration: 0.22 }}
              className="relative flex max-h-[92vh] max-w-[94vw] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#101010] shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur transition hover:bg-white hover:text-black"
                aria-label="Close image"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex max-h-[84vh] items-center justify-center bg-[#080808]">
                <img
                  src={selected.image}
                  alt={selected.title}
                  className="max-h-[84vh] max-w-[94vw] object-contain"
                />
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-white/10 px-5 py-4">
                <p className="truncate text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-400">
                  {selected.title}
                </p>
                <p className="shrink-0 text-[10px] font-mono uppercase tracking-widest text-neutral-600">
                  ESC to close
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
