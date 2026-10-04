"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { Project } from "@/data/projects";

export function Projects({ projects }: { projects: Project[] }) {
  return (
    <section id="work" className="bg-neutral-950 px-6 py-32">
      <div className="container mx-auto">
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-24 flex flex-col items-end justify-between gap-8 md:flex-row">
          <div>
            <div className="mb-8 flex items-center gap-6"><div className="flex items-baseline gap-3"><span className="font-serif text-lg italic">01</span><span className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-400">Selected Work</span></div><div className="h-px w-32 bg-gradient-to-r from-white/30 to-transparent" /></div>
            <h2 className="text-5xl font-medium leading-[0.9] tracking-tighter md:text-8xl">Designed for<br /><span className="font-serif italic text-neutral-500">real use</span></h2>
          </div>
          <Link href="/work" className="hidden border-b border-white/30 pb-2 text-xs font-mono uppercase tracking-widest transition-colors hover:text-neutral-300 md:block">View All Projects</Link>
        </motion.div>
        <div className="grid gap-8 md:grid-cols-2 md:gap-y-32">{projects.slice(0, 4).map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)}</div>
      </div>
    </section>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const even = index % 2 === 0;
  return (
    <motion.div ref={ref} style={{ y: even ? 0 : y }} className={`group cursor-pointer ${even ? "" : "md:mt-32"}`}>
      <Link href={`/work/${project.slug}`}>
        <div className="relative mb-8 aspect-[4/3] overflow-hidden rounded-sm bg-neutral-900">
          <motion.img whileHover={{ scale: 1.05 }} transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }} src={project.image} alt={project.title} className="absolute inset-0 h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100" />
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-950/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100"><div className="scale-0 rounded-full border border-white/10 bg-white/10 p-5 backdrop-blur-md transition-transform duration-500 group-hover:scale-100"><ArrowUpRight className="h-6 w-6" /></div></div>
        </div>
        <div className="flex items-end justify-between border-t border-white/10 pt-6"><div><h3 className="mb-2 text-3xl font-medium tracking-tight transition-colors group-hover:text-neutral-400">{project.title}</h3><p className="text-xs font-mono uppercase tracking-widest text-neutral-500">{project.category}</p></div><span className="text-xs font-mono text-neutral-600">{project.year}</span></div>
      </Link>
    </motion.div>
  );
}
