import { projects as defaultProjects, type Project } from "@/data/projects";
import { deleteRaw, listProjectMetadata, uploadProjectMetadata } from "@/lib/cloudinary";

export type GalleryItem = {
  id: string;
  title: string;
  image: string;
  createdAt: string;
};

export type StoredProject = Project & {
  source: "admin" | "override";
  coverId?: string;
  galleryIds?: string[];
  metadataId?: string;
  originalSlug?: string;
};

export async function getAdminProjects(): Promise<StoredProject[]> {
  const resources = await listProjectMetadata();
  const projects: StoredProject[] = [];

  for (const resource of resources) {
    try {
      const response = await fetch(resource.secure_url, { cache: "no-store" });
      if (!response.ok) continue;
      const data = (await response.json()) as StoredProject;
      projects.push({
        ...data,
        source: data.source === "override" ? "override" : "admin",
        metadataId: resource.public_id,
      });
    } catch {
      continue;
    }
  }
  return projects;
}

export async function getAllProjects(): Promise<Project[]> {
  try {
    const stored = await getAdminProjects();
    const overrides = stored.filter((item) => item.source === "override");
    const added = stored.filter((item) => item.source === "admin");
    const replacedSlugs = new Set(overrides.flatMap((item) => [item.originalSlug, item.slug]).filter(Boolean));
    const defaults = defaultProjects.filter((item) => !replacedSlugs.has(item.slug));
    return [...defaults, ...overrides, ...added];
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

export async function updateProject(
  currentSlug: string,
  project: Omit<StoredProject, "metadataId">
) {
  const existing = await getAdminProjects();
  const previous = existing.find((item) => item.slug === currentSlug);
  const defaultProject = defaultProjects.find((item) => item.slug === currentSlug);
  if (!previous && !defaultProject) return undefined;

  const stored: StoredProject = {
    ...(defaultProject || {}),
    ...(previous || {}),
    ...project,
    source: previous?.source || "override",
    originalSlug: previous?.originalSlug || (defaultProject ? currentSlug : undefined),
  } as StoredProject;

  if (currentSlug !== stored.slug && previous?.metadataId) {
    await deleteRaw(previous.metadataId);
  } else if (currentSlug !== stored.slug && defaultProject) {
    // The override is stored under the new slug; originalSlug prevents the old
    // hardcoded project from reappearing in the merged project list.
  }

  await uploadProjectMetadata(stored.slug, stored);
  return stored;
}

export async function deleteAdminProject(slug: string) {
  const items = await getAdminProjects();
  const found = items.find((item) => item.slug === slug && item.source === "admin");
  if (!found) return undefined;
  await deleteRaw(found.metadataId || `portfolio/projects/meta/${slug}.json`);
  return found;
}

export async function getGallery(): Promise<GalleryItem[]> {
  try {
    const { listImages } = await import("@/lib/cloudinary");
    const resources = await listImages("portfolio/gallery");
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
