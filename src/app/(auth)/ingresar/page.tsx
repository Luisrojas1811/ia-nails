import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth";
import { AuthCard } from "@/components/AuthCard";
import { AuthForm } from "@/components/AuthForm";
import { signIn } from "../actions";

export const metadata: Metadata = { title: "Ingresar", robots: { index: false } };

export default async function IngresarPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  if (await getUser()) redirect(safeNext(next));
  return (
    <AuthCard title="Ingresar" intro="Accedé a tus cursos."
      notice={error === "link" ? "El link venció o no es válido. Pedí uno nuevo." : undefined}
      footer={<>
        <p>¿No tenés cuenta? <Link href="/registro" className="font-semibold text-violet">Creá una</Link></p>
        <p><Link href="/recuperar" className="font-semibold text-violet">Olvidé mi contraseña</Link></p>
      </>}>
      <AuthForm action={signIn} submit="Ingresar" hidden={{ next: safeNext(next) }} fields={[
        { name: "email", label: "Email", type: "email", autoComplete: "email" },
        { name: "password", label: "Contraseña", type: "password", autoComplete: "current-password" },
      ]} />
    </AuthCard>
  );
}
