import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X, Loader2, GraduationCap } from 'lucide-react'
import client from '../../api/axios.js'

const bgColors = ['bg-amber-100 text-amber-700', 'bg-emerald-100 text-emerald-700', 'bg-sky-100 text-sky-700', 'bg-pink-100 text-pink-700']

const HistorialAlumno = () => {
  const [alumnos, setAlumnos] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAlumno, setSelectedAlumno] = useState(null)
  const dropdownRef = useRef(null)

  const [boleta, setBoleta] = useState([]) // array of { id_materia, calificacion }
  const [loadingBoleta, setLoadingBoleta] = useState(false)

  useEffect(() => {
    const cargarAlumnosDocente = async () => {
      try {
        const res = await client.get('/alumnos')
        const alumnosData = Array.isArray(res.data) ? res.data : []
        setAlumnos(alumnosData)

        if (alumnosData.length) {
          setSelectedAlumno(alumnosData[0])
        }
      } catch (err) {
        console.error('Error al obtener lista de alumnos:', err)
        setAlumnos([])
        setSelectedAlumno(null)
      }
    }

    cargarAlumnosDocente()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredAlumnos = useMemo(() => {
    if (!searchTerm) return alumnos
    return alumnos.filter((a) => {
      const nombre = `${a.nombre || ''} ${a.apellidos || ''}`.toLowerCase()
      return nombre.includes(searchTerm.toLowerCase())
    })
  }, [alumnos, searchTerm])

  const materiasConNotas = useMemo(() => {
    return (boleta || []).map((item) => ({
      ...item,
      id_materia: item.id_materia || item.id || item.tb_materia?.id_materia || item.tb_materia?.id,
      nombre_materia: item.nombre_materia || item.tb_materia?.nombre_materia || item.tb_materia?.nombre || item.materia,
      calificacion: item.calificacion ?? item.calificacion_materia ?? item.calificacion_alumno ?? null,
    }))
  }, [boleta])

  const capturedCount = useMemo(() => {
    return materiasConNotas.filter((m) => m.calificacion !== null && m.calificacion !== undefined && m.calificacion !== '').length
  }, [materiasConNotas])

  const promedio = useMemo(() => {
    const vals = materiasConNotas.map((m) => Number(m.calificacion)).filter((n) => !Number.isNaN(n))
    if (!vals.length) return '—'
    const avg = vals.reduce((s, n) => s + n, 0) / vals.length
    return avg.toFixed(1)
  }, [materiasConNotas])

  const handleSelectAlumno = (a) => {
    setSelectedAlumno(a)
    setSearchTerm(`${a.nombre || ''} ${a.apellidos || ''}`.trim())
    setIsOpen(false)
  }

  useEffect(() => {
    if (!selectedAlumno) {
      setBoleta([])
      return
    }

    const idAlumno = selectedAlumno.id_alumno || selectedAlumno.id
    if (!idAlumno) {
      setBoleta([])
      return
    }

    const cargarHistorialAlumno = async () => {
    setLoadingBoleta(true)
    try {
      const res = await client.get(`/alumnomateria/alumno/${idAlumno}`)
      setBoleta(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.warn('Error al cargar historial del alumno:', error)
      setBoleta([])
    } finally {
      setLoadingBoleta(false)
    }
    }

    cargarHistorialAlumno()
  }, [selectedAlumno])

  const clearSearch = () => {
    setSearchTerm('')
    setIsOpen(false)
  }

  const getInitials = (name) => {
    return (name || '').split(' ').filter(Boolean).slice(0,2).map(n => n[0]).join('').toUpperCase()
  }

  const totalCount = materiasConNotas.length

  return (
    <div className="min-h-screen bg-slate-50" translate="no">
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 mb-4"><span>Historial por Alumno</span></h1>
        </div>

        <div className="mb-6 max-w-lg">
          <label htmlFor="alumno-search" className="mb-2 block text-sm font-semibold text-slate-700"><span>Seleccionar Alumno:</span></label>
          <div ref={dropdownRef} className="relative">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                id="alumno-search"
                value={searchTerm}
                onFocus={() => setIsOpen(true)}
                onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true) }}
                placeholder="Buscar alumno por nombre..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              {searchTerm && (
                <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {isOpen && filteredAlumnos.length > 0 && (
              <div className="absolute left-0 top-full mt-2 w-full rounded-2xl bg-white shadow-lg border z-10">
                <div className="max-h-56 overflow-auto p-2">
                  {filteredAlumnos.map((a, idx) => (
                    <button
                      key={a.id_alumno || a.id || idx}
                      type="button"
                      onClick={() => handleSelectAlumno(a)}
                      className="w-full text-left rounded-xl px-3 py-2 hover:bg-slate-50 flex items-center gap-3"
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-semibold ${bgColors[idx % bgColors.length]}`}>
                        <span>{getInitials(`${a.nombre || ''} ${a.apellidos || ''}`)}</span>
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

        <div className="max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold shrink-0">
                <GraduationCap className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight"><span>{selectedAlumno ? `${selectedAlumno.nombre || ''} ${selectedAlumno.apellidos || ''}`.trim() : 'Alumno'}</span></h2>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400"><span>MATERIAS CAPTURADAS</span></p>
              <p className="text-lg font-bold text-slate-900"><span>{capturedCount}/{totalCount}</span></p>
            </div>
          </div>

          <div>
            {loadingBoleta ? (
              <div className="p-6 text-center text-slate-500"><Loader2 className="inline h-5 w-5 animate-spin mr-2" /><span>Cargando boleta...</span></div>
            ) : (
              <div className="divide-y">
                {materiasConNotas.map((m, idx) => {
                  const nota = m.calificacion
                  const pct = nota !== null && nota !== undefined && nota !== '' && !Number.isNaN(Number(nota)) ? Math.max(0, Math.min(100, (Number(nota) / 10) * 100)) : 0
                  return (
                    <div key={m.id_materia || m.id || idx} className="flex items-center justify-between gap-4 p-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-800"><span>{m.nombre_materia || m.nombre || m.materia || 'Materia'}</span></p>
                        <div className="mt-2 h-2 w-64 rounded-full bg-slate-100">
                          <div className={`h-2 rounded-full ${nota !== null && nota !== undefined && nota !== '' && !Number.isNaN(Number(nota)) ? 'bg-emerald-500' : 'bg-slate-100'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        {nota !== null && nota !== undefined && nota !== '' && !Number.isNaN(Number(nota)) ? (
                          <span className="text-sm font-bold text-emerald-600"><span>{Number(nota).toFixed(1)}</span></span>
                        ) : (
                          <span className="text-sm text-slate-400"><span>-</span></span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="bg-blue-50/60 p-6 flex justify-between items-center border-t border-blue-100">
            <div>
              <p className="text-xs font-semibold text-slate-700"><span>PROMEDIO GENERAL</span></p>
              <p className="text-sm text-slate-500"><span>Basado en {capturedCount} materia(s) capturada(s)</span></p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-emerald-600"><span>{promedio}</span></p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default HistorialAlumno
