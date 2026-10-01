import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";
import { AuthForm } from "@/components/AuthForm";
import { requestReset } from "../actions";

export const metadata: Metadata = { title: "Recuperar contraseña", robots: { index: false } };

export default function RecuperarPage() {
  return (
    <AuthCard title="Recuperar contraseña" intro="Te enviamos un link por mail para elegir una nueva."
      footer={<p><Link href="/ingresar" className="font-semibold text-violet">Volver a ingresar</Link></p>}>
      <AuthForm action={requestReset} submit="Enviar link" fields={[
        { name: "email", label: "Email", type: "email", autoComplete: "email" },
      ]} />
    </AuthCard>
  );
}
