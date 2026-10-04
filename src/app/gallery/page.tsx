import type { Metadata } from "next";
import { GalleryView } from "@/components/GalleryView";
import { getGallery } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Visual design gallery by Riaj Uddin.",
};

export default async function GalleryPage() {
  return <GalleryView items={await getGallery()} />;
}
