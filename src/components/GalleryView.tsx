"use client";

import Link from "next/link";
import { ArrowLeft, X, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import type { GalleryItem } from "@/lib/content";

const tileStyles = [
  "h-64 md:h-80",
  "h-80 md:h-[30rem]",
  "h-56 md:h-72",
  "h-72 md:h-96",
  "h-96 md:h-[34rem]",
  "h-64 md:h-72",
  "h-80 md:h-[26rem]",
  "h-60 md:h-[22rem]",
];

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
    <main className="min-h-screen bg-neutral-950 px-6 pb-32 pt-36 text-white">
      <div className="container mx-auto">
        <Link href="/" className="mb-10 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-500 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="mb-20 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="mb-6 text-xs font-mono uppercase tracking-[0.3em] text-neutral-500">Visual Archive</p>
            <h1 className="text-6xl font-medium leading-[0.9] tracking-tighter md:text-9xl">
              Creative<br /><span className="font-serif italic text-neutral-500">Gallery</span>
            </h1>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-neutral-400">Selected visual work, experiments, campaigns, and design explorations.</p>
        </div>

        {items.length ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
            {items.map((item, index) => (
              <motion.button
                type="button"
                key={item.id}
                onClick={() => setSelected(item)}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.5) }}
                className={`group relative overflow-hidden rounded-sm bg-neutral-900 text-left ${tileStyles[index % tileStyles.length]}`}
                aria-label={`Open ${item.title}`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  loading={index > 5 ? "lazy" : "eager"}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="max-w-[80%] truncate text-xs font-mono uppercase tracking-widest text-white">{item.title}</span>
                  <Maximize2 className="h-4 w-4 shrink-0" />
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-white/10 py-32 text-center text-neutral-500">Gallery is ready. Add your first images from the admin panel.</div>
        )}
      </div>

      <AnimatePresence>
        {selected ? (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelected(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              className="relative flex max-h-[92vh] max-w-[94vw] flex-col overflow-hidden rounded-sm bg-neutral-950 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-white hover:text-black"
                aria-label="Close image"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex max-h-[84vh] items-center justify-center bg-neutral-900">
                <img src={selected.image} alt={selected.title} className="max-h-[84vh] max-w-[94vw] object-contain" />
              </div>
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <p className="truncate text-xs font-mono uppercase tracking-widest text-neutral-400">{selected.title}</p>
                <p className="shrink-0 text-xs text-neutral-600">ESC to close</p>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
