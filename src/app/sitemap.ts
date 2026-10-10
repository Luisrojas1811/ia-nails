import type { MetadataRoute } from "next";
import { courses } from "@/lib/courses";
import { PUBLIC_PATHS, siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const pages = PUBLIC_PATHS.map((path) => ({
    url: path === "/" ? `${base}/` : `${base}${path}`,
    changeFrequency: path === "/" ? ("weekly" as const) : ("yearly" as const),
    priority: path === "/" ? 1 : 0.3,
  }));
  const courseUrls = courses.map((c) => ({ url: `${base}/cursos/${c.slug}`, changeFrequency: "monthly" as const, priority: 0.8 }));
  return [...pages, ...courseUrls];
}
