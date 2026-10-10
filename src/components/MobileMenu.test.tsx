// @vitest-environment jsdom
import { createElement, type AnchorHTMLAttributes } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MobileMenu } from "./MobileMenu";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => createElement("a", { href, ...rest }, children),
}));

afterEach(cleanup);

describe("MobileMenu", () => {
  it("abre y cierra con el botón, y avisa su estado", () => {
    render(createElement(MobileMenu));
    const btn = screen.getByRole("button", { name: "Abrir menú" });
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(btn);
    expect(screen.getByRole("button", { name: "Cerrar menú" }).getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("navigation", { name: "Móvil" })).toBeTruthy();
  });

  it("se cierra con Escape y el foco vuelve al botón", () => {
    render(createElement(MobileMenu));
    fireEvent.click(screen.getByRole("button", { name: "Abrir menú" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("navigation", { name: "Móvil" })).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Abrir menú" }));
  });

  it("otras teclas no lo cierran", () => {
    render(createElement(MobileMenu));
    fireEvent.click(screen.getByRole("button", { name: "Abrir menú" }));
    fireEvent.keyDown(document, { key: "a" });
    expect(screen.getByRole("navigation", { name: "Móvil" })).toBeTruthy();
  });
});
