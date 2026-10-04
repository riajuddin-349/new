"use client";

import { Box, Globe, Layout, Smartphone } from "lucide-react";
import { motion } from "motion/react";
import { site } from "@/data/site";

const services = [
  { icon: Layout, title: "Product & UX Design", description: "Research, journeys, information architecture, wireframes, and tested product flows." },
  { icon: Smartphone, title: "UI & Prototyping", description: "Responsive interfaces, high-fidelity prototypes, and refined interaction details." },
  { icon: Globe, title: "Design Systems", description: "Reusable components, tokens, documentation, and scalable designer-developer workflows." },
  { icon: Box, title: "Developer Handoff", description: "Clear responsive states, specifications, assets, and implementation-ready design decisions." }
];

export function Services() {
  return (
    <section id="services" className="relative overflow-hidden bg-neutral-950 px-6 py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.03),transparent_50%)]" />
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="pointer-events-none absolute -right-[10%] -top-[20%] h-[800px] w-[800px] rounded-full border border-dashed border-white/5 opacity-50" />
      <div className="container relative z-10 mx-auto">
        <div className="mb-32 grid items-end gap-16 md:grid-cols-2">
          <div><div className="mb-8 flex items-center gap-6"><div className="flex items-baseline gap-3"><span className="font-serif text-lg italic">03</span><span className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-400">Capabilities</span></div><div className="h-px w-32 bg-gradient-to-r from-white/30 to-transparent" /></div><h2 className="text-6xl font-medium leading-none tracking-tighter md:text-9xl">Design<br /><span className="font-serif italic text-neutral-500">Systems</span></h2></div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative border-l border-white/10 md:pl-12"><div className="absolute -left-px top-0 h-12 w-px bg-gradient-to-b from-white to-transparent" /><p className="text-xl font-light leading-relaxed text-neutral-300 md:text-2xl">{site.servicesIntro}</p></motion.div>
        </div>
        <div className="group/list grid gap-x-8 gap-y-24 md:grid-cols-2 lg:grid-cols-4">{services.map((service, index) => <motion.div key={service.title} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className={`relative transition-all duration-500 hover:!opacity-100 group-hover/list:opacity-20 ${index % 2 === 1 ? "lg:mt-32" : ""}`}><motion.div whileHover={{ y: -10 }} className="group rounded-2xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm transition-all duration-500 hover:border-white/20 hover:bg-white/10"><div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 transition-colors duration-500 group-hover:bg-white group-hover:text-black"><service.icon className="h-6 w-6" /></div><h3 className="mb-4 text-xl font-medium tracking-tight">{service.title}</h3><p className="font-light leading-relaxed text-neutral-400">{service.description}</p></motion.div></motion.div>)}</div>
      </div>
    </section>
  );
}
