import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, Check, Loader2, Save, AlertCircle } from 'lucide-react'
import client from '../../api/axios.js'

const bgColors = ['bg-amber-100 text-amber-700', 'bg-emerald-100 text-emerald-700', 'bg-sky-100 text-sky-700', 'bg-pink-100 text-pink-700']

const CapturaCalificaciones = () => {
  const [materias, setMaterias] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedMateria, setSelectedMateria] = useState(null)
  const dropdownRef = useRef(null)

  const [alumnos, setAlumnos] = useState([])
  const [grades, setGrades] = useState({})
  const [originalGrades, setOriginalGrades] = useState({})

  const [loadingMaterias, setLoadingMaterias] = useState(false)
  const [loadingAlumnos, setLoadingAlumnos] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [mensajeInfo, setMensajeInfo] = useState('')

  useEffect(() => {
    const fetchMaterias = async () => {
      setLoadingMaterias(true)
      try {
        const res = await client.get('/materias')
        setMaterias(res.data || [])
      } catch (err) {
        console.error('Error cargando materias', err)
        setMaterias([])
      } finally {
        setLoadingMaterias(false)
      }
    }

    fetchMaterias()
  }, [])

  const cargarAlumnosPorMateria = async (idMateria) => {
    if (!idMateria) return

    setLoadingAlumnos(true)
    setMensajeInfo('')

    try {
      const res = await client.get(`/alumnomateria/materia/${idMateria}`)
      const data = Array.isArray(res.data) ? res.data : []
      setAlumnos(data)

      const orig = {}
      const initial = {}
      data.forEach((item) => {
        const idAlumno = item.id_alumno || item.id || (item.tb_alumno && (item.tb_alumno.id_alumno || item.tb_alumno.id))
        const cal = item.calificacion ?? item.calificacion_materia ?? item.calificacion_alumno ?? (item.tb_alumno && item.tb_alumno.calificacion) ?? null
        if (idAlumno) {
          orig[idAlumno] = cal === null || cal === undefined ? '' : String(cal)
          initial[idAlumno] = cal === null || cal === undefined ? '' : String(cal)
        }
      })
      setOriginalGrades(orig)
      setGrades(initial)

      if (data.length === 0) {
        setMensajeInfo('No hay alumnos inscritos en esta materia para tu grupo asignado.')
      }
    } catch (error) {
      console.warn('Error al obtener alumnos de la materia:', error)
      setAlumnos([])
      setOriginalGrades({})
      setGrades({})

      if (error.response?.status === 404) {
        const msg = error.response?.data?.message || 'No tienes un grupo asignado o no se encontraron alumnos para esta materia.'
        setMensajeInfo(msg)
      } else {
        setMensajeInfo('Ocurrió un problema al cargar la lista de alumnos.')
      }
    } finally {
      setLoadingAlumnos(false)
    }
  }

  useEffect(() => {
    if (!selectedMateria) return
    const id = selectedMateria.id_materia || selectedMateria.id
    cargarAlumnosPorMateria(id)
  }, [selectedMateria])

  const filtered = useMemo(() => {
    if (!searchTerm) return materias
    return materias.filter((m) => {
      const nombre = (m.nombre_materia || m.nombre || m.materia || '').toLowerCase()
      return nombre.includes(searchTerm.toLowerCase())
    })
  }, [materias, searchTerm])

  const capturedCount = useMemo(() => {
    return Object.values(grades).filter((v) => v !== '' && v !== null && v !== undefined && !Number.isNaN(Number(v))).length
  }, [grades])

  const average = useMemo(() => {
    const vals = Object.values(grades).map((v) => Number(v)).filter((n) => !Number.isNaN(n))
    if (!vals.length) return '—'
    const avg = vals.reduce((s, n) => s + n, 0) / vals.length
    return avg.toFixed(1)
  }, [grades])

  // total count and alias for rendering in bottom bar
  const totalCount = alumnos.length
  const promedioCalculado = average

  const handleSelectMateria = (m) => {
    setSelectedMateria(m)
    setSearchTerm(m.nombre_materia || m.nombre || m.materia || '')
    setIsOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleGradeChange = (idAlumno, value) => {
    if (value === '') {
      setGrades((s) => ({ ...s, [idAlumno]: '' }))
      return
    }
    let num = Number(value)
    if (Number.isNaN(num)) return
    if (num < 0) num = 0
    if (num > 10) num = 10
    const rounded = Math.round(num * 10) / 10
    setGrades((s) => ({ ...s, [idAlumno]: String(rounded) }))
  }

  const handleSave = async () => {
    if (!selectedMateria) return
    const idMateria = selectedMateria.id_materia || selectedMateria.id || selectedMateria.id_materia
    const updates = []

    alumnos.forEach((item) => {
      const idAlumno = item.id_alumno || item.id || (item.tb_alumno && (item.tb_alumno.id_alumno || item.tb_alumno.id))
      const newVal = grades[idAlumno]
      const orig = originalGrades[idAlumno]
      if (newVal !== undefined && String(newVal) !== String(orig) && newVal !== '') {
        updates.push({ idAlumno, calificacion: parseFloat(newVal) })
      }
    })

    if (!updates.length) {
      setSuccessMessage('No hay cambios para guardar')
      setTimeout(() => setSuccessMessage(''), 2000)
      return
    }

    setSaving(true)
    setErrorMessage('')
    try {
      await Promise.all(
        updates.map((u) => client.put(`/alumnomateria/${u.idAlumno}/${idMateria}`, { calificacion: u.calificacion }))
      )
      setSuccessMessage('Calificaciones guardadas correctamente')
      const newOrig = { ...originalGrades }
      updates.forEach((u) => { newOrig[u.idAlumno] = String(u.calificacion) })
      setOriginalGrades(newOrig)
    } catch (err) {
      console.error('Error guardando calificaciones', err)
      setErrorMessage('Error al guardar calificaciones')
    } finally {
      setSaving(false)
      setTimeout(() => {
        setSuccessMessage('')
        setErrorMessage('')
      }, 3000)
    }
  }

  const getAlumnoNombre = (item) => {
    if (item.tb_alumno) return `${item.tb_alumno.nombre || ''} ${item.tb_alumno.apellidos || ''}`.trim()
    return `${item.nombre || item.nombre_alumno || ''} ${item.apellidos || item.apellidos_alumno || ''}`.trim()
  }

  const getIdAlumno = (item) => item.id_alumno || item.id || (item.tb_alumno && (item.tb_alumno.id_alumno || item.tb_alumno.id))

  return (
    <div className="min-h-screen bg-slate-50" translate="no">
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            <span>Captura de Calificaciones</span>
          </h1>
        </div>

        {/* Barra Superior de Herramientas */}
        <section className="mb-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Buscador de Materia */}
              <div ref={dropdownRef} className="relative w-full lg:w-80">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Escribe para buscar materia (ej. Matemáticas)..."
                    value={searchTerm}
                    onFocus={() => setIsOpen(true)}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setIsOpen(true)
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {isOpen && filtered.length > 0 && (
                  <div className="absolute left-0 top-full mt-2 w-full rounded-2xl bg-white shadow-lg border z-10">
                    <div className="max-h-56 overflow-auto p-2">
                      {loadingMaterias && (
                        <div className="p-3 text-center text-slate-500"><Loader2 className="inline h-5 w-5 animate-spin mr-2" /><span>Cargando...</span></div>
                      )}
                      {!loadingMaterias && filtered.map((m) => (
                        <button
                          key={m.id_materia || m.id || m.nombre_materia || m.nombre}
                          type="button"
                          onClick={() => handleSelectMateria(m)}
                          className="w-full text-left rounded-xl px-3 py-2 hover:bg-slate-50"
                        >
                          <span>{m.nombre_materia || m.nombre || m.materia || 'Materia'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Controles y Métricas (SOLO ESCRITORIO) */}
              <div className="hidden lg:flex items-center gap-3">
                <span className="rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                  <span>{capturedCount}/{totalCount} Capturadas</span>
                </span>
                <span className="rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                  <span>Prom: {promedioCalculado}</span>
                </span>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  <span>Guardar Calificaciones</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="rounded-2xl bg-white p-4 shadow-sm border pb-24 lg:pb-0">
            <div className="grid grid-cols-12 gap-4 border-b pb-3">
              <div className="col-span-1 text-sm font-semibold text-slate-500"><span>#</span></div>
              <div className="col-span-8 text-sm font-semibold text-slate-500"><span>NOMBRE DEL ALUMNO</span></div>
              <div className="col-span-3 text-right text-sm font-semibold text-slate-500"><span>CALIFICACIÓN</span></div>
            </div>

            <div className="mt-3 space-y-2">
              {mensajeInfo && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <span>{mensajeInfo}</span>
                </div>
              )}

              {loadingAlumnos && (
                <div className="flex items-center gap-2 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" /><span>Cargando alumnos...</span></div>
              )}

              {!loadingAlumnos && alumnos.length === 0 && (
                <div className="p-4 text-slate-500"><span>No hay alumnos para esta materia.</span></div>
              )}

              {!loadingAlumnos && alumnos.map((al, idx) => {
                const idAlumno = getIdAlumno(al)
                const nombre = getAlumnoNombre(al) || 'Alumno'
                const value = grades[idAlumno] ?? ''
                const num = Number(value)
                let dot = 'bg-slate-300'
                if (value !== '' && !Number.isNaN(num)) {
                  if (num >= 8.0) dot = 'bg-emerald-400'
                  else if (num >= 6.0) dot = 'bg-amber-400'
                  else dot = 'bg-rose-500'
                }

                const initials = nombre.split(' ').filter(Boolean).slice(0,2).map(n => n[0]).join('').toUpperCase() || 'AL'
                const color = bgColors[idx % bgColors.length]

                return (
                  <div key={idAlumno || idx} className="grid grid-cols-12 items-center gap-4 rounded-xl px-3 py-3 hover:bg-slate-50">
                    <div className="col-span-1 text-sm text-slate-700"><span>{String(idx + 1).padStart(2, '0')}</span></div>
                    <div className="col-span-8 flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold ${color}`}> 
                        <span>{initials}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800"><span>{nombre}</span></p>
                      </div>
                    </div>
                    <div className="col-span-3 flex items-center justify-end gap-3">
                      <div className={`h-3 w-3 shrink-0 rounded-full ${dot}`} />
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={value}
                        onChange={(e) => handleGradeChange(idAlumno, e.target.value)}
                        className="w-20 rounded-xl border text-center font-bold px-2 py-1.5 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Barra de Guardado Inferior Fija (SOLO MÓVIL) */}
        <div className="sticky bottom-0 left-0 right-0 -mx-4 -mb-6 border-t bg-white p-4 shadow-2xl lg:hidden z-30">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-slate-700">
              <span>{capturedCount}/{totalCount} Capturadas</span>
              <span className="mx-1.5 text-slate-300">•</span>
              <span>Prom: {promedioCalculado}</span>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50 shrink-0"
            >
              <Check className="h-4 w-4"/>
              <span>Guardar Calificaciones</span>
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="fixed right-6 top-6 z-50 rounded-xl bg-emerald-600 px-4 py-3 text-white shadow-lg">
            <div className="flex items-center gap-2"><Save className="h-4 w-4" /><span>{successMessage}</span></div>
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

export default CapturaCalificaciones
