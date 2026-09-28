export type Course = { slug: string; name: string; summary: string; price: number };

export const courses: Course[] = [
  { slug: "soft-gel-inicial", name: "Soft Gel inicial", price: 15000,
    summary: "Aprendé todo lo que necesitás saber desde cero sobre esta técnica para ofrecer este servicio en tu mesa de trabajo de manera segura y eficaz, cuidando la uña natural y ofreciendo un servicio bueno y duradero." },
  { slug: "semipermanente-nivelacion-capping-gel", name: "Semipermanente, Nivelación y Capping gel", price: 40000,
    summary: "Aprendé estas técnicas infaltables priorizando el cuidado de la uña natural, con durabilidad y calidad." },
  { slug: "capping-polygel", name: "Capping Polygel", price: 25000,
    summary: "Conocé cómo manipular este producto y ofrecé un servicio 100% de calidad para las uñas naturales." },
  { slug: "nail-art-inicial", name: "Nail Art inicial", price: 8000,
    summary: "Tus infaltables en un solo taller. Empezá a realizar diseños y efectos con seguridad, aprendiendo sus técnicas y formas desde cero." },
  { slug: "nail-art-nivel-2", name: "Nail Art nivel 2", price: 15000,
    summary: "Ampliá tu carpeta de diseños aprendiendo a interpretarlos con seguridad y a realizar el paso a paso de cada uno, con sus técnicas y combinaciones." },
];

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
