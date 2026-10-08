// Datos confirmados por Iara. Verificar el mail antes de publicar (¿"ianailsss10" con tres "s"?).
export const site = {
  name: "IA NAILS",
  tagline: "Nail Artist · Técnica educadora",
  address: { street: "Av. San Martín 180", area: "Bernal Centro, Buenos Aires" },
  whatsapp: "5491126435229", // formato internacional para wa.me
  whatsappDisplay: "+54 9 11 2643-5229",
  instagram: "ianails10",
  email: "ianailsss10@gmail.com",
  hours: ["Lunes a viernes: 10 a 20 h", "Sábados: 9 a 14 h", "Domingos: cerrado"],
  nav: [
    { label: "Sobre mí", href: "/#sobre-mi" },
    { label: "Trabajos", href: "/#trabajos" },
    { label: "Cursos", href: "/#cursos" },
    { label: "Contacto", href: "/#contacto" },
  ],
} as const;

export const whatsappLink = (text?: string) =>
  `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
