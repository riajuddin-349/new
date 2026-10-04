import type { Metadata } from "next";
import { WorkArchive } from "@/components/WorkArchive";
import { getAllProjects } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Selected Work",
  description: "UI/UX design case studies and selected product work.",
};

export default async function WorkPage() {
  return <WorkArchive projects={await getAllProjects()} />;
}
