import { useEffect, useMemo, useState } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import api from '../../api/axios';

const getAlumnoId = (alumno) => alumno?.id_alumno || alumno?.id;

const getAlumnoNombre = (alumno) => {
  const nombre = String(alumno?.nombre || '').trim();
  const apellidos = String(alumno?.apellidos || alumno?.apellido || '').trim();
  return `${nombre} ${apellidos}`.trim() || 'Alumno sin nombre';
};

const getAlumnoGrupo = (alumno) => {
  const grupo = alumno?.grupo || alumno?.tb_grupo || null;
  const grado = String(grupo?.grado || alumno?.grado || '').trim();
  const letra = String(grupo?.grupo || alumno?.grupo_letra || alumno?.letra || '').trim().toUpperCase();
  return `${grado} ${letra}`.trim() || 'Sin grupo';
};

const getMateriaNombre = (materia) => {
  const nombre = String(
    materia?.nombre_materia ||
      materia?.nombre ||
      materia?.materia ||
      materia?.tb_materia?.nombre_materia ||
      materia?.tb_materia?.nombre ||
      ''
  ).trim();

  return nombre || 'Materia';
};

const getMateriaId = (materia) =>
  materia?.id_materia ||
  materia?.id ||
  materia?.tb_materia?.id_materia ||
  materia?.tb_materia?.id;

const BajaMateriasDrawer = ({ isOpen, onClose, onSuccess, alumnos = [] }) => {
  const [alumnoQuery, setAlumnoQuery] = useState('');
  const [selectedAlumno, setSelectedAlumno] = useState(null);
  const [isAlumnoDropdownOpen, setIsAlumnoDropdownOpen] = useState(false);
  const [materiasInscritas, setMateriasInscritas] = useState([]);
  const [materiasParaBaja, setMateriasParaBaja] = useState([]);
  const [loadingMaterias, setLoadingMaterias] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAlumnoQuery('');
      setSelectedAlumno(null);
      setIsAlumnoDropdownOpen(false);
      setMateriasInscritas([]);
      setMateriasParaBaja([]);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!selectedAlumno) {
      setMateriasInscritas([]);
      setMateriasParaBaja([]);
      return;
    }

    const fetchMateriasInscritas = async () => {
      const alumnoId = getAlumnoId(selectedAlumno);
      if (!alumnoId) {
        setMateriasInscritas([]);
        return;
      }

      setLoadingMaterias(true);

      try {
        const response = await api.get(`/alumnomateria/alumno/${alumnoId}`);
        const data = Array.isArray(response.data) ? response.data : [];

        const materias = data.map((item) => ({
          ...item,
          idMateria: getMateriaId(item),
          nombre: getMateriaNombre(item),
        }));

        setMateriasInscritas(materias);
        setMateriasParaBaja([]);
      } catch (error) {
        console.error('Error al cargar materias inscritas del alumno:', error);
        setMateriasInscritas([]);
        setMateriasParaBaja([]);
      } finally {
        setLoadingMaterias(false);
      }
    };

    fetchMateriasInscritas();
  }, [selectedAlumno]);

  const filteredAlumnos = useMemo(() => {
    const query = alumnoQuery.trim().toLowerCase();

    if (!query) return alumnos;

    return alumnos.filter((alumno) => {
      const nombreCompleto = getAlumnoNombre(alumno).toLowerCase();
      const idValue = String(getAlumnoId(alumno) ?? '').toLowerCase();
      const normalizedQuery = query.replace(/^#/, '');

      return nombreCompleto.includes(query) || idValue.includes(normalizedQuery) || `#${idValue}`.includes(query);
    });
  }, [alumnos, alumnoQuery]);

  const toggleMateriaBaja = (materia) => {
    const idMateria = String(getMateriaId(materia));

    setMateriasParaBaja((current) => {
      return current.includes(idMateria)
        ? current.filter((item) => item !== idMateria)
        : [...current, idMateria];
    });
  };

  const handleConfirmarBajas = async () => {
    if (!selectedAlumno || !materiasParaBaja.length) return;

    setSubmitting(true);

    try {
      await Promise.all(
        materiasParaBaja.map((idMateria) =>
          api.delete(`/alumnomateria/${getAlumnoId(selectedAlumno)}/${idMateria}`)
        )
      );

      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error('Error al dar de baja materias:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectAlumno = (alumno) => {
    setSelectedAlumno(alumno);
    setAlumnoQuery(`${getAlumnoNombre(alumno)} #${getAlumnoId(alumno)}`);
    setIsAlumnoDropdownOpen(false);
  };

  const resetAlumnoSelection = () => {
    setSelectedAlumno(null);
    setAlumnoQuery('');
    setMateriasInscritas([]);
    setMateriasParaBaja([]);
    setIsAlumnoDropdownOpen(true);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex h-screen w-screen justify-end bg-slate-900/50 backdrop-blur-sm"
      translate="no"
    >
      <div className="flex h-full w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl">
        <div className="border-l-4 border-red-600 bg-white pl-4 pt-6">
          <div className="flex items-start justify-between pr-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                <span>Baja de Materias</span>
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                <span>Desvincula asignaturas cargadas a un alumno</span>
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Cerrar"
              disabled={submitting}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                <span>Paso 1 — Seleccionar Alumno</span>
              </h3>

              {selectedAlumno ? (
                <div className="flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50/60 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      <span>
                        {`${selectedAlumno?.nombre || 'A'} ${selectedAlumno?.apellidos || selectedAlumno?.apellido || 'A'}`
                          .trim()
                          .split(' ')
                          .slice(0, 2)
                          .map((part) => part.charAt(0).toUpperCase())
                          .join('') || 'A'}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        <span>{getAlumnoNombre(selectedAlumno)}</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        <span>{`#${getAlumnoId(selectedAlumno)} · ${getAlumnoGrupo(selectedAlumno)}`}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={resetAlumnoSelection}
                    className="rounded-full p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                    aria-label="Desmarcar alumno"
                    title="Desmarcar alumno"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={alumnoQuery}
                    onChange={(event) => {
                      setAlumnoQuery(event.target.value);
                      setIsAlumnoDropdownOpen(true);
                    }}
                    onFocus={() => setIsAlumnoDropdownOpen(true)}
                    placeholder="Buscar alumno por nombre o #ID..."
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />

                  {isAlumnoDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-[60]" onClick={() => setIsAlumnoDropdownOpen(false)} />

                      <div className="absolute left-0 top-full z-[70] mt-1.5 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                        {filteredAlumnos.length ? (
                          filteredAlumnos.map((alumno) => (
                            <button
                              key={getAlumnoId(alumno)}
                              type="button"
                              onClick={() => handleSelectAlumno(alumno)}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50"
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                                <span>
                                  {getAlumnoNombre(alumno)
                                    .split(' ')
                                    .filter(Boolean)
                                    .slice(0, 2)
                                    .map((part) => part.charAt(0).toUpperCase())
                                    .join('') || 'A'}
                                </span>
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-800">
                                  <span>{getAlumnoNombre(alumno)}</span>
                                </p>
                                <p className="truncate text-xs text-slate-500">
                                  <span>{`#${getAlumnoId(alumno)} · ${getAlumnoGrupo(alumno)}`}</span>
                                </p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-2.5 py-2 text-sm text-slate-500">
                            <span>No se encontraron alumnos</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                <span>Paso 2 — Materias Inscritas</span>
              </h3>

              {selectedAlumno ? (
                <>
                  {loadingMaterias ? (
                    <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Cargando materias...</span>
                      </span>
                    </div>
                  ) : materiasInscritas.length ? (
                    <div className="space-y-3">
                      {materiasInscritas.map((materia) => {
                        const idMateria = String(getMateriaId(materia));
                        const selected = materiasParaBaja.includes(idMateria);

                        return (
                          <div
                            key={idMateria}
                            className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition ${
                              selected
                                ? 'border-red-200 bg-red-50 text-red-600'
                                : 'border-slate-200 bg-white text-slate-700'
                            }`}
                          >
                            <span className={`text-base font-semibold ${selected ? 'line-through' : ''}`}>
                              <span>{getMateriaNombre(materia)}</span>
                            </span>

                            <button
                              type="button"
                              onClick={() => toggleMateriaBaja(materia)}
                              className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                                selected
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <span>{selected ? 'Deshacer' : 'Quitar'}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
                      <span>Este alumno no tiene materias inscritas.</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
                  <span>Selecciona un alumno para ver sus materias inscritas.</span>
                </div>
              )}

              {selectedAlumno && materiasInscritas.length > 0 && (
                <div className="mt-4 text-center text-sm text-slate-500">
                  <span>{`${materiasParaBaja.length} materias marcadas para baja`}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-slate-200 bg-white p-6">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              disabled={submitting}
            >
              <span>Cancelar</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmarBajas}
              disabled={submitting || !selectedAlumno || !materiasParaBaja.length}
              className="rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Eliminando...</span>
                </span>
              ) : (
                <span>{`Confirmar Bajas (${materiasParaBaja.length})`}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BajaMateriasDrawer;
