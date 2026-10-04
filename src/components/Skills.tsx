"use client";

import { motion } from "motion/react";
import { site } from "@/data/site";

type SkillPillProps = {
  label: string;
  index: number;
};

function SkillPill({ label, index }: SkillPillProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.4,
        delay: index * 0.025,
      }}
      className="group relative overflow-hidden rounded-full p-[1px]"
    >
      <span
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[300%]
          w-[300%]
          -translate-x-1/2
          -translate-y-1/2
          animate-[spin_3s_linear_infinite]
          bg-[conic-gradient(from_0deg,transparent_0deg,transparent_245deg,rgba(255,255,255,0.2)_280deg,rgba(255,255,255,1)_315deg,transparent_360deg)]
        "
      />

      <span
        className="
          pointer-events-none
          absolute
          inset-0
          rounded-full
          bg-white/20
          opacity-0
          blur-lg
          transition-opacity
          duration-300
          group-hover:opacity-100
        "
      />

      <span
        className="
          relative
          z-10
          block
          cursor-default
          rounded-full
          bg-[#080808]
          px-5
          py-2.5
          text-sm
          text-neutral-200
          transition-all
          duration-300
          group-hover:bg-white
          group-hover:text-black
          md:text-base
        "
      >
        {label}
      </span>
    </motion.div>
  );
}

export function Skills() {
  return (
    <section
      id="skills"
      className="relative overflow-hidden bg-black px-5 py-24 text-white md:py-32"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-700/10 blur-[180px]" />

      <div className="relative z-10 mx-auto w-full md:w-[75%]">
        <div className="mb-8 flex items-center gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-300">
            Capabilities
          </h2>

          <div className="h-px w-20 bg-white/20" />
        </div>

        <div className="mb-16 flex w-full flex-wrap gap-3">
          {site.capabilities.map((capability, index) => (
            <SkillPill
              key={capability}
              label={capability}
              index={index}
            />
          ))}
        </div>

        <div className="mb-8 flex items-center gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-300">
            Tools
          </h2>

          <div className="h-px w-20 bg-white/20" />
        </div>

        <div className="flex w-full flex-wrap gap-3">
          {site.tools.map((tool, index) => (
            <SkillPill
              key={tool}
              label={tool}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}