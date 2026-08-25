import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ActivateAccount from './pages/ActivateAccount';
import Dashboard from './pages/tutor/Dashboard';
import DocenteLayout from './components/docente/DocenteLayout';
import AdminLayout from './components/admin/AdminLayout';
import CapturaCalificaciones from './pages/docente/CapturaCalificaciones';
import HistorialAlumno from './pages/docente/HistorialAlumno';
import EnviarNotificacion from './pages/docente/EnviarNotificacion';
import NotificacionesEnviadas from './pages/docente/NotificacionesEnviadas';
import PerfilDocente from './pages/docente/PerfilDocente';
import GestionUsuarios from './pages/admin/GestionUsuarios';
import Materias from './pages/admin/Materias';
import Grupos from './pages/admin/Grupos';
import Alumnos from './pages/admin/Alumnos';
import AltasMaterias from './pages/admin/AltasMaterias';
import MiCuenta from './pages/admin/MiCuenta';

export const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const rawUser = localStorage.getItem('user');
  let user = null;

  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    console.warn('No se pudo leer el usuario de la sesión:', error);
  }

  if (!token || !user) {
    return <Navigate replace to="/login" />;
  }

  const sessionUser = user.data || user;
  const userRole = (
    sessionUser.rol ||
    sessionUser.role ||
    user.rol ||
    user.role ||
    localStorage.getItem('rol') ||
    ''
  ).toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map((role) => role.toLowerCase());

  if (!normalizedAllowedRoles.includes(userRole)) {
    return <Navigate replace to="/login" />;
  }

  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        {/* Rutas de activación compatibles */}
        <Route path="/activate-account/:token" element={<ActivateAccount />} />
        <Route path="/activate-account" element={<ActivateAccount />} />
        <Route path="/activar-cuenta/:token" element={<ActivateAccount />} />
        <Route path="/activar-cuenta" element={<ActivateAccount />} />

        <Route element={<ProtectedRoute allowedRoles={['tutor']} />}>
          <Route path="/tutor" element={<Dashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['docente']} />}>
          <Route path="/docente" element={<DocenteLayout />}>
            <Route index element={<div className="rounded-2xl bg-white p-8 shadow-sm"><span className="text-slate-700">Selecciona un módulo del docente</span></div>} />
            <Route path="calificaciones" element={<CapturaCalificaciones />} />
            <Route path="historial" element={<HistorialAlumno />} />
            <Route path="enviar-notificacion" element={<EnviarNotificacion />} />
            <Route path="notificaciones" element={<NotificacionesEnviadas />} />
            <Route path="perfil" element={<PerfilDocente />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin', 'administrador']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/usuarios" replace />} />
            <Route path="usuarios" element={<GestionUsuarios />} />
            <Route path="materias" element={<Materias />} />
            <Route path="grupos" element={<Grupos />} />
            <Route path="alumnos" element={<Alumnos />} />
            <Route path="altas-materias" element={<AltasMaterias />} />
            <Route path="cuenta" element={<MiCuenta />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;