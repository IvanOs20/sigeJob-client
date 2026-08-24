import { useEffect, useMemo, useRef, useState } from 'react'
import { Send, Bell, Search, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import client from '../../api/axios.js'

const bgColors = ['bg-amber-100 text-amber-700', 'bg-emerald-100 text-emerald-700', 'bg-sky-100 text-sky-700', 'bg-pink-100 text-pink-700']

const obtenerIdDocente = () => {
  try {
    const token = localStorage.getItem('token')
    if (token) {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(window.atob(base64))
      console.log('>> [DEBUG TOKEN PAYLOAD]:', payload)

      const id = payload.id_perfil ?? payload.id_docente ?? payload.id_usuario ?? payload.idPerfil ?? payload.idDocente
      if (id) return Number(id)
    }
  } catch (error) {
    console.warn('No se pudo decodificar el token:', error)
  }

  try {
    const rawUser = localStorage.getItem('user') || localStorage.getItem('usuario') || localStorage.getItem('auth')
    if (rawUser) {
      const parsed = JSON.parse(rawUser)
      const userData = parsed?.data || parsed?.user || parsed
      const id = userData?.id_docente ?? userData?.id_perfil ?? userData?.id_usuario ?? userData?.id
      if (id) return Number(id)
    }
  } catch (error) {
    console.warn('No se pudo parsear el usuario de localStorage:', error)
  }

  return null
}

const EnviarNotificacion = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [alumnos, setAlumnos] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAlumno, setSelectedAlumno] = useState(null)
  const dropdownRef = useRef(null)

  const [mensaje, setMensaje] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        const res = await client.get('/alumnos')
        setAlumnos(res.data || [])
        // autoselect from location.state
        const stateAlumno = location?.state?.alumno || null
        const stateId = location?.state?.id_alumno || location?.state?.id || null
        if (stateAlumno) {
          setSelectedAlumno(stateAlumno)
          setSearchTerm(`${stateAlumno.nombre || ''} ${stateAlumno.apellidos || ''}`.trim())
        } else if (stateId) {
          const found = (res.data || []).find(a => String(a.id_alumno || a.id) === String(stateId))
          if (found) {
            setSelectedAlumno(found)
            setSearchTerm(`${found.nombre || ''} ${found.apellidos || ''}`.trim())
          }
        }
      } catch (err) {
        console.error('Error cargando alumnos', err)
        setAlumnos([])
      }
    }

    fetchAlumnos()
  }, [location])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = useMemo(() => {
    if (!searchTerm) return alumnos
    return alumnos.filter((a) => `${a.nombre || ''} ${a.apellidos || ''}`.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [alumnos, searchTerm])

  const handleSelect = (a) => {
    setSelectedAlumno(a)
    setSearchTerm(`${a.nombre || ''} ${a.apellidos || ''}`.trim())
    setIsOpen(false)
  }

  const clearSelected = () => {
    setSelectedAlumno(null)
    setSearchTerm('')
  }

  const canSubmit = Boolean(selectedAlumno && mensaje.trim())

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const idDocenteNum = obtenerIdDocente()
    const idAlumno = selectedAlumno?.id_alumno || selectedAlumno?.id
    const idAlumnoNum = Number(idAlumno)

    if (!Number.isInteger(idDocenteNum) || idDocenteNum <= 0) {
      setErrorMessage('No se pudo obtener la sesión del docente. Por favor, cierra sesión y vuelve a ingresar.')
      return
    }

    if (!Number.isInteger(idAlumnoNum) || idAlumnoNum <= 0) {
      setErrorMessage('Por favor selecciona un alumno válido.')
      return
    }

    if (!mensaje || !mensaje.trim()) {
      setErrorMessage('El mensaje de la notificación no puede estar vacío.')
      return
    }

    const payload = {
      id_docente: idDocenteNum,
      id_alumno: idAlumnoNum,
      mensaje: mensaje.trim(),
    }

    console.log('>> [DEBUG] Enviando payload con id_docente:', payload)
    setSubmitting(true)
    try {
      const response = await client.post('/notificaciones', payload)
      console.log('>> [DEBUG] Respuesta exitosa:', response.data)
      setSuccessMessage('Notificación enviada correctamente')
      setMensaje('')
      setSelectedAlumno(null)
      setSearchTerm('')
      navigate('/docente/notificaciones')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.log('>> [DEBUG] Validación del servidor:', err.response?.data)
      console.error('Error enviando notificación:', err)
      const errorData = err.response?.data
      const message = typeof errorData === 'string'
        ? errorData
        : errorData?.message || errorData?.error || JSON.stringify(errorData) || 'Error 400: Datos inválidos al enviar la notificación.'
      setErrorMessage(message)
      setTimeout(() => setErrorMessage(''), 4000)
    } finally {
      setSubmitting(false)
    }
  }

  const getInitials = (a) => {
    const name = `${a?.nombre || ''} ${a?.apellidos || ''}`.trim()
    return name.split(' ').filter(Boolean).slice(0,2).map(n => n[0]).join('').toUpperCase() || 'AL'
  }

  return (
    <div className="min-h-screen bg-slate-50" translate="no">
      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6"><span>Enviar Notificación</span></h1>

        <div className="max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-blue-50 p-3">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900"><span>Redactar Aviso a Tutor</span></h2>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2"><span>Seleccionar Alumno destinatario</span></label>
              <div ref={dropdownRef} className="relative">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onFocus={() => setIsOpen(true)}
                    onChange={(e) => { setSearchTerm(e.target.value); setSelectedAlumno(null); setIsOpen(true) }}
                    placeholder="Buscar alumno..."
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-800 shadow-sm outline-none"
                  />
                  {searchTerm && (
                    <button type="button" onClick={clearSelected} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {isOpen && filtered.length > 0 && (
                  <div className="absolute left-0 top-full mt-2 w-full rounded-2xl bg-white shadow-lg border z-10">
                    <div className="max-h-56 overflow-auto p-2">
                      {filtered.map((a, idx) => (
                        <button key={a.id_alumno || a.id || idx} type="button" onClick={() => handleSelect(a)} className="w-full text-left rounded-xl px-3 py-2 hover:bg-slate-50 flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-semibold ${bgColors[idx % bgColors.length]}`}>
                            <span>{getInitials(a)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800"><span>{`${a.nombre || ''} ${a.apellidos || ''}`.trim()}</span></p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2"><span>Mensaje / Observaciones</span></label>
              <textarea rows={4} value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="Escribe el detalle del recado para el tutor..." className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-800 shadow-sm outline-none" />
            </div>

            <div>
              <button type="submit" disabled={!canSubmit || submitting} className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                <span>Enviar Reporte al Tutor</span>
              </button>
            </div>
          </form>
        </div>

        {successMessage && (
          <div className="fixed right-6 top-6 z-50 rounded-xl bg-emerald-600 px-4 py-3 text-white shadow-lg">
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /><span>{successMessage}</span></div>
          </div>
        )}

        {errorMessage && (
          <div className="fixed right-6 top-6 z-50 rounded-xl bg-rose-600 px-4 py-3 text-white shadow-lg">
            <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4" /><span>{errorMessage}</span></div>
          </div>
        )}
      </main>
    </div>
  )
}

export default EnviarNotificacion
