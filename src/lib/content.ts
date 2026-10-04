import { projects as defaultProjects, type Project } from "@/data/projects";
import { deleteRaw, listProjectMetadata, uploadProjectMetadata } from "@/lib/cloudinary";

export type GalleryItem = { id: string; title: string; image: string; createdAt: string };
type StoredProject = Project & { source: "admin"; coverId?: string; galleryIds?: string[]; metadataId?: string };

export async function getAdminProjects(): Promise<StoredProject[]> {
  const resources = await listProjectMetadata();
  const projects = await Promise.all(resources.map(async (resource) => {
    try {
      const response = await fetch(resource.secure_url, { cache: "no-store" });
      if (!response.ok) return null;
      const data = (await response.json()) as StoredProject;
      return { ...data, source: "admin" as const, metadataId: resource.public_id };
    } catch {
      return null;
    }
  }));
  return projects.filter((item): item is StoredProject => Boolean(item));
}

export async function getAllProjects(): Promise<Project[]> {
  try {
    return [...defaultProjects, ...(await getAdminProjects())];
  } catch {
    return [...defaultProjects];
  }
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return (await getAllProjects()).find((project) => project.slug === slug);
}

export async function addProject(project: Omit<StoredProject, "source" | "metadataId">) {
  const stored = { ...project, source: "admin" as const };
  await uploadProjectMetadata(stored.slug, stored);
  return stored;
}

export async function deleteAdminProject(slug: string) {
  const items = await getAdminProjects();
  const found = items.find((item) => item.slug === slug);
  if (!found) return undefined;
  await deleteRaw(found.metadataId || `portfolio/projects/meta/${slug}.json`);
  return found;
}


export async function getGallery(): Promise<GalleryItem[]> {
  try {
    const resources = await import("@/lib/cloudinary").then(({ listImages }) => listImages("portfolio/gallery"));
    return resources.map((item) => ({
      id: item.public_id,
      title: item.context?.custom?.title || "Gallery",
      image: item.secure_url,
      createdAt: item.created_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}
