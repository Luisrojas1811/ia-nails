// @vitest-environment jsdom
import { createElement } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeroSlideshow } from "./HeroSlideshow";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => createElement("img", { src, alt }),
}));

const slides = ["a", "b", "c"].map((n) => ({ src: `/${n}.jpg`, alt: `foto ${n}` }));
const INTERVAL = 4500;

function setup(reducedMotion = false) {
  window.matchMedia = ((q: string) => ({ matches: reducedMotion && q.includes("reduce"), media: q, addEventListener() {}, removeEventListener() {} })) as never;
  const view = render(createElement(HeroSlideshow, { slides, interval: INTERVAL }));
  const frame = view.container.firstElementChild as HTMLElement;
  const active = () => [...view.container.querySelectorAll("[data-slide]")].findIndex((el) => el.getAttribute("aria-hidden") === "false");
  const wait = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });
  const tap = () => fireEvent.pointerUp(frame, { pointerType: "touch", clientX: 40, clientY: 40 });
  return { frame, active, wait, tap };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("HeroSlideshow: cambio automático", () => {
  it("empieza en la primera foto y cambia sola, una tras otra, y vuelve al principio", () => {
    const { active, wait } = setup();
    expect(active()).toBe(0);
    wait(INTERVAL); expect(active()).toBe(1);
    wait(INTERVAL); expect(active()).toBe(2);
    wait(INTERVAL); expect(active()).toBe(0);
  });

  it("cambia sola aunque el sistema tenga activado «reducir movimiento»", () => {
    const { active, wait } = setup(true);
    wait(INTERVAL); expect(active()).toBe(1);
  });

  it("se frena mientras el mouse está encima y sigue al sacarlo", () => {
    const { frame, active, wait } = setup();
    fireEvent.pointerEnter(frame, { pointerType: "mouse" });
    wait(INTERVAL * 3); expect(active()).toBe(0);
    fireEvent.pointerLeave(frame, { pointerType: "mouse" });
    wait(INTERVAL); expect(active()).toBe(1);
  });

  it("un toque en el celular NO la deja frenada para siempre", () => {
    const { frame, active, wait } = setup();
    fireEvent.pointerEnter(frame, { pointerType: "touch" }); // los navegadores lo disparan al tocar
    wait(INTERVAL); expect(active()).toBe(1);
  });
});

describe("HeroSlideshow: flechas", () => {
  it("no hay puntitos ni botón de pausa", () => {
    setup();
    expect(screen.queryByLabelText(/Pausar|Reanudar|Ver foto/)).toBeNull();
  });

  it("siguiente y anterior cambian de foto, y dan la vuelta", () => {
    const { active } = setup();
    fireEvent.click(screen.getByLabelText("Foto anterior")); expect(active()).toBe(2);
    fireEvent.click(screen.getByLabelText("Foto siguiente")); expect(active()).toBe(0);
    fireEvent.click(screen.getByLabelText("Foto siguiente")); expect(active()).toBe(1);
  });

  it("al usar una flecha el reloj arranca de nuevo", () => {
    const { active, wait } = setup();
    wait(INTERVAL - 500);
    fireEvent.click(screen.getByLabelText("Foto siguiente")); expect(active()).toBe(1);
    wait(INTERVAL - 500); expect(active()).toBe(1);
    wait(500); expect(active()).toBe(2);
  });

  it("con una sola foto no hay flechas", () => {
    window.matchMedia = (() => ({ matches: false, addEventListener() {}, removeEventListener() {} })) as never;
    render(createElement(HeroSlideshow, { slides: slides.slice(0, 1) }));
    expect(screen.queryByLabelText("Foto siguiente")).toBeNull();
  });
});

describe("HeroSlideshow: zoom y flechas en el celular", () => {
  it("tocar la foto la agranda y muestra las flechas; tocar de nuevo la achica", () => {
    const { frame, tap } = setup();
    expect(frame.getAttribute("data-zoomed")).toBe("false");
    expect(screen.getByLabelText("Foto siguiente").getAttribute("data-show")).toBe("false");
    tap();
    expect(frame.getAttribute("data-zoomed")).toBe("true");
    expect(screen.getByLabelText("Foto siguiente").getAttribute("data-show")).toBe("true");
    tap();
    expect(frame.getAttribute("data-zoomed")).toBe("false");
  });

  it("el clic del mouse no activa el zoom del celular", () => {
    const { frame } = setup();
    fireEvent.pointerUp(frame, { pointerType: "mouse" });
    expect(frame.getAttribute("data-zoomed")).toBe("false");
  });

  it("mientras está agrandada no cambia sola; a los 6 segundos se achica y sigue", () => {
    const { frame, active, wait, tap } = setup();
    tap();
    wait(5900); expect(active()).toBe(0);
    wait(200); expect(frame.getAttribute("data-zoomed")).toBe("false");
    wait(INTERVAL); expect(active()).toBe(1);
  });

  it("tocar una flecha cambia la foto sin achicar el zoom", () => {
    const { frame, active, tap } = setup();
    tap();
    const next = screen.getByLabelText("Foto siguiente");
    fireEvent.pointerUp(next, { pointerType: "touch" });
    fireEvent.click(next);
    expect(active()).toBe(1);
    expect(frame.getAttribute("data-zoomed")).toBe("true");
  });
});
