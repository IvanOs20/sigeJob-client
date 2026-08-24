import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BookOpen, BarChart2, UserSearch, Send, Bell, User, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navigationItems = [
  { to: '/docente/calificaciones', label: 'Captura de Calificaciones', icon: BarChart2 },
  { to: '/docente/historial', label: 'Historial por Alumno', icon: UserSearch },
  { to: '/docente/enviar-notificacion', label: 'Enviar Notificación', icon: Send },
  { to: '/docente/notificaciones', label: 'Notificaciones Enviadas', icon: Bell },
  { to: '/docente/perfil', label: 'Mi Perfil', icon: User },
]

const DocenteLayout = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50" translate="no">
      <div className="flex h-screen w-full">
        <aside className="hidden h-screen w-64 shrink-0 flex-col justify-between overflow-y-auto bg-[#0B132B] p-5 lg:flex">
          <div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold leading-tight text-white">SigeJOD</span>
                <span className="text-xs font-medium text-slate-400">Portal Docente</span>
              </div>
            </div>

            <div className="mt-8">
              <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                <span>Módulos</span>
              </p>
              <nav className="space-y-2">
                {navigationItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/docente/calificaciones'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-sm'
                          : 'text-slate-400 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </button>
        </aside>

        <div className="flex h-screen flex-1 flex-col overflow-hidden">
          <header className="border-b border-slate-200 bg-white px-4 py-2 lg:px-8 lg:py-3">
            <div className="flex items-center lg:justify-end">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-slate-50/60 p-4 lg:p-8">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 cursor-default bg-slate-950/60 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between bg-[#0B132B] p-5 transition-transform duration-300 lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold leading-tight text-white">SigeJOD</span>
                <span className="text-xs font-medium text-slate-400">Portal Docente</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-8">
            <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
              <span>Módulos</span>
            </p>
            <nav className="space-y-2">
              {navigationItems.map(({ to, label, icon: Icon }) => {
                const isNotifications = to === '/docente/notificaciones'
                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/docente/calificaciones'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center rounded-xl px-3 py-2.5 text-sm transition ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-sm'
                          : 'text-slate-400 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </span>
                  </NavLink>
                )
              })}
            </nav>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsMobileMenuOpen(false)
            handleLogout()
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar Sesión</span>
        </button>
      </aside>
    </div>
  )
}

export default DocenteLayout
