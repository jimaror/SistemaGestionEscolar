# 🚀 GUÍA DE DESPLIEGUE EN LA NUBE (24/7, gratis)

Sistema de Gestión Escolar — Colegio Otto de la Rocha

**Resultado final:** una dirección tipo `https://colegio-otto.vercel.app` que
funciona 24/7 desde cualquier máquina con internet, sin depender de tu PC.

---

## 📐 Arquitectura del despliegue

```
                    Internet
                       │
        ┌──────────────┴──────────────┐
        │                             │
   Vercel (frontend)            Render (backend)
   Next.js 16 + React          Spring Boot 4 + Java 21
  免费  CDN global              Dockerfile + PostgreSQL
        │                             │
        │  proxy /api/* (sin CORS)   │
        └──────────────┬──────────────┘
                       │
                 PostgreSQL (gratis)
                 datos del colegio
```

**¿Por qué un proxy?** El navegador llama solo a Vercel. Vercel reenvía al
backend **sin** el header `Origin`, así que Spring Boot nunca rechaza la
petición por CORS. Además el backend **nunca queda expuesto** a internet.

---

## 📋 PARTE 1 — Publicar el código en GitHub

### 1.1 Crear el repositorio

1. Abrí <https://github.com/new>
2. Nombre: `SistemaGestionEscolar`
3. Visibilidad: **Private** (o Public, según tu curso)
4. **NO** marques "Add a README" ni ".gitignore"
5. Click **Create repository**

### 1.2 Subir el código (desde tu terminal)

```powershell
cd "C:\Users\JMarkz\Desktop\ProyectoWebEscolar"
git remote add origin https://github.com/jimaror/SistemaGestionEscolar.git
git push -u origin main
```

> Si te pide usuario: `jimaror`. Si pide contraseña: usá un **Personal Access
> Token** (GitHub → Settings → Developer settings → Personal access tokens).

---

## 📋 PARTE 2 — Backend + Base de datos en Render

### 2.1 Crear la cuenta

1. Abrí <https://render.com> → **Get Started** (con GitHub)
2. Autorizá el acceso a tu cuenta de GitHub

### 2.2 Crear el Blueprint (todo de un golpe)

1. En Render, click **New** → **Blueprint**
2. Conectá el repositorio `SistemaGestionEscolar`
3. Render detecta el archivo `escolar/render.yaml` automáticamente
4. Click **Apply**

> Render crea las 2 cosas:
> - **escolar-db** → PostgreSQL 16 (gratis)
> - **escolar-backend** → Web service con Docker

### 2.3 Esperar el deploy

Tarda **5-8 minutos** la primera vez (descarga JDK, compila, crea el esquema).

Cuando termine, Render te muestra la URL del backend:

```
https://escolar-backend.onrender.com
```

### 2.4 Cargar los datos (¡importante!)

El backend crea las tablas vacías. Para llenarlas:

1. En Render → tu servicio **escolar-db** → **Shell**
2. Ejecuta:

```bash
psql "$DATABASE_URL" -f datos-postgres.sql
```

> Si Render no deja subir el archivo, usa el **"psql" del dashboard** o
> conéctate con DBeaver usando la URL interna de la base de datos.

**Verificación:** el login debería funcionar con `director1` / `pass123`.

---

## 📋 PARTE 3 — Frontend en Vercel

### 3.1 Crear la cuenta

1. Abrí <https://vercel.com> → **Continue with GitHub**
2. Autorizá GitHub

### 3.2 Importar el proyecto

1. Click **Add New...** → **Project**
2. Importá el repositorio `SistemaGestionEscolar`
3. Configuración:
   - **Root Directory:** `escolar/frontend` ← ¡importante!
   - **Framework Preset:** Next.js (detecta solo)
   - **Build Command:** `npm run build` (por defecto)
4. Click **Deploy**

### 3.3 Variables de entorno

Antes de deployar, en **Settings → Environment Variables**, agrega:

| Nombre | Valor |
|---|---|
| `BACKEND_URL` | `https://escolar-backend.onrender.com` |
| `NEXT_PUBLIC_API_URL` | `/api` |

> Los 3 de la tabla se agregan **para Production**, **Preview** y
> **Development** (marca las 3 casillas).

### 3.4 Redeploy

Con las variables ya guardadas, en **Deployments** click **Redeploy**.

---

## 📋 PARTE 4 — CORS en el backend

El backend solo acepta peticiones del dominio de Vercel:

1. Render → **escolar-backend** → **Environment**
2. **Add Environment Variable**:
   - Key: `CORS_ORIGENES`
   - Value: `https://colegio-otto.vercel.app`
3. Click **Save Changes** → Render redespliega solo

> ¿También lo usás local? Poné los dos separados por coma:
> `https://colegio-otto.vercel.app,http://localhost:3000`

---

## ✅ Resultado

Tu sistema queda en:

```
https://colegio-otto.vercel.app
```

- ✅ Funciona 24/7, aunque apagues tu computadora
- ✅ Misma URL para siempre
- ✅ Se puede abrir desde cualquier ciudad y cualquier dispositivo
- ✅ Base de datos PostgreSQL gratis en Render

**Usuarios:** `director1` / `pass123`

---

## ⚠️ Limitaciones del plan gratis

| Plataforma | Limitación |
|---|---|
| **Render** (backend) | Se apaga tras 15 min sin uso. La primera visita tarda ~1 min mientras despierta. |
| **Render** (PostgreSQL) | La base de datos **se borra a los 30 días**. Hay que renovarla o migrar los datos. |
| **Vercel** (frontend) | 100 GB de ancho de banda/mes. Sin límite de tiempo. |

> **Si querés que NO se apague** → Renderfree no lo permite; hace falta el plan
> de pago ($7/mes). Alternativa gratuita sin apagado: **Koyeb** o **Fly.io**.

---

## 🔧 Comandos útiles de mantenimiento

```powershell
# Ver logs del backend en vivo (si lo corres en tu PC)
cd "C:\Users\JMarkz\Desktop\ProyectoWebEscolar\escolar"
java -jar target\escolar-0.0.1-SNAPSHOT.jar

# Regenerar los datos (por si cambia la base de datos)
powershell -ExecutionPolicy Bypass -File "C:\Users\JMarkz\Desktop\ProyectoWebEscolar\escolar\exportar-datos.ps1"

# Publicar cambios nuevos
cd "C:\Users\JMarkz\Desktop\ProyectoWebEscolar"
git add .
git commit -m "Actualizacion"
git push
```

> Cada `git push` dispara el redespliegue automático en Render y Vercel. 🎉

---

## 📊 Alternativa: todo en un solo lugar

Si prefieres evitar dos plataformas, **Render** también puede alojar el
frontend. Agrega este servicio al `render.yaml`:

```yaml
  - type: web
    name: escolar-frontend
    runtime: node
    rootDir: escolar/frontend
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: BACKEND_URL
        fromService:
          name: escolar-backend
          type: web
          property: host
      - key: NEXT_PUBLIC_API_URL
        value: /api
```

La URL quedaría `https://escolar-frontend.onrender.com` (un poco más larga,
pero todo en un solo panel).
