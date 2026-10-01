import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { devoluciones } from "@/content/legal";

export const metadata: Metadata = { title: "Devoluciones y arrepentimiento" };

export default function Page() {
  return <LegalPage doc={devoluciones} />;
}
