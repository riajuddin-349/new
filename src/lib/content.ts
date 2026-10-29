import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { projects as defaultProjects, type Project } from "@/data/projects";

export type GalleryItem = {
  id: string;
  title: string;
  image: string;
  createdAt: string;
};

type StoredProject = Project & { source: "admin" };

type GalleryStore = { items: GalleryItem[] };
type ProjectStore = { items: StoredProject[] };

const contentDir = path.join(process.cwd(), "content");
const galleryFile = path.join(contentDir, "gallery.json");
const projectsFile = path.join(contentDir, "projects.json");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(file: string, value: T) {
  await mkdir(contentDir, { recursive: true });
  await writeFile(file, JSON.stringify(value, null, 2), "utf8");
}

export async function getAdminProjects(): Promise<StoredProject[]> {
  const store = await readJson<ProjectStore>(projectsFile, { items: [] });
  return store.items;
}

export async function getAllProjects(): Promise<Project[]> {
  return [...defaultProjects, ...(await getAdminProjects())];
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return (await getAllProjects()).find((project) => project.slug === slug);
}

export async function addProject(project: Omit<StoredProject, "source">) {
  const items = await getAdminProjects();
  const stored = { ...project, source: "admin" as const };
  await writeJson<ProjectStore>(projectsFile, { items: [stored, ...items] });
  return stored;
}

export async function getGallery(): Promise<GalleryItem[]> {
  const store = await readJson<GalleryStore>(galleryFile, { items: [] });
  return store.items;
}

export async function addGalleryItems(items: GalleryItem[]) {
  const existing = await getGallery();
  await writeJson<GalleryStore>(galleryFile, { items: [...items, ...existing] });
  return items;
}
