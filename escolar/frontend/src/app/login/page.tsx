"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  despertarBackend,
  esFallaDeArranque,
  guardarSesion,
  login,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EscudoNicaragua } from "@/components/escudo";
import {
  UserIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ShieldIcon,
  SparklesIcon,
  CheckIcon,
  ArrowRightIcon,
  LoaderIcon,
} from "@/components/icons";

const VENTAJAS = [
  {
    icon: ShieldIcon,
    titulo: "Acceso seguro",
    texto: "Autenticación con roles y permisos por usuario.",
  },
  {
    icon: SparklesIcon,
    titulo: "Todo en un panel",
    texto: "Información clara y actualizada en tiempo real.",
  },
  {
    icon: CheckIcon,
    titulo: "Simple y rápido",
    texto: "Diseñado para que gestionar el colegio sea fácil.",
  },
];

const DEMOS = [
  { label: "👨‍💼 Director", user: "director1", emoji: "👨‍💼", color: "from-purple-600 to-indigo-600" },
  { label: "👩‍🏫 Maestro", user: "maestra_ana", emoji: "👩‍🏫", color: "from-blue-600 to-cyan-500" },
  { label: "🎓 Alumno", user: "alumno_juan", emoji: "🎓", color: "from-emerald-600 to-teal-500" },
];
const PASS_DEMO = "pass123";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verPassword, setVerPassword] = useState(false);
  const [despertando, setDespertando] = useState(true);
  const [intentoArranque, setIntentoArranque] = useState(0);
  const [demoActivo, setDemoActivo] = useState<string | null>(null);
  const router = useRouter();

  const entrarDemo = async (user: string) => {
    setDemoActivo(user);
    setError(null);
    setUsername(user);
    setPassword(PASS_DEMO);
    setLoading(true);
    try {
      const listo = await despertarBackend((i) => setIntentoArranque(i));
      setDespertando(false);
      if (!listo) { setError("El servidor está tardando. Intentá de nuevo."); return; }
      let data;
      try { data = await login({ username: user, password: PASS_DEMO }); }
      catch (err) {
        if (!esFallaDeArranque(err)) throw err;
        await new Promise((r) => setTimeout(r, 4000));
        data = await login({ username: user, password: PASS_DEMO });
      }
      guardarSesion(data);
      router.push("/dashboard");
    } catch {
      setError("No se pudo iniciar sesión de demostración.");
    } finally {
      setLoading(false);
      setDemoActivo(null);
    }
  };

  // Apenas se abre la pantalla, empezamos a despertar el backend en
  // segundo plano. Asi, cuando la persona termina de escribir, el
  // servidor ya esta iniciando o listo.
  useEffect(() => {
    let activo = true;
    despertarBackend((intento) => {
      if (activo) setIntentoArranque(intento);
    })
      .then(() => {
        if (activo) setDespertando(false);
      })
      .catch(() => {
        if (activo) setDespertando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const listo = await despertarBackend((intento) =>
        setIntentoArranque(intento)
      );
      setDespertando(false);

      if (!listo) {
        setError(
          "El servidor está tardando en iniciar. Esperá unos segundos y volvé a intentar."
        );
        return;
      }

      let data;
      try {
        data = await login({ username: username.trim(), password });
      } catch (err) {
        // Si el backend se durmio justo antes del ingreso, se reintenta
        // una vez tras unos segundos.
        if (!esFallaDeArranque(err)) throw err;
        await new Promise((resolver) => setTimeout(resolver, 4000));
        data = await login({ username: username.trim(), password });
      }

      guardarSesion(data);
      router.push("/dashboard");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401) {
        setError("Usuario o contraseña incorrectos.");
      } else if (status === 403) {
        setError("Tu cuenta está inactiva. Contactá al administrador.");
      } else if (status === 400) {
        setError("Revisá los datos ingresados.");
      } else {
        setError(
          "El servidor está iniciando. Esperá unos segundos y volvé a intentar."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="animate-gradient relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 px-4 py-10">
      {/* Orbes morados difuminados */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="animate-float-slow absolute -left-24 -top-24 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="animate-float-slower absolute -right-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="animate-float-slow absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        {/* Tarjeta limpia y profesional */}
        <div className="animate-fade-up w-full overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/5">
          {/* Acento superior morado con degradado */}
          <div
            className="h-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500"
            aria-hidden="true"
          />

          <div className="px-8 pb-8 pt-8 sm:px-10">
            {/* Escudo nacional, pequeño y bien definido */}
            <div className="mx-auto w-fit rounded-full bg-white p-1.5 shadow-lg shadow-purple-900/10 ring-1 ring-purple-100">
              <EscudoNicaragua className="h-14 w-14" />
            </div>

            <h1 className="mt-4 text-center text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Colegio Otto de la Rocha
            </h1>
            <p className="mt-1 text-center text-sm text-slate-500">
              Sistema de Gestión Escolar
            </p>

            <div className="mt-7 flex items-center gap-3" aria-hidden="true">
              <span className="h-px flex-1 bg-slate-200/80" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Iniciar sesión
              </span>
              <span className="h-px flex-1 bg-slate-200/80" />
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username">Usuario</Label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-500" />
                  <Input
                    id="username"
                    placeholder="Ej: alumno_juan"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-500" />
                  <Input
                    id="password"
                    type={verPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setVerPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-indigo-600"
                    aria-label={
                      verPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {verPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {!error && despertando && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                  <LoaderIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Iniciando el servidor… La primera vez puede tardar hasta un
                    minuto.
                    {intentoArranque > 1
                      ? ` Reintentando (${intentoArranque}/2).`
                      : ""}
                  </span>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoaderIcon className="h-5 w-5" />
                    {despertando ? "Iniciando servidor…" : "Ingresando..."}
                  </>
                ) : (
                  <>
                    Ingresar
                    <ArrowRightIcon className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            {/* ── Accesos de demostración ── */}
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-4">
              <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                🎭 Accesos de demostración
              </p>
              <div className="grid grid-cols-3 gap-2">
                {DEMOS.map((demo) => (
                  <button
                    key={demo.user}
                    type="button"
                    disabled={loading}
                    onClick={() => void entrarDemo(demo.user)}
                    className={`relative flex flex-col items-center gap-1 overflow-hidden rounded-xl bg-gradient-to-br ${demo.color} px-2 py-2.5 text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-60`}
                  >
                    {demoActivo === demo.user && (
                      <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/20">
                        <LoaderIcon className="h-4 w-4 animate-spin text-white" />
                      </span>
                    )}
                    <span className="text-xl leading-none">{demo.emoji}</span>
                    <span className="text-[11px] font-bold leading-tight">
                      {demo.label.replace(demo.emoji + " ", "")}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-center text-[10px] text-slate-400">
                Solo para presentación · No compartir
              </p>
            </div>

            <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
              Nicaragua · América Central
            </p>
          </div>
        </div>

        {/* Ventajas (escritorio) */}
        <div className="mt-8 hidden w-full grid-cols-3 gap-3 sm:grid">
          {VENTAJAS.map((item) => (
            <div
              key={item.titulo}
              className="rounded-2xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-xl"
            >
              <item.icon className="mx-auto h-5 w-5 text-fuchsia-200" />
              <p className="mt-1.5 text-xs font-semibold text-white">
                {item.titulo}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-purple-100/80">
                {item.texto}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs font-medium text-purple-200/70">
          © {new Date().getFullYear()} Colegio Otto de la Rocha · Acceso
          exclusivo para personal y estudiantes
        </p>
      </div>
    </main>
  );
}
