// TODO(iara): reemplazar los datos provisorios cuando los confirme.
export const site = {
  name: "IA NAILS",
  tagline: "Atelier & Academia",
  address: { street: "Av. San Martín 180", area: "Bernal Centro, Buenos Aires" },
  whatsapp: "5491100000000", // PROVISORIO
  instagram: "ianails.atelier", // PROVISORIO
  nav: [
    { label: "Sobre mí", href: "/#sobre-mi" },
    { label: "Cursos", href: "/#cursos" },
    { label: "Contacto", href: "/#contacto" },
  ],
} as const;

export const whatsappLink = (text?: string) =>
  `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
