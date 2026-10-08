"use client";
import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";

export type Slide = { src: string; alt: string };

const QUERY = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const m = window.matchMedia(QUERY);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const prefersReducedMotion = () => window.matchMedia(QUERY).matches;

// El recuadro queda quieto: solo cambia la foto de adentro (fundido suave).
export function HeroSlideshow({ slides, interval = 4500 }: { slides: Slide[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const reduced = useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
  const running = !reduced && !userPaused && !hovering && slides.length > 1;

  useEffect(() => {
    if (!running) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % slides.length), interval);
    return () => clearTimeout(id); // se reinicia al cambiar de foto, también si la eligen a mano
  }, [running, index, slides.length, interval]);

  return (
    <div
      role="group" aria-roledescription="carrusel" aria-label="Trabajos de Iara"
      className="relative h-[480px] overflow-hidden rounded-xl shadow-2xl"
      onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)} onBlur={() => setHovering(false)}
    >
      {slides.map((s, i) => (
        <Image key={s.src} src={s.src} alt={s.alt} fill priority={i === 0} aria-hidden={i !== index}
          sizes="(min-width:1024px) 40vw, 100vw"
          className={`object-cover object-[center_60%] transition-opacity duration-1000 motion-reduce:transition-none ${i === index ? "opacity-100" : "opacity-0"}`} />
      ))}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/50 to-transparent px-4 pb-3 pt-10">
        <div className="flex items-center">
          {slides.map((s, i) => (
            <button key={s.src} type="button" aria-label={`Ver foto ${i + 1} de ${slides.length}`} aria-current={i === index}
              onClick={() => setIndex(i)} className="group flex h-6 w-5 items-center justify-center">
              <span className={`block h-2 rounded-full transition-all ${i === index ? "w-5 bg-white" : "w-2 bg-white/60 group-hover:bg-white"}`} />
            </button>
          ))}
        </div>
        {!reduced && slides.length > 1 && (
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
