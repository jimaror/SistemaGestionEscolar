# 🚀 DESPLIEGUE EN RENDER — Paso a paso

Todo está preparado en GitHub. Solo faltan **4 clics tuyos** en el navegador.

**Repositorio:** https://github.com/jimaror/SistemaGestionEscolar

---

## ✋ PASO 1 — Crear la cuenta en Render (2 min)

1. Abrí **https://render.com**
2. Click **"Get Started"** (arriba a la derecha)
3. Elegí **"Continue with GitHub"**
4. Autorizá GitHub (ya estás logueado → solo click **Authorize Render**)
5. Listo, ya tenés cuenta

---

## ✋ PASO 2 — Crear el Blueprint (1 min)

1. En el menú de Render: **New** → **Blueprint**
2. Render lista tus repositorios. Elegí **SistemaGestionEscolar**
   - Si no aparece: click **"Configure account"** (arriba) → **+** → busca `SistemaGestionEscolar`
3. Render lee el archivo `render.yaml` y te muestra lo que va a crear:

```
┌─────────────────────────────────────────────────────┐
│  New Blueprint Instance                             │
│                                                     │
│  Name:  escolar-backend          [docker]  web     │
│  Name:  escolar-frontend        [node]     web     │
│  Name:  escolar-db              [postgres] db      │
│                                                     │
│  Total: $0.00 / month                               │
│                                                     │
│              [ Apply ]   [ Cancel ]                 │
└─────────────────────────────────────────────────────┘
```

4. Click **Apply**

---

## ⏳ PASO 3 — Esperar el deploy (10-15 min)

Render empieza a construir. Vas a ver 3 filas:

| Servicio | Estado inicial | Tiempo |
|---|---|---|
| `escolar-db` | 🟢 Available (rápido) | 1 min |
| `escolar-backend` | 🔵 In Progress | 6-10 min (descarga JDK, compila Java) |
| `escolar-frontend` | 🔵 In Progress | 3-5 min (compila Next.js) |

> **Si el backend falla**, click en el servicio → pestaña **Logs** y mandame el error.

---

## ✋ PASO 4 — Cargar los datos (2 min)

La base de datos quedó **vacía** (solo con las tablas). Hay que meter los 311 registros.

### Opción A — Desde la terminal (recomendado)

1. En Render, click **escolar-db** → pestaña **Shell** (arriba a la izquierda)
2. Se abre una terminal del servidor. Copiá y pegá este comando:

```bash
psql "$DATABASE_URL" -f datos-postgres.sql
```

> Si dice "file not found", usá la Opción B.

### Opción B — Con el cliente `psql` de tu PC

1. En Render → **escolar-db** → **Connection** (arriba a la derecha)
2. Copiá el **Internal Database URL**
3. En tu PowerShell:

```powershell
# Reemplazar con la URL que copiaste
$env:PGPASSWORD = "TU_CONTRASEÑA"
psql "postgresql://escolar:TU_CONTRASEÑA@HOST/escolar" -f "C:\Users\JMarkz\Desktop\ProyectoWebEscolar\escolar\datos-postgres.sql"
```

---

## ✅ PASO 5 — Verificar (1 min)

### 5.1 El backend

Abrí en el navegador:
```
https://escolar-backend.onrender.com/api/salud
```

Debe mostrar:
```json
{"estado":"ok","servicio":"colegio-otto-de-la-rocha","version":"1.0.0"}
```

### 5.2 El frontend (tu URL final 🎉)

```
https://escolar-frontend.onrender.com
```

Entrá con `director1` / `pass123`.

---

## 🔧 Si el login da error "Failed to connect"

El backend no encuentra la base. Verificá:

1. **escolar-backend** → **Environment** → ¿están `DB_URL`, `DB_USER`, `DB_PASSWORD`?
2. ¿El deploy terminó? La primera vez la BD tarda en despertar.
3. Revisá los **Logs** del backend.

---

## 📌 Tus URLs finales

```
Frontend:  https://escolar-frontend.onrender.com
Backend:   https://escolar-backend.onrender.com/api/salud
Base:      PostgreSQL en Render
```

**Estas no cambian.** Tus amigas pueden entrar desde cualquier ciudad, y
funciona aunque apagues tu computadora.

---

## ⚠️ Limits del plan gratis

| Servicio | Limitación |
|---|---|
| Backend + Frontend | Se apagan tras 15 min sin uso. La 1ª visita tarda ~1 min. |
| PostgreSQL | **Se borra a los 30 días.** Para el curso está bien; para entregar, hay que renovarla. |

> Si el profesor lo revisa en menos de 30 días, funciona perfecto.
> Para algo permanente, avisame y lo movemos a una BD con más duración.
