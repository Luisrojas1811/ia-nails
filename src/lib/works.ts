// featured: aparece en la galería de la Home. carousel: aparece en el carrusel del inicio (solo fotos verticales).
export type Work = { src: string; width: number; height: number; alt: string; featured: boolean; carousel: boolean };

export const works: Work[] = [
  { src: "/images/trabajos/trabajo-03.jpg", width: 960, height: 1280, carousel: true, featured: true, alt: "Uñas negras mate con relieves brillantes" },
  { src: "/images/trabajos/trabajo-01.jpg", width: 1280, height: 960, carousel: false, featured: true, alt: "Uñas celestes con detalles dorados: copa, sol y estrellas" },
  { src: "/images/trabajos/trabajo-02.jpg", width: 960, height: 1280, carousel: true, featured: true, alt: "Uñas grises con estampado de cebra y cruces plateadas" },
  { src: "/images/trabajos/trabajo-08.jpg", width: 960, height: 1280, carousel: true, featured: true, alt: "Uñas almendra blancas con brillo perlado" },
  { src: "/images/trabajos/trabajo-05.jpg", width: 960, height: 1280, carousel: true, featured: true, alt: "Uñas con ilustraciones en blanco y negro" },
  { src: "/images/trabajos/trabajo-09.jpg", width: 960, height: 1280, carousel: true, featured: true, alt: "Uñas cortas con personajes y motivos en 3D" },
  { src: "/images/trabajos/trabajo-06.jpg", width: 960, height: 1280, carousel: true, featured: true, alt: "Uñas cortas con diseños dibujados en blanco, negro y rojo" },
  { src: "/images/trabajos/trabajo-04.jpg", width: 960, height: 1280, carousel: false, featured: false, alt: "Muestrario de diseños con cromados y relieves sobre tips" },
  { src: "/images/trabajos/trabajo-07.jpg", width: 960, height: 1280, carousel: false, featured: false, alt: "Tips transparentes colocados sobre uñas naturales" },
];
