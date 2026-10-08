// @vitest-environment jsdom
import { createElement } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AuthForm } from "./AuthForm";

afterEach(cleanup);

describe("AuthForm", () => {
  it("tras un error mantiene el email escrito y vacía la contraseña", async () => {
    const action = async () => ({ error: "Email o contraseña incorrectos.", values: { email: "camila@mail.com" } });
    render(createElement(AuthForm, {
      action, submit: "Ingresar",
      fields: [
        { name: "email", label: "Email", type: "email", autoComplete: "email" },
        { name: "password", label: "Contraseña", type: "password", autoComplete: "current-password" },
      ],
    }));
    const email = screen.getByLabelText("Email") as HTMLInputElement;
    const password = screen.getByLabelText("Contraseña") as HTMLInputElement;
    fireEvent.change(email, { target: { value: "camila@mail.com" } });
    fireEvent.change(password, { target: { value: "secreta-123" } });
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Ingresar" })); });
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(email.value).toBe("camila@mail.com");
    expect(password.value).toBe("");
  });
});
