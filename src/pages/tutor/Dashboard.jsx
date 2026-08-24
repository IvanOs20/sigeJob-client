import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, LogOut, Star, Bell, BookOpen, User, Phone, Loader2 } from 'lucide-react'
import client from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const obtenerIdTutorSesion = () => {
  try {
    const token = localStorage.getItem('token')
    if (token) {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replaceAll('-', '+').replaceAll('_', '/')
      const payload = JSON.parse(window.atob(base64))
      const id = payload.id_perfil ?? payload.id_tutor ?? payload.id_usuario ?? payload.idPerfil

      if (id) return Number(id)
    }
  } catch (error) {
    console.warn('Error al leer token para ID de tutor:', error)
  }

  try {
    const rawUser = localStorage.getItem('user')
    if (rawUser) {
      const storedUser = JSON.parse(rawUser)
      const id = storedUser.id_perfil ?? storedUser.id_tutor ?? storedUser.id_usuario ?? storedUser.id

      if (id) return Number(id)
    }
  } catch (error) {
    console.warn('Error al parsear user de localStorage:', error)
  }

  return null
}

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [tutor, setTutor] = useState(() => user?.data || user || null)
  const [selectedAlumno, setSelectedAlumno] = useState(null)
  const [grades, setGrades] = useState([])
  const [notifications, setNotifications] = useState([])
  const [activeTab, setActiveTab] = useState('calificaciones')
  const [loading, setLoading] = useState(true)
  const [loadingTutor, setLoadingTutor] = useState(true)
  const [loadingGrades, setLoadingGrades] = useState(false)
  const [loadingNotifications, setLoadingNotifications] = useState(false)

  const average = useMemo(() => {
    if (!grades?.length) return '0.00'
    const total = grades.reduce((sum, item) => sum + Number(item.calificacion || 0), 0)
    return (total / grades.length).toFixed(2)
  }, [grades])

  useEffect(() => {
    const fetchTutorAndChildren = async () => {
      setLoadingTutor(true)
      try {
        const alumnosResponse = await client.get('/alumnos')
        const alumnos = Array.isArray(alumnosResponse.data) ? alumnosResponse.data : []
        let tutorData = user?.data || {}
        const idTutor = obtenerIdTutorSesion()

        if (idTutor) {
          try {
            console.log(`>> [DEBUG] Consultando perfil para tutor ID: ${idTutor}`)
            const response = await client.get(`/tutores/${idTutor}`)
            const data = Array.isArray(response.data) ? response.data[0] : response.data
            tutorData = data || tutorData
          } catch (error) {
            console.warn('No se pudo cargar el perfil del tutor:', error)
          }
        } else {
          console.warn('No se encontró ID de tutor en la sesión activa.')
        }

        setTutor({ ...tutorData, tb_alumnos: alumnos })
        if (alumnos.length > 0) {
          setSelectedAlumno(alumnos[0])
        } else {
          setSelectedAlumno(null)
        }
      } catch (error) {
        console.error('Error cargando expediente del tutor:', error)
        setTutor({ ...(user?.data || {}), tb_alumnos: [] })
        setSelectedAlumno(null)
      } finally {
        setLoadingTutor(false)
      }
    }

    fetchTutorAndChildren()
  }, [user?.data])

  useEffect(() => {
    const studentId = selectedAlumno?.id_alumno || selectedAlumno?.id || null
    if (!studentId) {
      setGrades([])
      return
    }

    const fetchGrades = async () => {
      setLoadingGrades(true)
      try {
        const response = await client.get(`/alumnomateria/alumno/${studentId}`)
        setGrades(response.data || [])
      } catch (error) {
        console.error('Error al obtener calificaciones:', error)
        setGrades([])
      } finally {
        setLoadingGrades(false)
      }
    }

    fetchGrades()
  }, [selectedAlumno])

  // Sincronizado por alumno seleccionado
  useEffect(() => {
    const studentId = selectedAlumno?.id_alumno || selectedAlumno?.id || null
    if (!studentId) {
      setNotifications([])
      return
    }

    const fetchNotifications = async () => {
      setLoadingNotifications(true)
      try {
        const response = await client.get(`/notificaciones/alumno/${studentId}`)
        const sorted = (response.data || []).slice().sort((a, b) => {
          return new Date(b.fecha_envio) - new Date(a.fecha_envio)
        })
        setNotifications(sorted)
      } catch (error) {
        console.error('Error al obtener notificaciones:', error)
        setNotifications([])
      } finally {
        setLoadingNotifications(false)
      }
    }

    fetchNotifications()
  }, [selectedAlumno])

  useEffect(() => {
    const tutorHasNoStudents = !tutor?.tb_alumnos?.length
    if (!loadingTutor && !loadingNotifications && (tutorHasNoStudents || selectedAlumno !== null)) {
      setLoading(false)
    }
  }, [loadingTutor, loadingNotifications, tutor, selectedAlumno])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-blue-600">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="font-semibold text-slate-700">Cargando panel...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50" translate="no">
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 px-6 py-3.5 shadow-sm backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="inline-flex h-10 shrink-0 items-center rounded-2xl bg-slate-900 px-3 text-white shadow-sm sm:h-11 sm:px-4">
              <GraduationCap className="h-5 w-5" />
              <span className="ml-2 font-semibold">SigeJOD</span>
            </div>
            <span className="hidden rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700 sm:inline-flex">
              <span>PORTAL TUTORES</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:px-4"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
            <span className="inline sm:hidden">Salir</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-6 md:p-8">
        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white shadow-sm sm:h-16 sm:w-16">
                {tutor?.nombre && (tutor?.apellidos || tutor?.apellido) ? (
                  <span>{`${tutor.nombre[0]}${(tutor.apellidos || tutor.apellido)[0]}`.toUpperCase()}</span>
                ) : (
                  <User className="h-7 w-7 text-white" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-400 uppercase tracking-[0.24em]"><span>Hola,</span></p>
                <h1 className="text-xl font-semibold text-slate-900">
                  <span>{tutor ? `${tutor.nombre || ''} ${tutor.apellidos || tutor.apellido || ''}`.trim() || tutor.nombre_completo || 'Tutor' : 'Tutor'}</span>
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 shadow-sm">
                    <User className="mr-2 h-4 w-4 text-slate-500" />
                    <span className="max-w-[220px] truncate sm:max-w-none">{tutor?.email || tutor?.correo || 'Sin correo'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 shadow-sm">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                    <span>{tutor?.telefono || tutor?.telefono_tutor || 'Sin teléfono'}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Alumno Vinculado</p>
            <div className="flex flex-wrap gap-3">
              {tutor?.tb_alumnos?.map((alumno) => {
                const active = String(alumno.id_alumno || alumno.id) === String(selectedAlumno?.id_alumno || selectedAlumno?.id)
                return (
                  <button
                    key={alumno.id_alumno || alumno.id || `${alumno.nombre}-${alumno.apellidos}`}
                    type="button"
                    onClick={() => setSelectedAlumno(alumno)}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                      active
                        ? 'border-blue-600 bg-blue-50/60 shadow-sm text-slate-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                      <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                      {`${alumno.nombre || ''} ${alumno.apellidos || ''}`.trim()}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <div className="block lg:hidden mb-4 rounded-2xl bg-white p-3 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('calificaciones')}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                activeTab === 'calificaciones'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span><BookOpen className="mr-2 inline h-4 w-4 align-text-bottom" /> Calificaciones</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('avisos')}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                activeTab === 'avisos'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span><Bell className="mr-2 inline h-4 w-4 align-text-bottom" /> Avisos {notifications?.length ? `(${notifications.length})` : ''}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className={`lg:col-span-2 ${activeTab === 'avisos' ? 'hidden lg:block' : 'block'}`}>
            <div className="relative overflow-hidden rounded-3xl bg-blue-600 p-6 text-white shadow-lg">
              <Star className="pointer-events-none absolute right-4 top-4 h-12 w-12 text-white/20 sm:h-16 sm:w-16" />
              <div className="relative z-10 mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100"><span>PROMEDIO GENERAL DEL CICLO</span></p>
                <h2 className="mt-3 text-4xl font-extrabold tracking-tight"><span>{average}</span></h2>
                <p className="mt-2 text-sm text-blue-100"><span>Excelente estado académico</span></p>
                {selectedAlumno && (
                  <p className="mt-4 text-sm text-blue-100">
                    <span className="font-semibold">Alumno:</span>{' '}
                    <span>{`${selectedAlumno.nombre || ''} ${selectedAlumno.apellidos || ''}`.trim()}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2">
              {grades?.map((materia) => {
                const score = Number(materia.calificacion || 0)
                const progress = Math.min(100, Math.max(0, (score / 10) * 100))
                return (
                  <div key={materia.id || materia.id_materia || materia.nombre || `${materia.materia || 'materia'}-${score}`} className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          <span>{materia.tb_materia?.nombre_materia || materia.nombre_materia || materia.nombre || materia.materia || 'Materia'}</span>
                        </p>
                      </div>
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">{score.toFixed(2)}</span>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )
              })}
              {grades?.length === 0 && !loadingGrades && (
                <div className="rounded-2xl bg-white p-5 text-slate-500 shadow-sm">
                  <span>No hay calificaciones disponibles.</span>
                </div>
              )}
            </div>
          </div>

          <div className={`lg:col-span-1 ${activeTab === 'calificaciones' ? 'hidden lg:block' : 'block'}`}>
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900"><span>Avisos Recientes</span></p>
                </div>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                  <span>{notifications?.length || 0}</span>
                </span>
              </div>

              <div className="space-y-4">
                {notifications?.map((notice) => (
                  <div key={notice.id || notice.id_notificacion || notice.fecha_envio} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900"><span>{`${notice.tb_docente?.nombre || ''} ${notice.tb_docente?.apellidos || ''}`.trim()}</span></p>
                        <p className="text-xs text-slate-500"><span>
    {notice.fecha_envio && notice.hora_envio
      ? new Date(`${notice.fecha_envio}T${notice.hora_envio}`).toLocaleString([], {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      : new Date(notice.fecha_envio).toLocaleDateString()}
  </span></p>
                      </div>
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                        <span>Para: {notice.tb_alumno?.nombre || notice.tb_alumno?.nombre_alumno || 'Alumno'}</span>
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-slate-700"><span>{notice.mensaje || notice.contenido || 'Sin contenido disponible.'}</span></p>
                  </div>
                ))}

                {!notifications?.length && !loadingNotifications && (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    <span>No hay avisos recientes.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard