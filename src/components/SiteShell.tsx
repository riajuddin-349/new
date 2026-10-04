"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CustomCursor } from "./CustomCursor";
import { Navbar } from "./Navbar";
import { site } from "@/data/site";

function Preloader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.7, ease: "easeInOut" } }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-white text-black"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.86, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-4"
      >
        <h1 className="text-4xl font-bold tracking-tighter md:text-6xl">{site.brand}</h1>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 210 }}
          transition={{ delay: 0.35, duration: 1.15, ease: "easeInOut" }}
          className="h-px bg-black/20"
        />
      </motion.div>
    </motion.div>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const [loading, setLoading] = useState(!isAdminRoute);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  if (isAdminRoute) return <>{children}</>;

  return (
    <>
      <AnimatePresence mode="wait">{loading ? <Preloader key="loader" /> : null}</AnimatePresence>
      {!loading ? (
        <div className="min-h-screen bg-neutral-950 text-white">
          <CustomCursor />
          <Navbar />
          {children}
        </div>
      ) : null}
    </>
  );
}
