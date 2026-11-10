"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, FileText } from "lucide-react";

export default function ResumePage() {
  const [resume, setResume] = useState<{ url: string } | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/resume").then((response) => response.json()).then((data) => setResume(data.resume || null)).catch(() => setResume(null)).finally(() => setLoading(false));
  }, []);
  return <main className="min-h-screen bg-neutral-950 px-5 pb-16 pt-32 text-white md:px-10">
    <div className="mx-auto max-w-6xl">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-white"><ArrowLeft className="h-4 w-4"/> Back to portfolio</Link>
      <div className="mt-10 flex flex-col justify-between gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-end">
        <div><p className="font-mono text-xs uppercase tracking-[0.3em] text-neutral-500">Career Profile</p><h1 className="mt-3 text-5xl font-medium tracking-tight md:text-7xl">My Resume<span className="text-neutral-600">.</span></h1><p className="mt-4 max-w-xl text-sm leading-6 text-neutral-400">View my latest resume, or download a copy for your records.</p></div>
        {resume ? <a href={resume.url} target="_blank" rel="noreferrer" download="Riaj-Uddin-Resume.pdf" className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-neutral-200"><Download className="h-4 w-4"/> Download PDF</a> : null}
      </div>
      <div className="mt-8 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
        {loading ? <div className="flex min-h-[55vh] items-center justify-center text-sm text-neutral-500">Loading resume…</div> : resume ? <iframe src={resume.url} title="Riaj Uddin resume preview" className="h-[78vh] min-h-[560px] w-full bg-white"/> : <div className="flex min-h-[55vh] flex-col items-center justify-center px-6 text-center"><FileText className="h-12 w-12 text-neutral-600"/><h2 className="mt-5 text-xl font-medium">Resume not available yet</h2><p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">Please check back soon. My latest resume will appear here once it has been published.</p></div>}
      </div>
    </div>
  </main>;
}
