"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import type { Project } from "@/data/projects";

export function WorkArchive({ projects }: { projects: Project[] }) {
  return <main className="min-h-screen bg-neutral-950 px-6 pt-36 text-white"><div className="container mx-auto"><div className="mb-24 flex items-end justify-between"><div><Link href="/" className="mb-8 block text-xs font-mono uppercase tracking-widest text-neutral-500 transition-colors hover:text-white">← Back to Home</Link><h1 className="text-6xl font-medium leading-[0.9] tracking-tighter md:text-9xl">Project<br /><span className="font-serif italic text-neutral-500">Archive</span></h1></div></div><div className="grid gap-8 gap-y-16 pb-32 md:grid-cols-2 lg:grid-cols-3">{projects.map((project, index) => <motion.article key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="group"><Link href={`/work/${project.slug}`}><div className="relative mb-6 aspect-[3/4] overflow-hidden rounded-sm bg-neutral-900"><img src={project.image} alt={project.title} className="h-full w-full object-cover opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100" /><div className="absolute bottom-4 right-4 translate-y-4 rounded-full bg-white/10 p-3 opacity-0 backdrop-blur-md transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight className="h-5 w-5" /></div></div><div className="flex items-baseline justify-between border-t border-white/10 pt-4"><div><h2 className="mb-1 text-xl font-medium tracking-tight">{project.title}</h2><p className="text-xs font-mono uppercase tracking-widest text-neutral-500">{project.category}</p></div><span className="text-xs font-mono text-neutral-600">{project.year}</span></div></Link></motion.article>)}</div></div></main>;
}
