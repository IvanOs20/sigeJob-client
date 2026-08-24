import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import client from '../api/axios'

const ActivateAccount = () => {
  const { token: pathToken } = useParams()
  const [searchParams] = useSearchParams()
  const token = (pathToken || searchParams.get('token') || '')?.trim()

  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const timerRef = useRef(null)

  useEffect(() => {
    if (!token) {
      setErrorMessage('Enlace o token de activación no válido o ausente.')
    }
  }, [token])

  useEffect(() => {
    if (!successMessage) return undefined

    timerRef.current = window.setTimeout(() => {
      navigate('/login')
    }, 2000)

    return () => window.clearTimeout(timerRef.current)
  }, [navigate, successMessage])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccessMessage('')
    setErrorMessage('')

    if (!token) {
      setErrorMessage('Enlace o token de activación no válido o ausente.')
      return
    }

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      const res = await client.post('/auth/activar-cuenta', {
        token,
        nuevaPassword: password,
      })

      setSuccessMessage(res.data?.message || 'Cuenta activada con éxito. Redirigiendo al inicio de sesión...')
      setPassword('')
    } catch (error) {
      const msg = typeof error.response?.data?.message === 'string'
        ? error.response.data.message
        : 'Token inválido o expirado. Es posible que la cuenta ya esté activa.'
      setErrorMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  const disabled = loading || !token

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div translate="no" className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-lg shadow-blue-200/70">
              <span className="text-xl font-bold">E</span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400"><span>ESCUELA</span></p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl"><span>Activar Tu Cuenta</span></h1>
            <p className="mt-2 text-sm text-slate-500"><span>Bienvenido al sistema. Define la contraseña que utilizarás para ingresar.</span></p>
          </div>

          {successMessage && (
            <div key="alert-success" className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <span>{String(successMessage)}</span>
            </div>
          )}

          {errorMessage && (
            <div key="alert-error" className="mb-6 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{String(errorMessage)}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="activate-password" className="block text-sm font-medium text-slate-700"><span>Nueva Contraseña</span></label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
                <Lock className="h-5 w-5 text-slate-400" />
                <input
                  id="activate-password"
                  type={showPassword ? 'text' : 'password'}
                  disabled={disabled}
                  value={password}
                  onChange={(ev) => { setPassword(ev.target.value); if (errorMessage) setErrorMessage('') }}
                  placeholder="Crea tu contraseña segura"
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-slate-400 transition hover:text-slate-700"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={disabled}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /><span>Activando...</span></span>
              ) : (
                <span>Activar Cuenta</span>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600"><Link to="/login" className="font-medium text-slate-600 transition hover:text-slate-900"><span>← Volver al Iniciar Sesión</span></Link></p>
        </div>
      </div>
    </div>
  )
}

export default ActivateAccount
