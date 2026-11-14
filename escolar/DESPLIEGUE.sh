#!/usr/bin/env bash
# ============================================================================
#  DESPLIEGUE DEL COLEGIO OTTO DE LA ROCHA
#  Backend (Spring Boot) -> Render  |  Frontend (Next.js) -> Vercel
#  Base de datos PostgreSQL gratuita incluida en Render
# ============================================================================
set -e

BASE="$(cd "$(dirname "$0")" && pwd)"
FRONTEND="$BASE/frontend"

echo "==============================================================="
echo "  COLEGIO OTTO DE LA ROCHA - Despliegue en la nube"
echo "==============================================================="
echo ""

# --- 1. Comprobaciones previas -------------------------------------------
echo "[1/6] Comprobando herramientas..."

command -v git >/dev/null 2>&1 || { echo "  ERROR: falta git. Descargalo de https://git-scm.com"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "  ERROR: falta Node.js. Descargalo de https://nodejs.org"; exit 1; }
command -v npx  >/dev/null 2>&1 || { echo "  ERROR: falta npx (viene con Node.js)"; exit 1; }

echo "  git  -> $(git --version)"
echo "  node -> $(node --version)"
echo ""

# --- 2. Git: inicializar y commit ---------------------------------------
echo "[2/6] Preparando el repositorio Git..."

cd "$BASE"

if [ ! -d ".git" ]; then
    git init -b main
    git add .
    git commit -m "Colegio Otto de la Rocha: backend Spring Boot + frontend Next.js

- CRUD completo en 10 modulos (alumnos, usuarios, notas, asistencias,
  tareas, materiales, matriculas, justificaciones, reuniones, grados)
- Autenticacion JWT con roles Director/Maestro/Alumno/Tutor
- Tema visual morado/indigo con escudo de Nicaragua
- Proxy de API en Next.js para despliegue en la nube
- Dockerfile y render.yaml para despliegue en Render"
    echo "  Repositorio Git inicializado con el commit inicial."
else
    git add .
    if git diff --cached --quiet; then
        echo "  No hay cambios nuevos."
    else
        git commit -m "Actualizacion: configuracion para despliegue en la nube"
        echo "  Cambios guardados en un commit."
    fi
fi

echo ""

# --- 3. GitHub ------------------------------------------------------------
echo "[3/6] Publicando en GitHub..."
echo ""
echo "  Si tu cuenta de GitHub ya tiene el repositorio remoto:"
echo "    git remote add origin https://github.com/TU_USUARIO/ProyectoWebEscolar.git"
echo "    git push -u origin main"
echo ""
echo "  Si todavia no lo tienes, crealo en https://github.com/new"
echo "  con estos datos:"
echo "    Nombre:      ProyectoWebEscolar"
echo "    Visibilidad:  Private (o Public, segun tu curso)"
echo "    NO marques 'Add a README' ni '.gitignore'"
echo ""
read -p "  Presiona Enter cuando ya lo hayas subido a GitHub..."

# Verificar que el remoto existe
if ! git remote get-url origin >/dev/null 2>&1; then
    echo ""
    echo "  ERROR: no hay remoto 'origin' configurado."
    echo "  Ejecuta primero:"
    echo "    git remote add origin https://github.com/TU_USUARIO/ProyectoWebEscolar.git"
    echo "    git push -u origin main"
    exit 1
fi

echo "  Remoto: $(git remote get-url origin)"
echo ""

# --- 4. Render (backend + base de datos) ---------------------------------
echo "[4/6] Configurando el backend en Render..."
echo ""
echo "  1) Abre https://dashboard.render.com y crea una cuenta (gratis)"
echo "  2) Click en 'New +' > 'Blueprint'"
echo "  3) Conecta el repositorio de GitHub que acabas de subir"
echo "  4) Render detecta el archivo render.yaml automaticamente"
echo "  5) Click 'Apply' -> crea el servicio web Y la base de datos PostgreSQL"
echo ""
echo "  Espera a que el deploy termine (3-5 minutos)."
echo "  Anota la URL del backend, tendra esta forma:"
echo "     https://escolar-backend.onrender.com"
echo ""
read -p "  Presiona Enter cuando el deploy haya terminado..."

BACKEND_URL=""
read -p "  Escribe la URL del backend (sin https://): " BACKEND_URL
BACKEND_URL=$(echo "$BACKEND_URL" | tr -d ' ' | sed 's|^https\?://||' | sed 's|/$||')

if [ -z "$BACKEND_URL" ]; then
    echo "  ERROR: falta la URL del backend. Vuelve a ejecutar el script."
    exit 1
fi

echo "  Backend: https://$BACKEND_URL"
echo ""

# --- 5. Vercel (frontend) -------------------------------------------------
echo "[5/6] Configurando el frontend en Vercel..."
echo ""
echo "  1) Abre https://vercel.com y crea una cuenta (gratis)"
echo "  2) Click en 'Add New' > 'Project' > 'Import' > busca 'ProyectoWebEscolar'"
echo "  3) En 'Root Directory' escribe:  frontend"
echo "  4) En 'Environment Variables' agrega:"
echo "       BACKEND_URL          = https://$BACKEND_URL"
echo "       NEXT_PUBLIC_API_URL  = /api"
echo "  5) Click 'Deploy'"
echo ""
read -p "  Presiona Enter cuando termines el deploy en Vercel..."

# --- 6. CORS en el backend ------------------------------------------------
echo "[6/6] Ajustando el CORS del backend para el nuevo dominio..."
echo ""
echo "  En el dashboard de Render:"
echo "    1) Abre tu servicio 'escolar-backend'"
echo "    2) Menu 'Environment' > 'Add Environment Variable'"
echo "    3) Clave:   CORS_ORIGENES"
echo "    4) Valor:   https://tu-frontend.vercel.app"
echo "    5) Click 'Save Changes' (Render redespliega solo)"
echo ""
echo "  Reemplaza 'https://tu-frontend.vercel.app' por la URL que te dio Vercel."
echo ""
read -p "  Presiona Enter para finalizar..."

echo ""
echo "==============================================================="
echo "  LISTO"
echo "==============================================================="
echo ""
echo "  Tu sistema esta desplegado 24/7 y se puede abrir desde"
echo "  cualquier maquina con internet, sin instalar nada."
echo ""
echo "  Direccion: https://tu-frontend.vercel.app"
echo "  Usuario:   director1 / pass123"
echo ""
echo "  Recuerda: Render apaga el servicio tras 15 min de inactividad."
echo "  La primera visita puede tardar ~1 minuto (se despierta solo)."
echo ""
