// @vitest-environment jsdom
import { createElement } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeroSlideshow } from "./HeroSlideshow";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => createElement("img", { src, alt }),
}));

const slides = ["a", "b", "c"].map((n) => ({ src: `/${n}.jpg`, alt: `foto ${n}`, width: 960, height: 1280 }));
const INTERVAL = 4500;

function setup(reducedMotion = false) {
  window.matchMedia = ((q: string) => ({ matches: reducedMotion && q.includes("reduce"), media: q, addEventListener() {}, removeEventListener() {} })) as never;
  const view = render(createElement(HeroSlideshow, { slides, interval: INTERVAL }));
  const active = () => [...view.container.querySelectorAll("[data-slide]")].findIndex((el) => el.getAttribute("aria-hidden") === "false");
  const wait = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });
  return { view, active, wait };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("HeroSlideshow", () => {
  it("empieza en la primera foto y cambia sola, una tras otra, y vuelve al principio", () => {
    const { active, wait } = setup();
    expect(active()).toBe(0);
    wait(INTERVAL); expect(active()).toBe(1);
    wait(INTERVAL); expect(active()).toBe(2);
    wait(INTERVAL); expect(active()).toBe(0);
  });

  it("también cambia sola aunque el sistema tenga activado «reducir movimiento»", () => {
    const { active, wait } = setup(true);
    wait(INTERVAL); expect(active()).toBe(1);
  });

  it("se frena al pasar el mouse y sigue al sacarlo", () => {
    const { view, active, wait } = setup();
    const frame = view.container.firstElementChild as HTMLElement;
    fireEvent.mouseEnter(frame);
    wait(INTERVAL * 3); expect(active()).toBe(0);
    fireEvent.mouseLeave(frame);
    wait(INTERVAL); expect(active()).toBe(1);
  });

  it("el botón de pausa frena el cambio y el mismo botón lo reanuda", () => {
    const { active, wait } = setup();
    fireEvent.click(screen.getByLabelText(/Pausar el cambio automático/));
    wait(INTERVAL * 3); expect(active()).toBe(0);
    fireEvent.click(screen.getByLabelText(/Reanudar el cambio automático/));
    wait(INTERVAL); expect(active()).toBe(1);
  });

  it("los puntos llevan a la foto elegida y el reloj arranca de nuevo", () => {
    const { active, wait } = setup();
    wait(INTERVAL - 500);
    fireEvent.click(screen.getByLabelText("Ver foto 3 de 3"));
    expect(active()).toBe(2);
    wait(INTERVAL - 500); expect(active()).toBe(2); // todavía no pasó el tiempo completo
    wait(500); expect(active()).toBe(0);
  });

  it("con una sola foto no muestra pausa ni cambia", () => {
    window.matchMedia = (() => ({ matches: false, addEventListener() {}, removeEventListener() {} })) as never;
    render(createElement(HeroSlideshow, { slides: slides.slice(0, 1) }));
    expect(screen.queryByLabelText(/Pausar/)).toBeNull();
  });
});
