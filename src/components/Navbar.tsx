"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { site } from "@/data/site";

const navItems = [
  { name: "Projects", href: "/work" },
  { name: "Gallery", href: "/gallery" },
  { name: "About", href: "/#about" },
  { name: "Services", href: "/#services" },
  { name: "Contact", href: "/#contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed z-50 w-full transition-all duration-300 ${
        scrolled ? "border-b border-white/5 bg-neutral-950/80 py-4 backdrop-blur-md" : "bg-transparent py-8"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-6">
        <Link href="/" className="relative z-50 text-2xl font-bold tracking-tighter">
          {site.brand}
        </Link>

        <div className="hidden gap-8 md:flex">
          {navItems.map((item, index) => (
            <motion.div key={item.name} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
              <Link href={item.href} className="group relative text-sm uppercase tracking-widest transition-colors hover:text-white/70">
                {item.name}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-white transition-all group-hover:w-full" />
              </Link>
            </motion.div>
          ))}
        </div>

        <button type="button" aria-label="Toggle menu" onClick={() => setOpen((value: boolean) => !value)} className="relative z-50 md:hidden">
          {open ? <X /> : <Menu />}
        </button>

        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 flex flex-col items-center justify-center gap-12 bg-neutral-950 md:hidden"
            >
              {navItems.map((item) => (
                <Link key={item.name} href={item.href} className="text-4xl font-medium tracking-tight transition-colors hover:text-neutral-500">
                  {item.name}
                </Link>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
