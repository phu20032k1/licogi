import HomePageClient from "./HomePageClient";
import { PublicProjectBootstrapProvider } from "../components/PublicProjectBootstrapContext";
import { getPublicMapProjects } from "../lib/publicProjectMapData";
import type { PublicProjectRecord } from "../lib/publicProject";

export default async function HomePage() {
  let initialProjects: PublicProjectRecord[] = [];
  try {
    initialProjects = await getPublicMapProjects();
  } catch (error) {
    console.error("homepage project bootstrap failed", error instanceof Error ? error.message : error);
  }

  return <PublicProjectBootstrapProvider initialProjects={initialProjects}>
    <HomePageClient />
  </PublicProjectBootstrapProvider>;
}
