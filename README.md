# SigeJOD — Sistema de Gestión y Control Escolar (Frontend)

Plataforma web desarrollada como Single Page Application (SPA) para la administración académica, captura de evaluaciones, seguimiento de desempeño y comunicación en tiempo real entre administradores, docentes y tutores escolares.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
| :--- | :--- | :--- |
| **Core Framework** | React | `19.2.8` |
| **Build Tool & DevServer** | Vite | `8.2.0` |
| **Enrutamiento y RBAC** | React Router | `7.18.2` |
| **Estilos & UI** | Tailwind CSS (Vite Engine) | `4.3.3` |
| **Cliente HTTP** | Axios | `1.19.0` |
| **Iconografía** | Lucide React | `1.30.0` |
| **Code Quality / Linter** | Oxlint | `1.75.0` |

---

## Arquitectura del Proyecto

Estructura modular del frontend basada en separación de componentes por rol, gestión de contexto global y vistas de autenticación:

```text
frontend-v1/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── api/
│   │   └── axios.js                  # Instancia global de Axios y configuración de peticiones
│   ├── components/
│   │   ├── admin/                    # Layouts, modales y drawers de administración
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── BajaMateriasDrawer.jsx
│   │   │   ├── EditarAlumnoDrawer.jsx
│   │   │   ├── EditarGrupoDrawer.jsx
│   │   │   ├── EditarUsuarioDrawer.jsx
│   │   │   ├── InscribirMateriasDrawer.jsx
│   │   │   ├── MateriaModal.jsx
│   │   │   └── RegistrarUsuario.jsx
│   │   └── docente/                  # Layout del portal docente
│   │       └── DocenteLayout.jsx
│   ├── context/
│   │   └── AuthContext.jsx           # Proveedor de estado global de sesión y credenciales
│   ├── pages/
│   │   ├── admin/                    # Vistas del panel de administración
│   │   │   ├── AltasMaterias.jsx
│   │   │   ├── Alumnos.jsx
│   │   │   ├── GestionUsuarios.jsx
│   │   │   ├── Grupos.jsx
│   │   │   ├── Materias.jsx
│   │   │   └── MiCuenta.jsx
│   │   ├── docente/                  # Vistas del portal docente
│   │   │   ├── CapturaCalificaciones.jsx
│   │   │   ├── EnviarNotificacion.jsx
│   │   │   ├── HistorialAlumno.jsx
│   │   │   ├── NotificacionesEnviadas.jsx
│   │   │   └── PerfilDocente.jsx
│   │   ├── tutor/                    # Vista del portal de tutores
│   │   │   └── Dashboard.jsx
│   │   ├── ActivateAccount.jsx       # Vistas de autenticación y acceso
│   │   ├── ForgotPassword.jsx
│   │   ├── Login.jsx
│   │   └── ResetPassword.jsx
│   ├── App.jsx                       # Enrutador principal y validación de accesos por rol
│   ├── index.css                     # Configuración de estilos globales con Tailwind CSS
│   └── main.jsx                      # Punto de entrada de React 19
├── .gitignore
├── .oxlintrc.json
├── index.html
├── package.json
├── README.md
└── vite.config.js


## Módulos y Funcionalidades por Rol

### 1. Panel de Administración
* **1.1 Gestión Integral de Usuarios:** Alta, consulta y edición de cuentas con roles diferenciados (Docentes y Tutores).
* **1.2 Control Escolar y Grupos:** Registro de grados/grupos, asignación de docentes titulares en tiempo real y vinculación relacional de estudiantes.
* **1.3 Control de Asignaturas y Altas:** Creación de materias y asignación curricular por grupo escolar.
* **1.4 Padrón de Alumnos:** Registro de matrícula con asociación directa a su tutor responsable y aula asignada.

### 2. Portal Docente
* **2.1 Captura y Modificación de Calificaciones:** Registro de evaluaciones por periodo escolar y materia.
* **2.2 Historial Académico por Alumno:** Visualización del progreso individual y listado de materias acreditadas.
* **2.3 Centro de Avisos y Notificaciones:** Envío de mensajes dirigidos a tutores específicos con selección de alumnos enlazados.
* **2.4 Perfil Profesional:** Consulta dinámica del expediente y datos de contacto del docente titular.

### 3. Portal de Tutores (Mobile-First)
* **3.1 Gestión Multi-Alumno:** Alternancia instantánea entre múltiples hijos o estudiantes vinculados a un mismo tutor.
* **3.2 Métrica de Desempeño:** Cálculo de promedio general del ciclo en tiempo real con barras de progreso visuales por materia.
* **3.3 Bandeja de Avisos Recientes:** Recepción contextual y cronológica de avisos emitidos por los profesores de cada alumno.
* **3.4 Diseño Responsivo Adaptativo:** Cabecera fija (`sticky navbar`), tipografía optimizada y contenedores fluidos para dispositivos móviles y escritorio.

---

## Seguridad y Control de Acceso (RBAC)

* **Protección de Rutas en React Router v7:** El componente `ProtectedRoute` intercepta cualquier intento de navegación manual por URL, expulsando sesiones no autorizadas o redirigiendo según el rol (`admin`, `docente`, `tutor`).
* **Manejo de Sesiones Stateless:** Almacenamiento del token JWT y normalización de credenciales con lectura directa desde payload y `localStorage`.
* **Interceptores de Peticiones:** Inyección automática de cabeceras de autorización (`x-access-token`) y captura centralizada de respuestas con códigos de error HTTP `401` y `403`.

---

## Instalación y Configuración Local

### Prerrequisitos
* Node.js v18.0.0 o superior
* Gestor de paquetes `npm` o `pnpm`
* Servidor Backend de SigeJOD activo (Node.js / Express + PostgreSQL)

### 1. Clonar el repositorio
```bash
git clone [https://github.com/tu-usuario/sigejod-frontend.git](https://github.com/tu-usuario/sigejod-frontend.git)
cd sigejod-frontend

2. Instalar dependencias
npm install

3. Configurar variables de entorno
Crea un archivo .env en la raíz del proyecto:

Fragmento de código
VITE_API_URL=http://localhost:3000/api

4. Iniciar en entorno de desarrollo
npm run dev
La aplicación iniciará en http://localhost:5173.

---

Scripts Disponibles
npm run dev: Inicia el servidor de desarrollo local con Hot Module Replacement (HMR).

npm run build: Compila y optimiza el bundle para producción en la carpeta dist/.

npm run preview: Levanta un servidor local para previsualizar el build de producción.

npm run lint: Ejecuta el análisis estático de código mediante oxlint.

---

Consideraciones para Despliegue en Producción
Configurar la variable VITE_API_URL apuntando a la URL pública con HTTPS de la API en producción.

Servir los archivos estáticos generados en dist/ asegurando la redirección de rutas SPA (/* -> index.html) en el servidor web (Nginx, Vercel, Hostinger o Netlify).