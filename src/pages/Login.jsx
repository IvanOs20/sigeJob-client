import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import client from '../api/axios'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  // Estados del Formulario Principal
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setLoading(true)

    try {
      const response = await client.post('/auth/login', {
        email: email.trim(),
        password,
      })

      login(response.data)

      const role = (response.data.rol || response.data.role || '').toLowerCase()

      if (role === 'admin') {
        navigate('/admin')
      } else if (role === 'docente') {
        navigate('/docente')
      } else if (role === 'tutor') {
        navigate('/tutor')
      } else {
        navigate('/')
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          'No se pudo iniciar sesión. Verifica tus credenciales o el estado de tu cuenta.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div translate="no" className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-10">
          
          {/* Encabezado */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-lg shadow-blue-200/70">
              <span className="text-xl font-bold">E</span>
            </div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400"><span>SIGE JOD</span></p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl"><span>Sistema Escolar</span></h1>
              <p className="mt-2 text-sm text-slate-500"><span>Ingresa tus credenciales para acceder</span></p>
          </div>

          {errorMessage && (
            <div key="error-banner" className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 animate-fadeIn">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                <span className="font-medium">{String(errorMessage)}</span>
              </div>
            </div>
          )}

          {/* Formulario Login */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700" htmlFor="email">
                <span>Correo Electrónico</span>
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
                <Mail className="h-5 w-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  disabled={loading}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errorMessage) setErrorMessage('')
                  }}
                  placeholder="ejemplo@correo.com"
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                <span>Contraseña</span>
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
                <Lock className="h-5 w-5 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  disabled={loading}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errorMessage) setErrorMessage('')
                  }}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-slate-400 transition hover:text-slate-700"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-blue-600 transition hover:text-blue-800 hover:underline"
              >
                <span>¿Olvidaste tu contraseña?</span>
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Iniciando sesión...</span>
                </span>
              ) : (
                <span>Iniciar Sesión</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
