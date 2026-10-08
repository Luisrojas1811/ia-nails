"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";

export type Slide = { src: string; alt: string; width: number; height: number };

// El recuadro queda quieto: solo cambia la foto de adentro (fundido suave).
// Cambia solo siempre. Con "reducir movimiento" activado en el sistema, el cambio es instantáneo (sin fundido).
// Hay botón de pausa y se frena al pasar el mouse (accesibilidad).
export function HeroSlideshow({ slides, interval = 4500 }: { slides: Slide[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const running = !userPaused && !hovering && slides.length > 1;

  useEffect(() => {
    if (!running) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % slides.length), interval);
    return () => clearTimeout(id); // se reinicia al cambiar de foto, también si la eligen a mano
  }, [running, index, slides.length, interval]);

  return (
    <div
      role="group" aria-roledescription="carrusel" aria-label="Trabajos de Iara"
      className="relative aspect-[5/6] w-full overflow-hidden rounded-xl bg-surface-low shadow-2xl"
      onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)} onBlur={() => setHovering(false)}
    >
      {slides.map((s, i) => {
        const landscape = s.width > s.height; // las horizontales se muestran enteras, con fondo desenfocado
        return (
          <div key={s.src} data-slide aria-hidden={i !== index}
            className={`absolute inset-0 transition-opacity duration-1000 motion-reduce:transition-none ${i === index ? "opacity-100" : "opacity-0"}`}>
            {landscape && (
              <Image src={s.src} alt="" fill aria-hidden sizes="40vw" className="scale-125 object-cover blur-2xl brightness-90" />
            )}
            <Image src={s.src} alt={s.alt} fill priority={i === 0} sizes="(min-width:1024px) 40vw, 100vw"
              className={landscape ? "object-contain" : "object-cover object-[center_55%]"} />
          </div>
        );
      })}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/50 to-transparent px-4 pb-3 pt-10">
        <div className="flex items-center">
          {slides.map((s, i) => (
            <button key={s.src} type="button" aria-label={`Ver foto ${i + 1} de ${slides.length}`} aria-current={i === index}
              onClick={() => setIndex(i)} className="group flex h-6 w-5 items-center justify-center">
              <span className={`block h-2 rounded-full transition-all ${i === index ? "w-5 bg-white" : "w-2 bg-white/60 group-hover:bg-white"}`} />
            </button>
          ))}
        </div>
        {slides.length > 1 && (
          <button type="button" onClick={() => setUserPaused((p) => !p)}
            aria-label={userPaused ? "Reanudar el cambio automático de fotos" : "Pausar el cambio automático de fotos"}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60">
            {userPaused ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />}
          </button>
        )}
      </div>
    </div>
  );
}
