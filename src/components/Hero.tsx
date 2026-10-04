"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { site } from "@/data/site";

export function Hero() {
  const { scrollY } = useScroll();
  const textY = useTransform(scrollY, [0, 500], [0, 200]);
  const backgroundY = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative flex h-screen items-center justify-center overflow-hidden bg-neutral-950 px-6">
      <motion.div style={{ y: backgroundY }} className="pointer-events-none absolute inset-0">
        <div className="absolute left-[20%] top-[-20%] h-[60vw] w-[60vw] rounded-full bg-violet-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[20%] h-[50vw] w-[50vw] rounded-full bg-blue-900/20 blur-[120px]" />
      </motion.div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute h-[600px] w-[600px] rounded-full border border-dashed border-white/10 opacity-50 md:h-[800px] md:w-[800px]" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} className="absolute h-[450px] w-[450px] rounded-full border border-white/10 opacity-40 md:h-[600px] md:w-[600px]">
          <div className="absolute left-0 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
        </motion.div>
        <motion.div animate={{ rotate: 180 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }} className="absolute h-[800px] w-[800px] rounded-full border border-dotted border-white/5 opacity-50 md:h-[1100px] md:w-[1100px]" />
      </div>

      <motion.div style={{ y: textY, opacity }} className="relative z-10 mx-auto flex max-w-6xl flex-col items-center text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-mono uppercase tracking-widest text-neutral-400 backdrop-blur-md">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" /></span>
            {site.availability}
          </div>
        </motion.div>

        <motion.h1
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
  className="mb-12 tracking-tighter text-white"
>
  <span className="block text-6xl font-medium leading-none md:text-[7rem]">
    {site.headlineTop}
  </span>

  <span className="mt-3 block max-w-100% font-serif text-5xl italic leading-[0.9] text-neutral-500 md:text-[6rem]">
    {site.headlineAccent}
  </span>
</motion.h1>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 1 }} className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-lg font-light text-neutral-400 md:flex-row md:gap-16">
          <p className="flex-1 leading-relaxed md:text-right">{site.intro}</p>
          <div className="hidden h-16 w-px bg-white/10 md:block" />
          <p className="flex-1 leading-relaxed md:text-left">{site.location}</p>
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="absolute bottom-12 flex flex-col items-center gap-4">
        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-600">Scroll</span>
        <div className="h-24 w-px overflow-hidden bg-gradient-to-b from-transparent via-white/20 to-transparent"><motion.div animate={{ y: [-100, 100] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="h-1/2 w-full bg-gradient-to-b from-transparent via-white to-transparent" /></div>
      </motion.div>
    </section>
  );
}
