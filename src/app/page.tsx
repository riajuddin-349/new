import { About } from "@/components/About";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Projects } from "@/components/Projects";
import { Services } from "@/components/Services";
import { Skills } from "@/components/Skills";
import { getAllProjects } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const projects = await getAllProjects();
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Projects projects={projects} />
      <Services />
      <Footer />
    </>
  );
}
