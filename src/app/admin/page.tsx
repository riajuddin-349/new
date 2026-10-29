"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, FileText, ImagePlus, LogOut, Upload, X, Trash2, Eye } from "lucide-react";
import Link from "next/link";

type Project = { id: string; title: string; slug: string; category: string; image: string; year: string; source?: string };
type GalleryItem = { id: string; title: string; image: string; createdAt: string };

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [tab, setTab] = useState<"gallery" | "project" | "resume">("gallery");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const [session, projectResponse, galleryResponse] = await Promise.all([fetch("/api/auth/session"), fetch("/api/projects"), fetch("/api/gallery")]);
    const sessionData = await session.json();
    setAuthenticated(sessionData.authenticated);
    if (sessionData.authenticated) {
      setProjects((await projectResponse.json()).items || []);
      setGallery((await galleryResponse.json()).items || []);
    }
  };

  useEffect(() => { refresh(); }, []);

  if (authenticated === null) return <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400">Checking admin session…</div>;
  if (!authenticated) return <Login password={password} setPassword={setPassword} onLogin={(value) => { setAuthenticated(value); refresh(); }} />;

  return <div className="min-h-screen bg-neutral-950 px-5 py-8 text-white md:px-10">
    <header className="mx-auto flex max-w-7xl items-center justify-between border-b border-white/10 pb-6">
      <div><p className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500">Portfolio CMS</p><h1 className="mt-2 text-3xl font-medium tracking-tight">Admin Dashboard</h1></div>
      <div className="flex items-center gap-4"><Link href="/" className="hidden items-center gap-2 text-sm text-neutral-400 hover:text-white md:flex"><ArrowLeft className="h-4 w-4" /> View site</Link><button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); setAuthenticated(false); }} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white"><LogOut className="h-4 w-4" /> Logout</button></div>
    </header>
    <main className="mx-auto max-w-7xl py-10">
      <div className="mb-8 flex gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1 w-fit"><button onClick={() => setTab("gallery")} className={`rounded-full px-5 py-2 text-sm ${tab === "gallery" ? "bg-white text-black" : "text-neutral-400"}`}>Gallery</button><button onClick={() => setTab("project")} className={`rounded-full px-5 py-2 text-sm ${tab === "project" ? "bg-white text-black" : "text-neutral-400"}`}>Projects</button><button onClick={() => setTab("resume")} className={`rounded-full px-5 py-2 text-sm ${tab === "resume" ? "bg-white text-black" : "text-neutral-400"}`}>My Resume</button></div>
      {message ? <div className="mb-6 flex items-center gap-2 border border-white/10 bg-white/[0.04] px-4 py-3 text-sm"><Check className="h-4 w-4" /> {message}</div> : null}
      {error ? <div className="mb-6 border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">{error}</div> : null}
      {tab === "gallery" ? <GalleryManager busy={busy} setBusy={setBusy} onDone={(msg) => { setMessage(msg); setError(""); refresh(); }} onError={(msg) => { setError(msg); setMessage(""); }} items={gallery} /> : tab === "project" ? <ProjectManager busy={busy} setBusy={setBusy} onDone={(msg) => { setMessage(msg); setError(""); refresh(); }} onError={(msg) => { setError(msg); setMessage(""); }} /> : <ResumeManager busy={busy} setBusy={setBusy} onDone={(msg) => { setMessage(msg); setError(""); }} onError={(msg) => { setError(msg); setMessage(""); }} />}
      <section className="mt-14 border-t border-white/10 pt-8"><p className="mb-5 text-xs font-mono uppercase tracking-widest text-neutral-500">Current content</p><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{projects.map((project) => <div key={project.id} className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]"><img src={project.image} alt="" className="aspect-[4/3] w-full object-cover" /><div className="p-4"><p className="font-medium">{project.title}</p><p className="mt-1 text-xs text-neutral-500">{project.source === "admin" ? "Added from CMS" : "Existing project"}</p></div></div>)}</div></section>
    </main>
  </div>;
}


function ResumeManager({ busy, setBusy, onDone, onError }: { busy: boolean; setBusy: (v: boolean) => void; onDone: (v: string) => void; onError: (v: string) => void }) {
  const [resume, setResume] = useState<{ url: string; updatedAt?: string } | null>(null);
  const [configured, setConfigured] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const load = async () => { const response = await fetch("/api/resume"); const data = await response.json(); setConfigured(data.configured !== false); setResume(data.resume || null); };
  useEffect(() => { load(); }, []);
  const upload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return onError("Choose a PDF resume first.");
    if (file.type !== "application/pdf" || file.size > 10 * 1024 * 1024) return onError("Please choose a PDF up to 10MB.");
    setBusy(true); const form = new FormData(); form.append("file", file);
    const response = await fetch("/api/resume", { method: "POST", body: form }); const data = await response.json();
    if (!response.ok) onError(data.error || "Resume upload failed.");
    else { setFile(null); onDone("Resume uploaded successfully. The public resume link stays the same."); await load(); }
    setBusy(false);
  };
  const remove = async () => {
    if (!window.confirm("Delete the current resume from your public portfolio?")) return;
    setBusy(true); const response = await fetch("/api/resume", { method: "DELETE" }); const data = await response.json();
    if (!response.ok) onError(data.error || "Could not delete resume."); else { onDone("Resume deleted from the public portfolio."); setResume(null); }
    setBusy(false);
  };
  return <section className="grid gap-8 lg:grid-cols-[420px_1fr]">
    <form onSubmit={upload} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center gap-3"><FileText className="h-6 w-6"/><h2 className="text-2xl font-medium">{resume ? "Replace Resume" : "Upload Resume"}</h2></div>
      <p className="mt-3 text-sm leading-6 text-neutral-500">Upload a PDF up to 10MB. Your public URL stays the same when you replace the file, so previously shared job-application links continue to work.</p>
      {!configured ? <p className="mt-5 rounded-lg border border-amber-400/20 bg-amber-400/5 p-3 text-sm text-amber-200">Cloudinary storage is not configured yet. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to the deployment environment.</p> : null}
      <label className="mt-6 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-black/30 p-5 text-center"><Upload className="mb-3 h-6 w-6"/><span className="text-sm">{file ? file.name : "Choose PDF resume"}</span><span className="mt-2 text-xs text-neutral-600">PDF only · Max 10MB</span><input type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)}/></label>
      <button disabled={busy || !file || !configured} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 font-medium text-black disabled:opacity-40"><Upload className="h-4 w-4"/>{busy ? "Please wait…" : resume ? "Replace Resume" : "Upload Resume"}</button>
      {resume ? <button type="button" disabled={busy} onClick={remove} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-red-400/20 px-4 py-3 text-sm text-red-300 hover:bg-red-400/5 disabled:opacity-40"><Trash2 className="h-4 w-4"/> Delete Resume</button> : null}
    </form>
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="text-lg font-medium">Resume Preview</h3><p className="mt-1 text-xs text-neutral-500">This is how the PDF appears to visitors.</p></div>{resume ? <a href={resume.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-neutral-300 hover:text-white"><Eye className="h-4 w-4"/> Open PDF</a> : null}</div>
      {resume ? <iframe key={resume.url} src={resume.url} title="Current resume PDF preview" className="h-[680px] w-full rounded-lg bg-white" /> : <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 text-center"><FileText className="h-10 w-10 text-neutral-600"/><p className="mt-4 font-medium text-neutral-300">No resume uploaded</p><p className="mt-2 max-w-xs text-sm text-neutral-600">Upload your PDF to preview it here and publish it on your portfolio.</p></div>}
    </div>
  </section>;
}

function Login({ password, setPassword, onLogin }: { password: string; setPassword: (v: string) => void; onLogin: (v: boolean) => void }) {
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  return <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white"><form onSubmit={async (e) => { e.preventDefault(); setBusy(true); setError(""); const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) }); const data = await response.json(); if (!response.ok) setError(data.error || "Login failed."); else onLogin(true); setBusy(false); }} className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8"><p className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500">RIAJ.DESIGN</p><h1 className="mt-3 text-4xl font-medium tracking-tight">Admin Login</h1><p className="mt-3 text-sm text-neutral-500">Sign in to manage your portfolio, gallery, projects and resume.</p><input autoFocus type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin password" className="mt-8 w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none focus:border-white/30" />{error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}<button disabled={busy} className="mt-5 w-full rounded-lg bg-white px-4 py-3 font-medium text-black disabled:opacity-50">{busy ? "Signing in…" : "Sign in"}</button></form></div>;
}

function GalleryManager({ items, busy, setBusy, onDone, onError }: { items: GalleryItem[]; busy: boolean; setBusy: (v: boolean) => void; onDone: (v: string) => void; onError: (v: string) => void }) {
  const [title, setTitle] = useState("Gallery"); const [files, setFiles] = useState<File[]>([]);
  return <section><div className="grid gap-8 lg:grid-cols-[420px_1fr]"><form onSubmit={async (e) => { e.preventDefault(); if (!files.length) return onError("Select one or more images."); setBusy(true); const form = new FormData(); form.append("title", title); files.forEach((file) => form.append("images", file)); const response = await fetch("/api/gallery", { method: "POST", body: form }); const data = await response.json(); if (!response.ok) onError(data.error || "Upload failed."); else { setFiles([]); onDone(`${files.length} gallery image${files.length > 1 ? "s" : ""} uploaded.`); } setBusy(false); }} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"><h2 className="text-2xl font-medium">Add Gallery Images</h2><p className="mt-2 text-sm text-neutral-500">Upload as many images as you want. JPG, PNG, WEBP, AVIF and GIF are supported.</p><label className="mt-6 block text-xs font-mono uppercase tracking-widest text-neutral-500">Title / label<input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-black px-3 py-3 normal-case tracking-normal text-white outline-none" /></label><label className="mt-5 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-black/30 p-5 text-center"><ImagePlus className="mb-3" /><span className="text-sm">Choose multiple images</span><span className="mt-1 text-xs text-neutral-600">Up to 15MB per image</span><input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files || []))} /></label>{files.length ? <p className="mt-3 text-xs text-neutral-400">{files.length} file(s) selected</p> : null}<button disabled={busy || !files.length} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 font-medium text-black disabled:opacity-40"><Upload className="h-4 w-4" /> {busy ? "Uploading…" : "Upload to Gallery"}</button></form><div className="grid grid-cols-2 gap-3 md:grid-cols-3">{items.map((item) => <div key={item.id} className="group overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]"><img src={item.image} alt={item.title} className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105" /><div className="px-3 py-2 text-xs text-neutral-500">{item.title}</div></div>)}</div></div></section>;
}

function ProjectManager({ busy, setBusy, onDone, onError }: { busy: boolean; setBusy: (v: boolean) => void; onDone: (v: string) => void; onError: (v: string) => void }) {
  const [values, setValues] = useState({ title: "", slug: "", category: "", year: String(new Date().getFullYear()), client: "", role: "UI/UX Designer", description: "", challenge: "", outcome: "" });
  const [cover, setCover] = useState<File | null>(null); const [gallery, setGallery] = useState<File[]>([]);
  const update = (key: keyof typeof values, value: string) => setValues((v) => ({ ...v, [key]: value }));
  const generatedSlug = useMemo(() => values.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), [values.title]);
  return <form onSubmit={async (e) => { e.preventDefault(); if (!cover) return onError("A cover image is required."); const form = new FormData(); Object.entries({ ...values, slug: values.slug || generatedSlug }).forEach(([key, value]) => form.append(key, value)); form.append("cover", cover); gallery.forEach((file) => form.append("gallery", file)); setBusy(true); const response = await fetch("/api/projects", { method: "POST", body: form }); const data = await response.json(); if (!response.ok) onError(data.error || "Project creation failed."); else { setValues({ title: "", slug: "", category: "", year: String(new Date().getFullYear()), client: "", role: "UI/UX Designer", description: "", challenge: "", outcome: "" }); setCover(null); setGallery([]); onDone("New project added successfully."); } setBusy(false); }}><div className="grid gap-5 md:grid-cols-2"><Field label="Project title" value={values.title} onChange={(v) => update("title", v)} required /><Field label="Slug" value={values.slug} placeholder={generatedSlug || "project-slug"} onChange={(v) => update("slug", v)} /><Field label="Category" value={values.category} onChange={(v) => update("category", v)} required /><Field label="Year" value={values.year} onChange={(v) => update("year", v)} /><Field label="Client" value={values.client} onChange={(v) => update("client", v)} /><Field label="Role" value={values.role} onChange={(v) => update("role", v)} /><TextField label="Description" value={values.description} onChange={(v) => update("description", v)} required /><TextField label="Challenge" value={values.challenge} onChange={(v) => update("challenge", v)} /><TextField label="Outcome" value={values.outcome} onChange={(v) => update("outcome", v)} /><div className="grid gap-4 md:grid-cols-2"><FileBox label="Cover image" multiple={false} fileCount={cover ? 1 : 0} onChange={(f) => setCover(f[0] || null)} /><FileBox label="Gallery images" multiple fileCount={gallery.length} onChange={setGallery} /></div></div><button disabled={busy} className="mt-6 flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-black disabled:opacity-40"><Upload className="h-4 w-4" /> {busy ? "Saving…" : "Add Project"}</button></form>;
}

function Field({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) { return <label className="block text-xs font-mono uppercase tracking-widest text-neutral-500">{label}<input required={required} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 normal-case tracking-normal text-white outline-none focus:border-white/25" /></label>; }
function TextField({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) { return <label className="block text-xs font-mono uppercase tracking-widest text-neutral-500">{label}<textarea required={required} value={value} onChange={(e) => onChange(e.target.value)} rows={5} className="mt-2 w-full resize-y rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 normal-case tracking-normal text-white outline-none focus:border-white/25" /></label>; }
function FileBox({ label, multiple, fileCount, onChange }: { label: string; multiple: boolean; fileCount: number; onChange: (files: File[]) => void }) { return <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-black/20 p-4 text-center"><ImagePlus className="mb-2 h-5 w-5" /><span className="text-xs text-neutral-300">{label}</span><span className="mt-1 text-[11px] text-neutral-600">{fileCount ? `${fileCount} selected` : multiple ? "Select multiple" : "Select one"}</span><input type="file" accept="image/*" multiple={multiple} className="hidden" onChange={(e) => onChange(Array.from(e.target.files || []))} /></label>; }
