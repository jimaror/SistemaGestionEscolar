"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon, SparklesIcon } from "@/components/icons";

interface Props {
  titulo: string;
  descripcion: string;
  icon: ReactNode;
  color: string;
}

export function ModuloEnConstruccion({
  titulo,
  descripcion,
  icon,
  color,
}: Props) {
  const router = useRouter();

  return (
    <AppShell titulo={titulo} subtitulo="Módulo del sistema escolar">
      <div className="mx-auto max-w-3xl">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-100/70 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-fuchsia-100/60 blur-3xl" />

          <div className="relative">
            <div
              className={`mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}
            >
              {icon}
            </div>
            <h2 className="mt-6 text-2xl font-bold text-slate-900">{titulo}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 sm:text-base">
              {descripcion}
            </p>

            <div className="mt-6 flex justify-center">
              <Badge variant="info">
                <SparklesIcon className="h-3.5 w-3.5" />
                Módulo en construcción
              </Badge>
            </div>

            <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
              {[
                {
                  titulo: "Diseño listo",
                  texto: "La interfaz ya está integrada al panel.",
                },
                {
                  titulo: "API conectada",
                  texto: "Se vinculará con el backend escolar.",
                },
                {
                  titulo: "Por rol",
                  texto: "Cada usuario verá lo que le corresponde.",
                },
              ].map((item) => (
                <div
                  key={item.titulo}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                >
                  <p className="text-xs font-semibold text-slate-900">
                    {item.titulo}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                    {item.texto}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <Button
                variant="gradient"
                onClick={() => router.push("/dashboard")}
              >
                Volver al panel
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
