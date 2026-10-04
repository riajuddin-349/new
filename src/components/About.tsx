"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { site } from "@/data/site";

export function About() {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section ref={ref} id="about" className="relative overflow-hidden bg-neutral-950 py-32">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      <div className="container mx-auto px-6">
        <div className="mb-24 flex items-center gap-6"><div className="flex items-baseline gap-3"><span className="font-serif text-lg italic">02</span><span className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-400">The Designer</span></div><div className="h-px w-32 bg-gradient-to-r from-white/30 to-transparent" /></div>

        <div className="grid items-start gap-20 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative z-10">
            <motion.h2 initial={{ opacity: 0, y: 100 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="mb-12 text-5xl font-medium leading-[0.9] tracking-tighter md:text-8xl">
              {site.aboutTitle}<br /><span className="font-serif italic text-neutral-500">{site.aboutAccent}</span> {site.aboutSuffix}
            </motion.h2>
            <div className="grid gap-12 text-lg font-light leading-relaxed text-neutral-400 md:grid-cols-2">
              <div className="space-y-6">{site.aboutParagraphs.slice(0, 2).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
              <div className="space-y-6">{site.aboutParagraphs.slice(2).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
            </div>
            <div className="mt-16 border-t border-white/5 pt-16">
              <div className="mb-16 grid grid-cols-3 gap-4 md:gap-8">{site.stats.map((stat, index) => <div key={stat.label} className={index < 2 ? "border-r border-white/5" : ""}><h4 className="text-3xl font-light md:text-4xl">{stat.value}</h4><p className="mt-2 text-[10px] uppercase tracking-widest text-neutral-500 md:text-xs">{stat.label}</p></div>)}</div>
              <span className="mb-6 block text-xs font-mono uppercase tracking-widest text-neutral-600">Industries & product spaces</span>
              <div className="flex flex-wrap gap-x-12 gap-y-4 text-lg font-light text-neutral-400">{site.clients.map((client) => <span key={client} className="transition-colors hover:text-white">{client}</span>)}</div>
            </div>
          </div>

          <motion.div style={{ opacity: imageOpacity }} className="relative lg:mt-24">
            <motion.div whileHover={{ scale: 0.98 }} transition={{ duration: 0.5 }} className="relative aspect-[4/5] overflow-hidden bg-neutral-900 grayscale transition-all duration-700 hover:grayscale-0">
              <img src={site.workspaceImage} alt="Designer workspace" className="h-full w-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
