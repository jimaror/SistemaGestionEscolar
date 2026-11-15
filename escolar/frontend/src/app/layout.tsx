import type { Metadata } from "next";
import { Heartbeat } from "@/components/heartbeat";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistema Escolar | Colegio Otto de la Rocha",
  description: "Sistema de gestión escolar - Colegio Otto de la Rocha",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-950 text-slate-900 antialiased">
        <Heartbeat />
        {children}
      </body>
    </html>
  );
}
