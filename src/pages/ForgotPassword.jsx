import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import api from '../api/axios'

const emailRegex = /^\S+@\S+\.\S+$/

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSuccessMessage('')
    setErrorMessage('')

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setErrorMessage('Por favor ingresa tu correo electrónico.')
      return
    }

    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Ingresa un correo electrónico válido.')
      return
    }

    setLoading(true)

    try {
      const res = await api.post('/auth/forgot-password', { email: trimmedEmail })
      setSuccessMessage(res.data?.message || 'Correo enviado con éxito')
      setEmail('')
    } catch (error) {
      const errorMsg =
        typeof error.response?.data?.message === 'string'
          ? error.response.data.message
          : 'Error al procesar la solicitud'
      setErrorMessage(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div translate="no" className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-lg shadow-blue-200/70">
              <span className="text-xl font-bold">E</span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">SIGE JOD</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Recuperar Contraseña</h1>
            <p className="mt-2 text-sm text-slate-500">
              Ingresa tu correo electrónico registrado y te enviaremos un enlace para restablecer tu clave.
            </p>
          </div>

          {successMessage && (
            <div
              key="msg-success"
              className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
            >
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <span>{String(successMessage)}</span>
            </div>
          )}

          {errorMessage && (
            <div
              key="msg-error"
              className="mb-6 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{String(errorMessage)}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="forgot-email" className="block text-sm font-medium text-slate-700">
                Correo Electrónico
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
                <Mail className="h-5 w-5 text-slate-400" />
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="tudireccion@correo.com"
                  disabled={loading}
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Enviando...</span>
                </span>
              ) : (
                <span>Enviar Enlace de Recuperación</span>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            <Link to="/login" className="font-medium text-slate-600 transition hover:text-slate-900">
              ← Volver al Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
