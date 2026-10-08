export type Course = {
  slug: string; name: string; summary: string; price: number;
  level: string; learn: string; requirement?: string; cover?: string;
};

export const courses: Course[] = [
  { slug: "soft-gel-inicial", name: "Soft Gel inicial", price: 15000, level: "Principiante",
    cover: "/images/cursos/soft-gel-inicial.jpg",
    summary: "Aprendé todo lo que necesitás saber desde cero sobre esta técnica para ofrecer este servicio en tu mesa de trabajo de manera segura y eficaz, cuidando la uña natural y ofreciendo un servicio bueno y duradero.",
    learn: "Vas a aprender todo lo necesario para comenzar a trabajar las extensiones de Soft Gel con una técnica rápida, segura y duradera, con materiales del mercado 100 % utilizados por Iara. Incluye la preparación correcta de la uña natural para no dañarla, los tipos de uñas y cómo adaptar los tips a cada una, y el retiro del material, con y sin torno, de forma segura y eficaz." },
  { slug: "semipermanente-nivelacion-capping-gel", name: "Semipermanente, Nivelación y Capping gel", price: 40000, level: "Principiante",
    cover: "/images/cursos/semipermanente-nivelacion-capping-gel.jpg",
    summary: "Aprendé estas técnicas infaltables priorizando el cuidado de la uña natural, con durabilidad y calidad.",
    learn: "En este curso 3 en 1 vas a aprender la correcta preparación de la uña natural previa a cualquier servicio, la elección de productos del mercado y cada técnica en profundidad, para brindar un trabajo prolijo, duradero y de calidad." },
  { slug: "capping-polygel", name: "Capping Polygel", price: 25000, level: "Principiante",
    summary: "Conocé cómo manipular este producto y ofrecé un servicio 100 % de calidad para las uñas naturales.",
    learn: "Vas a aprender todo lo que necesitás saber para trabajar con Polygel sobre uñas naturales: la correcta preparación de la uña, la selección de productos, la colocación y el moldeado, la técnica de limado y las diferentes marcas con sus diferencias." },
  { slug: "nail-art-inicial", name: "Nail Art inicial", price: 8000, level: "Principiante",
    summary: "Tus infaltables en un solo taller. Empezá a realizar diseños y efectos con seguridad, aprendiendo sus técnicas y formas desde cero.",
    learn: "Vas a aprender todos los diseños y efectos que no pueden faltar en tu mesa de trabajo al comenzar: animal print, efecto dragón, técnica de cromado, diferentes tipos de dibujo y sus técnicas, efecto suéter y mucho más. Creá tu seguridad aprendiendo a usar tu pincel." },
  { slug: "nail-art-nivel-2", name: "Nail Art nivel 2", price: 15000, level: "Nivel medio",
    requirement: "Se recomienda haber hecho antes el curso Nail Art inicial.",
    summary: "Ampliá tu carpeta de diseños aprendiendo a interpretarlos con seguridad y a realizar el paso a paso de cada uno, con sus técnicas y combinaciones.",
    learn: "Vamos a ampliar y perfeccionar tu carpeta de diseños con técnicas, efectos y combinaciones que te ayudan a diferenciarte y desarrollarte en el mundo nail artist: tipos de cromados, efecto oro con relieves, aplicación sectorizada de cromo, nail art con relieves y mucho más. Animate a empezar a crear: solo te falta interpretar un diseño para realizarlo a tu gusto." },
];

// Redacción alineada con los términos y condiciones ("sin límite de tiempo").
export const benefits = [
  "Certificado virtual",
  "Soporte por WhatsApp",
  "Acceso sin límite de tiempo, con actualizaciones incluidas",
];

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

export const getCourse = (slug: string) => courses.find((c) => c.slug === slug);
