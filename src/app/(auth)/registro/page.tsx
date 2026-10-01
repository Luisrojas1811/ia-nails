import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { AuthCard } from "@/components/AuthCard";
import { AuthForm } from "@/components/AuthForm";
import { signUp } from "../actions";

export const dynamic = "force-dynamic"; // depende de la sesión de cada persona
export const metadata: Metadata = { title: "Crear cuenta", robots: { index: false } };

export default async function RegistroPage() {
  if (await getUser()) redirect("/mis-cursos");
  return (
    <AuthCard title="Crear cuenta" intro="Con tu cuenta vas a ver tus cursos y retomar donde dejaste."
      footer={<p>¿Ya tenés cuenta? <Link href="/ingresar" className="font-semibold text-violet">Ingresá</Link></p>}>
      <AuthForm action={signUp} submit="Crear cuenta" fields={[
        { name: "name", label: "Nombre y apellido", type: "text", autoComplete: "name", minLength: 2 },
        { name: "email", label: "Email", type: "email", autoComplete: "email" },
        { name: "password", label: "Contraseña (mínimo 8)", type: "password", autoComplete: "new-password", minLength: 8, maxLength: 72 },
      ]} />
    </AuthCard>
  );
}
