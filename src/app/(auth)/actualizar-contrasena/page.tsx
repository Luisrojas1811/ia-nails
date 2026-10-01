import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { AuthCard } from "@/components/AuthCard";
import { AuthForm } from "@/components/AuthForm";
import { updatePassword } from "../actions";

export const dynamic = "force-dynamic"; // depende de la sesión de cada persona
export const metadata: Metadata = { title: "Nueva contraseña", robots: { index: false } };

export default async function ActualizarContrasenaPage() {
  if (!(await getUser())) redirect("/ingresar?error=link");
  return (
    <AuthCard title="Nueva contraseña" intro="Elegí una contraseña de al menos 8 caracteres.">
      <AuthForm action={updatePassword} submit="Guardar contraseña" fields={[
        { name: "password", label: "Nueva contraseña", type: "password", autoComplete: "new-password", minLength: 8, maxLength: 72 },
        { name: "confirm", label: "Repetí la contraseña", type: "password", autoComplete: "new-password", minLength: 8, maxLength: 72 },
      ]} />
    </AuthCard>
  );
}
