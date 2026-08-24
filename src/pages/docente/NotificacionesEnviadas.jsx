import { useEffect, useState } from 'react'
import { Trash2, Clock, Loader2, AlertCircle, Check } from 'lucide-react'
import client from '../../api/axios.js'

const monthsShort = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const formatDateTime = (fecha, hora) => {
  if (!fecha) return ''
  try {
    const date = new Date(`${fecha}T${hora || '00:00:00'}`)
    const day = String(date.getDate()).padStart(2, '0')
    const mon = monthsShort[date.getMonth()] || ''
    const year = date.getFullYear()
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    return `${day}/${mon}/${year} - ${hh}:${mm}`
  } catch (e) {
    return `${fecha} ${hora || ''}`
  }
}

const NotificacionesEnviadas = () => {
  const [notificaciones, setNotificaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const cargarNotificaciones = async () => {
    setLoading(true)
    try {
      const res = await client.get('/notificaciones')
      setNotificaciones(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.error('Error al cargar notificaciones:', error)
      setNotificaciones([])
      setError('Error cargando notificaciones')
      setTimeout(() => setError(''), 4000)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarNotificaciones()
  }, [])

  const handleEliminarNotificacion = async (idNotificacion) => {
    if (!idNotificacion) return
    setDeletingId(idNotificacion)
    try {
      await client.delete(`/notificaciones/${idNotificacion}`)
      setNotificaciones((prev) => prev.filter((n) => n.id_notificacion !== idNotificacion))
      setSuccess('Notificación eliminada')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error al eliminar notificación:', err)
      setError('Error al eliminar notificación')
      setTimeout(() => setError(''), 4000)
    } finally {
      setDeletingId(null)
    }
  }

  const total = notificaciones.length

  return (
    <div className="min-h-screen bg-slate-50" translate="no">
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900"><span>Notificaciones Enviadas</span></h1>
          <p className="mt-2 text-sm text-slate-500"><span>Historial de Notificaciones y Reportes Enviados · {total} registros</span></p>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-6 shadow-sm text-slate-600"><Loader2 className="h-5 w-5 animate-spin inline mr-2" /><span>Cargando notificaciones...</span></div>
        ) : (
          <div>
            {/* Desktop table */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="w-full">
                  <table className="w-full table-auto">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="w-1/4 p-4 text-left text-xs font-semibold text-slate-500"><span>ALUMNO / TÍTULO</span></th>
                        <th className="w-1/2 p-4 text-left text-xs font-semibold text-slate-500"><span>EXTRACTO DEL MENSAJE</span></th>
                        <th className="w-1/6 p-4 text-left text-xs font-semibold text-slate-500"><span>FECHA Y HORA</span></th>
                        <th className="px-6 py-4 text-right pr-8 shrink-0 text-xs font-semibold text-slate-500"><span>ACCIÓN</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {notificaciones.map((n) => {
                        const id = n.id_notificacion
                        const alumnoNombre = n.tb_alumno?.nombre ? `${n.tb_alumno.nombre} ${n.tb_alumno.apellidos || ''}` : (n.nombre_alumno || n.alumno || '')
                        const extract = n.mensaje || n.contenido || ''
                        return (
                          <tr key={id} className="border-t">
                            <td className="p-4 align-top">
                              <div className="mb-2 inline-flex items-center gap-2">
                                <span className="rounded-full bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-700"><span>Para: {alumnoNombre}</span></span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800"><span>{n.titulo || n.asunto || ''}</span></p>
                              </div>
                            </td>
                            <td className="p-4 align-top text-sm text-slate-600"><span>{extract}</span></td>
                            <td className="p-4 align-top text-sm text-slate-600">
                              <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                                <Clock className="h-4 w-4" />
                                <span>{formatDateTime(n.fecha_envio, n.hora_envio)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right pr-8 shrink-0">
                              <div className="flex justify-end pr-2">
                                <button type="button" onClick={() => handleEliminarNotificacion(id)} className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100">
                                  {deletingId === id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                  <span>Eliminar</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="block lg:hidden">
              {notificaciones.map((n) => {
                const id = n.id_notificacion
                const alumnoNombre = n.tb_alumno?.nombre ? `${n.tb_alumno.nombre} ${n.tb_alumno.apellidos || ''}` : (n.nombre_alumno || n.alumno || '')
                return (
                  <div key={id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2">
                        <span className="rounded-full bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-700"><span>Para: {alumnoNombre}</span></span>
                      </div>
                      <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="h-4 w-4" />
                        <span>{formatDateTime(n.fecha_envio, n.hora_envio)}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900"><span>{n.titulo || n.asunto || ''}</span></p>
                      <p className="mt-2 text-sm text-slate-600"><span>{n.mensaje || n.contenido || ''}</span></p>
                    </div>

                    <div className="flex justify-end">
                      <button type="button" onClick={() => handleEliminarNotificacion(id)} className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100">
                        {deletingId === id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {error && (
          <div className="fixed right-6 top-6 z-50 rounded-xl bg-rose-600 px-4 py-3 text-white shadow-lg">
            <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4" /><span>{error}</span></div>
          </div>
        )}

        {success && (
          <div className="fixed right-6 top-6 z-50 rounded-xl bg-emerald-600 px-4 py-3 text-white shadow-lg">
            <div className="flex items-center gap-2"><Check className="h-4 w-4" /><span>{success}</span></div>
          </div>
        )}
      </main>
    </div>
  )
}

export default NotificacionesEnviadas
