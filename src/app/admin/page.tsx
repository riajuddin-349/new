"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, Check, ImagePlus, LogOut, Trash2, Upload } from "lucide-react";
import Link from "next/link";

type Project = { id: string; title: string; slug: string; category: string; image: string; year: string; source?: string; coverId?: string; gallery?: string[]; galleryIds?: string[] };
type GalleryItem = { id: string; title: string; image: string; createdAt: string };

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [tab, setTab] = useState<"gallery" | "project">("gallery");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const [session, projectResponse, galleryResponse] = await Promise.all([
      fetch("/api/auth/session", { cache: "no-store" }),
      fetch("/api/projects", { cache: "no-store" }),
      fetch("/api/gallery", { cache: "no-store" })
    ]);

    const sessionData = await session.json();
    setAuthenticated(sessionData.authenticated);

    if (sessionData.authenticated) {
      const projectData = await projectResponse.json();
      const galleryData = await galleryResponse.json();

      setProjects(projectData.items || []);
      setGallery(galleryData.items || []);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  if (authenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400">
        Checking admin session…
      </div>
    );
  }

  if (!authenticated) {
    return (
      <Login
        password={password}
        setPassword={setPassword}
        onLogin={(value) => {
          setAuthenticated(value);
          refresh();
        }}
      />
    );
  }

  const done = (msg: string) => {
    setMessage(msg);
    setError("");
    refresh();
  };

  const fail = (msg: string) => {
    setError(msg);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-neutral-950 px-5 py-8 text-white md:px-10">
      <header className="mx-auto flex max-w-7xl items-center justify-between border-b border-white/10 pb-6">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500">
            Portfolio CMS
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight">
            Admin Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="hidden items-center gap-2 text-sm text-neutral-400 hover:text-white md:flex"
          >
            <ArrowLeft className="h-4 w-4" />
            View site
          </Link>

          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              setAuthenticated(false);
            }}
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl py-10">
        <div className="mb-8 flex w-fit gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1">
          <button
            onClick={() => setTab("gallery")}
            className={`rounded-full px-5 py-2 text-sm ${
              tab === "gallery"
                ? "bg-white text-black"
                : "text-neutral-400"
            }`}
          >
            Gallery
          </button>

          <button
            onClick={() => setTab("project")}
            className={`rounded-full px-5 py-2 text-sm ${
              tab === "project"
                ? "bg-white text-black"
                : "text-neutral-400"
            }`}
          >
            Projects
          </button>
        </div>

        {message ? (
          <div className="mb-6 flex items-center gap-2 border border-white/10 bg-white/[0.04] px-4 py-3 text-sm">
            <Check className="h-4 w-4" />
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mb-6 border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {tab === "gallery" ? (
          <GalleryManager
            busy={busy}
            setBusy={setBusy}
            onDone={done}
            onError={fail}
            items={gallery}
          />
        ) : (
          <ProjectManager
            busy={busy}
            setBusy={setBusy}
            onDone={done}
            onError={fail}
          />
        )}

        <section className="mt-14 border-t border-white/10 pt-8">
          <p className="mb-5 text-xs font-mono uppercase tracking-widest text-neutral-500">
            Current content
          </p>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]"
              >
                <img
                  src={project.image}
                  alt=""
                  className="aspect-[4/3] w-full object-cover"
                />

                <div className="p-4">
                  <p className="font-medium">{project.title}</p>

                  <p className="mt-1 text-xs text-neutral-500">
                    {project.source === "admin"
                      ? "Added from CMS"
                      : "Existing project"}
                  </p>

                  {project.source === "admin" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={async () => {
                        if (
                          !confirm(
                            `Delete ${project.title}? This also deletes its Cloudinary images.`
                          )
                        ) {
                          return;
                        }

                        setBusy(true);

                        const response = await fetch("/api/projects", {
                          method: "DELETE",
                          headers: {
                            "Content-Type": "application/json"
                          },
                          body: JSON.stringify({
                            slug: project.slug,
                            coverId: project.coverId,
                            galleryIds: project.galleryIds || []
                          })
                        });

                        const data = await response.json();

                        if (!response.ok) {
                          fail(data.error || "Project delete failed.");
                        } else {
                          done("Project deleted successfully.");
                        }

                        setBusy(false);
                      }}
                      className="mt-4 flex items-center gap-2 text-xs text-red-300 transition hover:text-red-200 disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete project
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function Login({
  password,
  setPassword,
  onLogin
}: {
  password: string;
  setPassword: (v: string) => void;
  onLogin: (v: boolean) => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          setBusy(true);
          setError("");

          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ password })
          });

          const data = await response.json();

          if (!response.ok) {
            setError(data.error || "Login failed.");
          } else {
            onLogin(true);
          }

          setBusy(false);
        }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8"
      >
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500">
          RIAJ.DESIGN
        </p>

        <h1 className="mt-3 text-4xl font-medium tracking-tight">
          Admin Login
        </h1>

        <p className="mt-3 text-sm text-neutral-500">
          Sign in to manage gallery images and projects.
        </p>

        <input
          autoFocus
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          className="mt-8 w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none focus:border-white/30"
        />

        {error ? (
          <p className="mt-3 text-sm text-red-300">{error}</p>
        ) : null}

        <button
          disabled={busy}
          className="mt-5 w-full rounded-lg bg-white px-4 py-3 font-medium text-black disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

async function signedUpload(
  file: File,
  endpoint: string,
  payload: Record<string, string>
) {
  if (file.size > 15 * 1024 * 1024) {
    throw new Error(`${file.name} is larger than 15MB.`);
  }

  const signResponse = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const signData = await signResponse.json();

  if (!signResponse.ok) {
    throw new Error(
      signData.error || "Unable to prepare upload."
    );
  }

  const form = new FormData();

  form.append("file", file);
  form.append("api_key", signData.apiKey);
  form.append("timestamp", signData.timestamp);
  form.append("folder", signData.folder);
  form.append("signature", signData.signature);

  if (signData.context) {
    form.append("context", signData.context);
  }

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
    {
      method: "POST",
      body: form
    }
  );

  const data = await uploadResponse.json();

  if (!uploadResponse.ok) {
    throw new Error(
      data?.error?.message || `Upload failed for ${file.name}.`
    );
  }

  return data as {
    public_id: string;
    secure_url: string;
    created_at?: string;
  };
}

function GalleryManager({
  items,
  busy,
  setBusy,
  onDone,
  onError
}: {
  items: GalleryItem[];
  busy: boolean;
  setBusy: (v: boolean) => void;
  onDone: (v: string) => void;
  onError: (v: string) => void;
}) {
  const [title, setTitle] = useState("Gallery");
  const [files, setFiles] = useState<File[]>([]);

  const uploadFiles = async (e: FormEvent) => {
    e.preventDefault();

    if (!files.length) {
      return onError("Select one or more images.");
    }

    setBusy(true);

    try {
      await Promise.all(
        files.map((file) =>
          signedUpload(file, "/api/gallery/sign", { title })
        )
      );

      onDone(
        `${files.length} gallery image${
          files.length > 1 ? "s" : ""
        } uploaded.`
      );

      setFiles([]);
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Upload failed."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
        <form
          onSubmit={uploadFiles}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
        >
          <h2 className="text-2xl font-medium">
            Add Gallery Images
          </h2>

          <p className="mt-2 text-sm text-neutral-500">
            Images upload directly to Cloudinary. JPG, PNG, WEBP,
            AVIF and GIF are supported.
          </p>

          <label className="mt-6 block text-xs font-mono uppercase tracking-widest text-neutral-500">
            Title / label

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-black px-3 py-3 normal-case tracking-normal text-white outline-none"
            />
          </label>

          <label className="mt-5 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-black/30 p-5 text-center">
            <ImagePlus className="mb-3" />

            <span className="text-sm">
              Choose multiple images
            </span>

            <span className="mt-1 text-xs text-neutral-600">
              Up to 15MB per image
            </span>

            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) =>
                setFiles(Array.from(e.target.files || []))
              }
            />
          </label>

          {files.length ? (
            <p className="mt-3 text-xs text-neutral-400">
              {files.length} file(s) selected
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy || !files.length}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 font-medium text-black disabled:opacity-40"
          >
            <Upload className="h-4 w-4" />
            {busy ? "Uploading…" : "Upload to Gallery"}
          </button>
        </form>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]"
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    if (
                      !confirm(
                        "Delete this gallery image? This will also remove it from Cloudinary."
                      )
                    ) {
                      return;
                    }

                    setBusy(true);

                    try {
                      const response = await fetch("/api/gallery", {
                        method: "DELETE",
                        headers: {
                          "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                          ids: [item.id]
                        })
                      });

                      const data = await response.json();

                      if (!response.ok) {
                        throw new Error(
                          data.error || "Delete failed."
                        );
                      }

                      onDone("Gallery image deleted.");
                    } catch (error) {
                      onError(
                        error instanceof Error
                          ? error.message
                          : "Delete failed."
                      );
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-red-300 backdrop-blur transition hover:bg-red-500 hover:text-white disabled:opacity-40"
                  aria-label="Delete gallery image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="px-3 py-2 text-xs text-neutral-500">
                {item.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectManager({
  busy,
  setBusy,
  onDone,
  onError
}: {
  busy: boolean;
  setBusy: (v: boolean) => void;
  onDone: (v: string) => void;
  onError: (v: string) => void;
}) {
  const [values, setValues] = useState({
    title: "",
    slug: "",
    category: "",
    year: String(new Date().getFullYear()),
    client: "",
    role: "UI/UX Designer",
    description: "",
    challenge: "",
    outcome: ""
  });

  const [cover, setCover] = useState<File | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);

  const update = (
    key: keyof typeof values,
    value: string
  ) =>
    setValues((v) => ({
      ...v,
      [key]: value
    }));

  const generatedSlug = useMemo(
    () =>
      values.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    [values.title]
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    if (!cover) {
      return onError("A cover image is required.");
    }

    setBusy(true);

    let coverData: any = null;
    const galleryData: any[] = [];

    try {
      const slug = values.slug || generatedSlug;

      coverData = await signedUpload(
        cover,
        "/api/projects/sign",
        {
          slug,
          title: values.title,
          kind: "cover"
        }
      );

      for (const file of gallery) {
        galleryData.push(
          await signedUpload(
            file,
            "/api/projects/sign",
            {
              slug,
              title: values.title,
              kind: "gallery"
            }
          )
        );
      }

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...values,
          slug,
          image: coverData.secure_url,
          coverId: coverData.public_id,
          gallery: galleryData.map(
            (x) => x.secure_url
          ),
          galleryIds: galleryData.map(
            (x) => x.public_id
          )
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Project creation failed."
        );
      }

      setValues({
        title: "",
        slug: "",
        category: "",
        year: String(new Date().getFullYear()),
        client: "",
        role: "UI/UX Designer",
        description: "",
        challenge: "",
        outcome: ""
      });

      setCover(null);
      setGallery([]);

      onDone("New project added successfully.");
    } catch (error) {
      const uploaded = [
        coverData?.public_id,
        ...galleryData.map((x) => x.public_id)
      ].filter(Boolean);

      if (uploaded.length) {
        await fetch("/api/gallery", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ids: uploaded
          })
        }).catch(() => undefined);
      }

      onError(
        error instanceof Error
          ? error.message
          : "Project creation failed."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Project title"
          value={values.title}
          onChange={(v) => update("title", v)}
          required
        />

        <Field
          label="Slug"
          value={values.slug}
          placeholder={generatedSlug || "project-slug"}
          onChange={(v) => update("slug", v)}
        />

        <Field
          label="Category"
          value={values.category}
          onChange={(v) => update("category", v)}
          required
        />

        <Field
          label="Year"
          value={values.year}
          onChange={(v) => update("year", v)}
        />

        <Field
          label="Client"
          value={values.client}
          onChange={(v) => update("client", v)}
        />

        <Field
          label="Role"
          value={values.role}
          onChange={(v) => update("role", v)}
        />

        <TextField
          label="Description"
          value={values.description}
          onChange={(v) => update("description", v)}
          required
        />

        <TextField
          label="Challenge"
          value={values.challenge}
          onChange={(v) => update("challenge", v)}
        />

        <TextField
          label="Outcome"
          value={values.outcome}
          onChange={(v) => update("outcome", v)}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FileBox
            label="Cover image"
            multiple={false}
            fileCount={cover ? 1 : 0}
            onChange={(f) =>
              setCover(f[0] || null)
            }
          />

          <FileBox
            label="Gallery images"
            multiple
            fileCount={gallery.length}
            onChange={setGallery}
          />
        </div>
      </div>

      <p className="mt-4 text-xs text-neutral-600">
        Images upload directly to Cloudinary; Vercel does not
        receive the image files.
      </p>

      <button
        disabled={busy}
        className="mt-6 flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-black disabled:opacity-40"
      >
        <Upload className="h-4 w-4" />
        {busy ? "Saving…" : "Add Project"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-xs font-mono uppercase tracking-widest text-neutral-500">
      {label}

      <input
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 normal-case tracking-normal text-white outline-none focus:border-white/25"
      />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  required
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block text-xs font-mono uppercase tracking-widest text-neutral-500">
      {label}

      <textarea
        required={required}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        rows={5}
        className="mt-2 w-full resize-y rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 normal-case tracking-normal text-white outline-none focus:border-white/25"
      />
    </label>
  );
}

function FileBox({
  label,
  multiple,
  fileCount,
  onChange
}: {
  label: string;
  multiple: boolean;
  fileCount: number;
  onChange: (files: File[]) => void;
}) {
  return (
    <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-black/20 p-4 text-center">
      <ImagePlus className="mb-2 h-5 w-5" />

      <span className="text-xs text-neutral-300">
        {label}
      </span>

      <span className="mt-1 text-[11px] text-neutral-600">
        {fileCount
          ? `${fileCount} selected`
          : multiple
            ? "Select multiple"
            : "Select one"}
      </span>

      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) =>
          onChange(
            Array.from(e.target.files || [])
          )
        }
      />
    </label>
  );
}