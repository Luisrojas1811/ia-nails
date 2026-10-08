"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type Slide = { src: string; alt: string };

const TOUCH_TIMEOUT_MS = 6000; // en el celular, el zoom se cierra solo y el carrusel vuelve a andar

// Solo el teclado (no el clic del mouse) muestra las flechas y frena el carrusel.
const isKeyboardFocus = (target: EventTarget) => {
  try { return (target as Element).matches(":focus-visible"); } catch { return true; }
};

const arrow =
  "pointer-events-none absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink opacity-0 shadow-md backdrop-blur transition-opacity duration-300 hover:bg-white " +
  "group-hover:pointer-events-auto group-hover:opacity-100 group-has-[:focus-visible]:pointer-events-auto group-has-[:focus-visible]:opacity-100 data-[show=true]:pointer-events-auto data-[show=true]:opacity-100";

// El recuadro queda quieto: cambia la foto de adentro, con un fundido lento con efecto niebla.
// Mouse: la foto se agranda al pasar por encima y aparecen las flechas.
// Celular: tocar la foto la agranda en el punto tocado y muestra las flechas; tocar de nuevo la achica.
export function HeroSlideshow({ slides, interval = 4500 }: { slides: Slide[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const count = slides.length;
  const running = count > 1 && !hovering && !keyboard && !zoomed;

  useEffect(() => {
    if (!running) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % count), interval);
    return () => clearTimeout(id); // se reinicia con cada cambio de foto, también si lo hacen con las flechas
  }, [running, index, count, interval]);

  useEffect(() => {
    if (!zoomed) return;
    const id = setTimeout(() => setZoomed(false), TOUCH_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [zoomed, index]);

  const go = (step: number) => setIndex((i) => (i + step + count) % count);

  // El zoom crece desde el punto donde está el mouse o donde se tocó.
  const setOrigin = (clientX: number, clientY: number) => {
    const el = frame.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    el.style.setProperty("--ox", `${(((clientX - r.left) / r.width) * 100).toFixed(1)}%`);
    el.style.setProperty("--oy", `${(((clientY - r.top) / r.height) * 100).toFixed(1)}%`);
  };

  return (
    <div
      ref={frame}
      role="group" aria-roledescription="carrusel" aria-label="Trabajos de Iara"
      data-zoomed={zoomed}
      className="group relative aspect-[5/6] w-full overflow-hidden rounded-xl bg-[#efe9f4] shadow-2xl"
      onPointerEnter={(e) => { if (e.pointerType === "mouse") setHovering(true); }}
      onPointerLeave={(e) => { if (e.pointerType === "mouse") setHovering(false); }}
      onPointerMove={(e) => { if (e.pointerType === "mouse") setOrigin(e.clientX, e.clientY); }}
      onPointerUp={(e) => {
        if (e.pointerType !== "touch") return;
        setOrigin(e.clientX, e.clientY);
        setZoomed((z) => !z);
      }}
      onFocus={(e) => { if (isKeyboardFocus(e.target)) setKeyboard(true); }}
      onBlur={() => setKeyboard(false)}
    >
      {slides.map((s, i) => {
        const active = i === index;
        return (
          <div key={s.src} data-slide aria-hidden={!active}
            className="absolute inset-0 transition-[opacity,filter] duration-[1800ms] ease-in-out"
            style={{
              opacity: active ? 1 : 0,
              // niebla: la foto que sale y la que entra pasan por un velo claro y desenfocado
              filter: active ? "blur(0px) brightness(1) saturate(1)" : "blur(18px) brightness(1.25) saturate(0.6)",
            }}>
            <div
              className={`absolute inset-0 transition-[transform,transform-origin] duration-700 ease-out will-change-transform ${zoomed ? "scale-[1.9]" : "scale-100 group-hover:scale-[1.12]"}`}
              style={{ transformOrigin: "var(--ox, 50%) var(--oy, 50%)" }}>
              <Image src={s.src} alt={s.alt} fill priority={i === 0} sizes="(min-width:1024px) 40vw, 100vw" className="object-cover object-[center_55%]" />
            </div>
          </div>
        );
      })}

      {count > 1 && (
        <>
          <button type="button" aria-label="Foto anterior" data-show={zoomed} className={`${arrow} left-3`}
            onPointerUp={(e) => e.stopPropagation()} onClick={() => go(-1)}>
            <ChevronLeft size={22} aria-hidden />
          </button>
          <button type="button" aria-label="Foto siguiente" data-show={zoomed} className={`${arrow} right-3`}
            onPointerUp={(e) => e.stopPropagation()} onClick={() => go(1)}>
            <ChevronRight size={22} aria-hidden />
          </button>
        </>
      )}
    </div>
  );
}
