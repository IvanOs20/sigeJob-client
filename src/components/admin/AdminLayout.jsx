import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Building2,
  GraduationCap,
  ClipboardCheck,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navigationItems = [
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { to: '/admin/materias', label: 'Materias', icon: BookOpen },
  { to: '/admin/grupos', label: 'Grupos', icon: Building2 },
  { to: '/admin/alumnos', label: 'Alumnos', icon: GraduationCap },
  { to: '/admin/altas-materias', label: 'Altas Materias', icon: ClipboardCheck },
  { to: '/admin/cuenta', label: 'Mi Cuenta', icon: User },
];

const sectionTitles = {
  '/admin': 'Panel de Control',
  '/admin/usuarios': 'Gestión de Usuarios',
  '/admin/materias': 'Materias',
  '/admin/grupos': 'Grupos',
  '/admin/alumnos': 'Alumnos',
  '/admin/altas-materias': 'Altas Materias',
  '/admin/cuenta': 'Mi Cuenta',
};

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const currentSection = sectionTitles[location.pathname] || 'Panel de Control';
  const adminInitial = user?.data?.nombre?.charAt(0)?.toUpperCase() || 'A';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.clear();
    logout();
    navigate('/login', { replace: true });
  };

  const renderSidebarNav = (onNavigate = () => {}) => (
    <nav className="mt-8 space-y-2">
      {navigationItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/admin/usuarios'}
          onClick={onNavigate}
          className={({ isActive }) =>
            isActive
              ? 'flex items-center gap-3 rounded-2xl bg-blue-600 px-4 py-3 font-medium text-white shadow-sm'
              : 'flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-white'
          }
        >
          <span className="flex items-center gap-3">
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50" translate="no">
      <aside className="hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-slate-800 bg-slate-900 p-4 z-20 lg:flex">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold leading-tight text-white">SigeJOD</span>
              <span className="text-xs text-slate-400">Admin Panel</span>
            </div>
          </div>

          {renderSidebarNav()}
        </div>

        <div className="border-t border-slate-800/80 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <header className="z-10 shrink-0 border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex h-full items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900">{currentSection}</span>
                <span className="text-xs text-slate-400">Panel de Control Escolar</span>
              </div>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white shadow-sm">
              <span>{adminInitial}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {isMobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex min-h-screen w-72 flex-col justify-between bg-slate-900 p-5 transition-transform duration-300 lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold leading-tight text-white">SigeJOD</span>
                <span className="text-xs text-slate-400">Admin Panel</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-800/60 text-slate-200"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {renderSidebarNav(() => setIsMobileOpen(false))}
        </div>

        <div className="border-t border-slate-800/80 p-4">
          <button
            type="button"
            onClick={() => {
              setIsMobileOpen(false);
              handleLogout();
            }}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default AdminLayout;
