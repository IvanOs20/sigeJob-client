# SIGEJOD Client - Interfaz de Gestión Escolar

Cliente web de SIGEJOD (Sistema de Gestión y Control Escolar), construido como una Single Page Application (SPA) para administrar usuarios, grupos, materias, alumnos, calificaciones y notificaciones escolares.

La aplicación prioriza una experiencia de usuario clara y responsiva, navegación protegida por rol y consumo controlado de servicios REST mediante Axios. La interfaz utiliza controles HTML y estilos utilitarios para mantener formularios y flujos accesibles sin introducir una biblioteca externa de formularios o validación.

![React](https://img.shields.io/badge/React-19.2.8-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.2.0-646CFF?logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7.18.2-CA4245?logo=reactrouter&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.19.0-5A29E4?logo=axios&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-06B6D4?logo=tailwindcss&logoColor=white)

---

## Stack tecnológico

| Capa | Tecnología | Versión declarada | Propósito |
| --- | --- | ---: | --- |
| Framework de UI | React | `19.2.8` | Componentes, composición de vistas y estado local. |
| Renderizado | React DOM | `19.2.8` | Montaje de la aplicación en el navegador. |
| Build y servidor local | Vite | `8.2.0` | Desarrollo con HMR y generación del bundle de producción. |
| Enrutamiento | React Router DOM | `7.18.2` | Rutas públicas, layouts anidados, redirecciones y protección por rol. |
| Cliente HTTP | Axios | `1.19.0` | Comunicación con la API REST, credenciales e interceptores. |
| Estilos | Tailwind CSS + `@tailwindcss/vite` | `4.3.3` | Utilidades CSS y configuración de estilos integrada con Vite. |
| Iconos | Lucide React | `1.30.0` | Iconografía reutilizable en la interfaz. |
| Calidad de código | Oxlint | `1.75.0` | Análisis estático mediante `npm run lint`. |
| Transformación CSS | Autoprefixer / PostCSS | `10.5.4` / `8.5.26` | Compatibilidad y procesamiento de estilos. |

No se detectaron dependencias de `react-hook-form`, Formik, Yup, Zod, Material UI, Ant Design, Bootstrap, React Toastify o Sonner. La validación presente se implementa dentro de las vistas mediante lógica JavaScript y controles nativos.

---

## Arquitectura frontend

### Punto de entrada

`src/main.jsx` monta la aplicación con `React.StrictMode`, registra los estilos globales desde `src/index.css` y envuelve `App` con `AuthProvider`.

### Enrutamiento y RBAC

`src/App.jsx` centraliza el enrutamiento con `BrowserRouter`, `Routes` y `Route`. `ProtectedRoute` consume `useAuth()` y:

1. Muestra un indicador de carga mientras se resuelve la sesión.
2. Redirige a `/login` si no existe un usuario autenticado.
3. Normaliza el rol del usuario y compara contra los roles permitidos.
4. Renderiza el layout protegido mediante `Outlet` cuando la autorización es válida.

Los roles reconocidos por las rutas son:

- `admin` y `administrador`
- `docente`
- `tutor`

### Autenticación y estado global

`src/context/AuthContext.jsx` concentra el estado global de sesión:

- El access token se mantiene únicamente en memoria mediante `setAccessToken`; no se persiste en `localStorage` ni `sessionStorage`.
- El refresh token es administrado por el navegador mediante una cookie HttpOnly. Las solicitudes se realizan con `withCredentials: true`.
- Tras un login exitoso se guarda `hasSession=true` en `localStorage`. Esta bandera no es una credencial: únicamente indica al cliente que vale la pena intentar restaurar una sesión.
- Al iniciar la aplicación, si `hasSession` no existe, se evita la llamada innecesaria a `/auth/refresh`.
- Si existe la bandera, el contexto ejecuta un refresh silencioso y reconstruye el usuario a partir de la respuesta y del access token.
- Si el refresh falla, se limpian el usuario, el access token y la bandera `hasSession`.
- El logout limpia de forma inmediata el estado en memoria y solicita `POST /auth/logout`.

La seguridad real de la sesión depende de la cookie HttpOnly y del access token en memoria; `hasSession` no sustituye ningún mecanismo de autenticación o autorización.

### Cliente HTTP e interceptores

`src/api/axios.js` crea una instancia Axios con:

- `baseURL` proveniente de `VITE_API_URL`.
- Valor alternativo `https://api.sigejod.com/api` cuando la variable no está definida.
- `withCredentials: true` para enviar cookies de sesión.

El interceptor de solicitudes:

- Omite el access token en `/auth/login`, `/auth/refresh` y `/auth/logout`.
- Inyecta el access token en memoria mediante la cabecera `Authorization: Bearer <token>` para el resto de solicitudes autenticadas.

El interceptor de respuestas:

- Solo intenta renovar la sesión ante respuestas `401`.
- Excluye login, refresh y logout para evitar ciclos de renovación.
- Usa una promesa compartida (`refreshPromise`) para que varias solicitudes concurrentes reutilicen el mismo refresh.
- Marca la solicitud original para evitar reintentos infinitos.
- Propaga los errores que no corresponden a un refresh, incluidos `400` y `403`, hacia el `catch` de cada vista.

### Higiene del ciclo de vida y red

Las vistas que realizan cargas prolongadas o múltiples consultas usan `AbortController` y pasan su `signal` a Axios. Al desmontarse o cambiar el contexto de autenticación, las peticiones en vuelo se cancelan.

Los componentes filtran los errores de cancelación identificando `CanceledError` o `ERR_CANCELED`, evitando presentar errores falsos o generar ruido en la consola durante una navegación o logout:

- Paneles de administración: usuarios, grupos y alumnos.
- Perfil docente.
- Dashboard del tutor y sus consultas relacionadas.

---

## Estructura del proyecto

```text
frontend-v1/
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── logo.svg
├── src/
│   ├── api/
│   │   └── axios.js
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── BajaMateriasDrawer.jsx
│   │   │   ├── EditarAlumnoDrawer.jsx
│   │   │   ├── EditarGrupoDrawer.jsx
│   │   │   ├── EditarUsuarioDrawer.jsx
│   │   │   ├── InscribirMateriasDrawer.jsx
│   │   │   ├── MateriaModal.jsx
│   │   │   └── RegistrarUsuario.jsx
│   │   └── docente/
│   │       └── DocenteLayout.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── admin/
│   │   ├── docente/
│   │   ├── tutor/
│   │   ├── ActivateAccount.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Login.jsx
│   │   └── ResetPassword.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── package-lock.json
├── vercel.json
└── vite.config.js
```

Responsabilidades principales:

- `api/`: instancia Axios e interceptores.
- `context/`: estado global de autenticación.
- `components/`: layouts, drawers, modales y formularios reutilizables.
- `pages/`: pantallas públicas y módulos por rol.
- `public/`: recursos estáticos servidos directamente.
- `index.css`: estilos globales y directivas de Tailwind.

En la estructura actual no existen directorios independientes llamados `hooks`, `services/api`, `routes` o `assets`. La API está centralizada en `src/api/axios.js`, las rutas en `src/App.jsx` y los recursos gráficos en `public/`.

---

## Módulos y flujos

### Portal público y autenticación

| Ruta | Pantalla | Función |
| --- | --- | --- |
| `/login` | Login | Autenticación de usuarios y entrada al portal correspondiente. |
| `/forgot-password` | Recuperar contraseña | Solicitud de recuperación mediante correo electrónico. |
| `/reset-password/:token` | Restablecer contraseña | Cambio de contraseña mediante token de recuperación. |
| `/activate-account` | Activar cuenta | Activación con token recibido en la URL o query string. |
| `/activate-account/:token` | Activar cuenta | Variante con token como parámetro de ruta. |
| `/activar-cuenta` | Activar cuenta | Variante compatible en español. |
| `/activar-cuenta/:token` | Activar cuenta | Variante compatible en español con token en la ruta. |

### Administrador

Rutas bajo `/admin`:

- `/admin/usuarios`: gestión de docentes y tutores.
- `/admin/materias`: administración de materias.
- `/admin/grupos`: creación y asignación de grupos y docentes.
- `/admin/alumnos`: padrón de alumnos, grupos y tutores.
- `/admin/altas-materias`: inscripción de materias a alumnos.
- `/admin/cuenta`: información de la cuenta administrativa.

`AdminLayout` proporciona la navegación y el logout del portal. Los drawers y modales de `src/components/admin/` encapsulan operaciones de alta, edición, inscripción y baja.

### Docente

Rutas bajo `/docente`:

- `/docente/calificaciones`: captura y actualización de calificaciones.
- `/docente/historial`: consulta del historial académico de un alumno.
- `/docente/enviar-notificacion`: envío de avisos escolares.
- `/docente/notificaciones`: consulta y eliminación de notificaciones enviadas.
- `/docente/perfil`: consulta del perfil docente.

`DocenteLayout` funciona como layout protegido y contiene la navegación del portal.

### Tutor

Ruta `/tutor`:

- `Dashboard`: consulta de alumnos vinculados al tutor.
- Selección entre hijos o alumnos asociados.
- Consulta de calificaciones e historial por alumno.
- Consulta de notificaciones y avisos escolares.
- Indicadores de desempeño y estados diferenciados para ausencia de registros o falta de autorización.

### Alumno

No existe una ruta ni un portal independiente para un usuario con rol `alumno` en la implementación actual. Los datos académicos del alumno se consultan desde:

- El portal del tutor para los alumnos vinculados.
- El portal docente para los alumnos de sus grupos.
- El panel administrativo para la gestión escolar.

Esta distinción evita documentar como existente una pantalla que no está registrada en `src/App.jsx`.

---

## Variables de entorno

La aplicación lee `VITE_API_URL` en `src/api/axios.js`. No se incluye un archivo `.env` en el repositorio; debe configurarse localmente o en el proveedor de despliegue.

| Variable | Obligatoria | Desarrollo | Producción |
| --- | --- | --- | --- |
| `VITE_API_URL` | Recomendada | `http://localhost:3000/api` | `https://api.sigejod.com/api` |

Ejemplo local:

```dotenv
VITE_API_URL=http://localhost:3000/api
```

Si `VITE_API_URL` no está definida, el cliente usa como fallback:

```text
https://api.sigejod.com/api
```

No coloques secretos, access tokens ni credenciales privadas en variables `VITE_*`: Vite las expone en el bundle del navegador.

---

## Instalación y ejecución

### Prerrequisitos

- Node.js compatible con Vite 8. Se recomienda Node.js `22.12` o superior.
- npm, incluido con Node.js.
- API backend de SIGEJOD accesible desde la URL configurada.
- Configuración CORS del backend compatible con credenciales y el dominio del frontend.

### Instalación

```bash
git clone <URL_DEL_REPOSITORIO>
cd frontend-v1
npm install
```

Configura `VITE_API_URL` en un archivo `.env` local antes de iniciar la aplicación.

### Desarrollo

```bash
npm run dev
```

Vite mostrará en la terminal la URL local, normalmente `http://localhost:5173`.

### Validación y build

```bash
npm run lint
npm run build
npm run preview
```

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia Vite con servidor de desarrollo y HMR. |
| `npm run lint` | Ejecuta Oxlint. |
| `npm run build` | Genera el bundle optimizado en `dist/`. |
| `npm run preview` | Sirve localmente el build generado. |

---

## Despliegue en Vercel

El repositorio incluye `vercel.json` con una reescritura global:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

Esta regla permite que las rutas del cliente sean atendidas por la SPA en lugar de devolver un `404` al recargar una URL interna.

Pasos recomendados:

1. Importar el repositorio en Vercel.
2. Mantener `npm run build` como comando de compilación.
3. Usar `dist` como directorio de salida si Vercel solicita una configuración explícita.
4. Crear la variable de entorno `VITE_API_URL` para el entorno de producción:

   ```text
   https://api.sigejod.com/api
   ```

5. Verificar que la API permita el origen de Vercel y credenciales cross-origin.
6. Confirmar que la cookie de refresh tenga atributos compatibles con el dominio, HTTPS y la política `SameSite` requerida por la arquitectura del backend.

El access token nunca debe configurarse como variable de entorno ni almacenarse en el repositorio. La sesión se establece mediante el flujo de autenticación de la aplicación y la cookie HttpOnly administrada por el servidor.

---

## Consideraciones operativas

- La URL base debe incluir el prefijo `/api`, ya que las vistas llaman rutas como `/auth/login`, `/auth/refresh` y `/alumnos`.
- Los errores `400` y `403` se propagan a las vistas para que cada módulo muestre el mensaje contextual correspondiente.
- Los errores `401` pueden activar el mecanismo centralizado de refresh cuando la solicitud no es un endpoint de autenticación.
- Las cancelaciones de solicitudes durante desmontaje o logout son esperadas y no deben tratarse como fallos funcionales.
- Después de cambiar variables `VITE_*`, reinicia el servidor de desarrollo: Vite carga estas variables durante el arranque.
