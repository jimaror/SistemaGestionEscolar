# 🎓 Sistema de Gestión Escolar — Colegio Otto de la Rocha

Sistema web completo de gestión escolar: alumnos, usuarios, notas, asistencias,
tareas, materiales, matrículas, justificaciones, reuniones y grados, con control de
acceso por rol.

**Stack:** Next.js 16 + React + Tailwind v4 (frontend) · Spring Boot 4 + JPA/Hibernate + Spring Security + JWT (backend) · SQL Server / PostgreSQL (datos)

---

## 🎯 Qué incluye

| Módulo | Descripción |
|---|---|
| **Alumnos** | CRUD completo, datos personales, colegio, alergias, medicación |
| **Usuarios** | Gestión de cuentas con roles (solo Director) |
| **Notas** | Calificaciones por evaluación y periodo |
| **Asistencias** | Registro por fecha, estado y observación |
| **Tareas** | Con fecha límite, puntos y archivo adjunto |
| **Materiales** | Subida de archivos con vista previa |
| **Matrículas** | Inscripción por grado, sección y año escolar |
| **Justificaciones** | Ausencias justificadas con aprobación |
| **Reuniones** | Con enlace, participantes y duración |
| **Grados** | Niveles académicos (1° a 9°) |

Todos los módulos con **CRUD completo**, validaciones, modal de confirmación de
borrado y permisos por rol.

---

## 🔐 Roles y permisos

| Rol | Puede |
|---|---|
| **Director** | Todo. Único que administra usuarios y borra registros. |
| **Maestro** | Crear y editar notas, asistencias, tareas, materiales, reuniones, justificaciones. |
| **Alumno** | Consultar sus datos, entregar tareas, participar en conversaciones, pedir justificaciones. |
| **Tutor** | Consultar y gestionar a sus alumnos tutorizados. |

---

## 🏗️ Arranque rápido

### 1. Requisitos
- Java 21+ (JDK 25 en `~/.jdks/jdk-25.0.2`)
- Node.js 20+
- SQL Server (local) o PostgreSQL (nube)

### 2. Base de datos
El backend crea el esquema solo (Hibernate `ddl-auto`).

- **Local (SQL Server):** no hay que hacer nada, la configuración por defecto apunta a
  `localhost\SQL2022 / SistemaGestionEscolar`.
- **Nube (PostgreSQL):** definir las variables de entorno (ver tabla abajo).

### 3. Backend

```bash
cd escolar
./mvnw clean package -DskipTests
java -jar target/escolar-0.0.1-SNAPSHOT.jar
```

### 4. Frontend

```bash
cd escolar/frontend
npm install
npm run dev        # desarrollo (puerto 3000)
npm run build && npm start   # producción (usado en la nube)
```

### 5. Todo junto

Doble clic en **`INICIAR-COLEGIO.bat`**: levanta backend, frontend y el túnel, y
muestra la URL pública.

---

## ⚙️ Variables de entorno

Todo el backend se configura por variables de entorno, así el mismo build
sirve para local y para la nube.

| Variable | Por defecto | Para qué |
|---|---|---|
| `PORT` | `8080` | Puerto del servidor |
| `DB_URL` | SQL Server local | JDBC de la base de datos |
| `DB_USER` | `sa` | Usuario de la base de datos |
| `DB_PASSWORD` | `1234` | Contraseña |
| `DB_DRIVER` | driver de SQL Server | Driver JDBC |
| `DDL_AUTO` | `validate` | `validate` en local, `update` en la nube |
| `CORS_ORIGENES` | `localhost:3000,...` | Orígenes permitidos |
| `JWT_SECRET` | clave de desarrollo | Firma de los tokens |
| `ARCHIVOS_RUTA` | `./archivos` | Carpeta de archivos subidos |

En el frontend:

| Variable | Por defecto | Para qué |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `/api` | Ruta del API (relativa ⇒ pasa por el proxy) |
| `BACKEND_URL` | `http://localhost:8080` | Backend real al que reenvía el proxy |

---

## 🌐 Acceso desde cualquier equipo

El frontend incluye un **proxy de API** (`frontend/src/app/api/[...path]/route.ts`)
que reenvía las peticiones al backend **sin el header `Origin`** — por eso el backend no responde
`403 Invalid CORS request` cuando se entra por un túnel.

```bash
cd escolar
./DESPLIEGUE.sh
```

Ese script publica:

- **Backend** → Render (`render.yaml`: web service + PostgreSQL gratis)
- **Frontend** → Vercel
- **Datos** → `datos-postgres.sql` (305 registros de las 24 tablas)

Resultado: una dirección corta tipo `colegio-otto.vercel.app`, funcionando 24/7 desde
cualquier máquina, sin instalar nada.

---

## 📁 Estructura

```text
escolar/
├── src/main/java/com/unmrma/escolar/
│   ├── controlador/     # Endpoints REST (11 controladores)
│   ├── modelo/          # Entidades JPA (25)
│   ├── repositorio/     # Repositorios Spring Data
│   ├── seguridad/       # JWT, filtros, codificador de contraseñas
│   ├── dtos/            # Request/Response
│   └── configuracion/   # Seguridad, CORS
├── src/main/resources/application.properties
├── Dockerfile           # Imagen para Render
├── render.yaml          # Despliegue en un clic
├── exportar-datos.ps1  # Exporta los datos a PostgreSQL
├── frontend/            # Next.js
└── INICIAR-COLEGIO.bat
```

---

## 🎨 Frontend

- Tema **morado / índigo / fucsia** con degradado
- **Escudo de Nicaragua** (56 px) en login y barra lateral
- **Adaptado a celulares**: tarjetas en vez de tablas
- **Tema claro/oscuro** y componentes propios (sin dependencias frágiles)

---

## 🔌 Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/auth/login` | Inicio de sesión (devuelve JWT) |
| `GET` | `/api/auth/me` | Usuario actual |
| `GET` | `/api/salud` | Health check |
| `CRUD` | `/api/alumnos` | Alumnos |
| `CRUD` | `/api/notas` | Notas |
| `CRUD` | `/api/asistencias` | Asistencias |
| `CRUD` | `/api/tareas` | Tareas |
| `CRUD` | `/api/materiales` | Materiales |
| `POST` | `/api/archivos/subir` | Sube un archivo |
| `CRUD` | `/api/matriculas` | Matrículas |
| `CRUD` | `/api/justificaciones-ausencia` | Justificaciones |
| `CRUD` | `/api/reuniones` | Reuniones |
| `CRUD` | `/api/grados` | Grados |

---

## ✅ Verificaciones

- `npx tsc --noEmit` → **0 errores**
- `mvn package` → **BUILD SUCCESS**
- Carga de 24 tablas con 305 registros
- Login verificado para los 3 roles

---

## 📄 Documentos relacionados

| Documento | Contenido |
|---|---|
| `INICIAR-COLEGIO.bat` | Arranque de los 3 servicios |
| `DETENER-COLEGIO.bat` | Detener todo |

---

© 2026 Colegio Otto de la Rocha
