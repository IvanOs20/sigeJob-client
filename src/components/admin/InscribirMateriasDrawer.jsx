import { useEffect, useMemo, useState } from 'react';
import { Loader2, Search, X, Check } from 'lucide-react';
import api from '../../api/axios';

const getAlumnoId = (alumno) => alumno?.id_alumno || alumno?.id;
const getMateriaId = (materia) => materia?.id_materia || materia?.id;

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
  const nombre = String(materia?.nombre_materia || materia?.nombre || materia?.materia || '').trim();
  return nombre || 'Materia';
};

const InscribirMateriasDrawer = ({ isOpen, onClose, onSuccess, alumnos = [], materias = [] }) => {
  const [alumnoQuery, setAlumnoQuery] = useState('');
  const [selectedAlumno, setSelectedAlumno] = useState(null);
  const [isAlumnoDropdownOpen, setIsAlumnoDropdownOpen] = useState(false);
  const [materiasInscritas, setMateriasInscritas] = useState([]);
  const [selectedMaterias, setSelectedMaterias] = useState([]);
  const [loadingMaterias, setLoadingMaterias] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAlumnoQuery('');
      setSelectedAlumno(null);
      setIsAlumnoDropdownOpen(false);
      setMateriasInscritas([]);
      setSelectedMaterias([]);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!selectedAlumno) {
      setMateriasInscritas([]);
      setSelectedMaterias([]);
      return;
    }

    const fetchMateriasInscritas = async () => {
      setLoadingMaterias(true);

      try {
        const alumnoId = getAlumnoId(selectedAlumno);
        const response = await api.get(`/alumnomateria/alumno/${alumnoId}`);
        const data = Array.isArray(response.data) ? response.data : [];

        const ids = data.map((item) => {
          const idMateria = item?.id_materia || item?.id || item?.tb_materia?.id_materia || item?.tb_materia?.id;
          return String(idMateria);
        });

        setMateriasInscritas(ids);
        setSelectedMaterias([]);
      } catch (error) {
        console.error('Error al obtener materias inscritas del alumno:', error);
        setMateriasInscritas([]);
        setSelectedMaterias([]);
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
      const queryNormalized = query.replace(/^#/, '');

      return nombreCompleto.includes(query) || idValue.includes(queryNormalized) || `#${idValue}`.includes(query);
    });
  }, [alumnos, alumnoQuery]);

  const materiasDisponibles = useMemo(() => {
    const idsInscritas = new Set(materiasInscritas.map(String));

    return materias.filter((materia) => !idsInscritas.has(String(getMateriaId(materia))));
  }, [materias, materiasInscritas]);

  const toggleMateria = (materiaId) => {
    const value = String(materiaId);
    setSelectedMaterias((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  const handleSubmit = async () => {
    if (!selectedAlumno || !selectedMaterias.length) return;

    setSubmitting(true);

    try {
      await Promise.all(
        selectedMaterias.map((materiaId) =>
          api.post('/alumnomateria', {
            id_alumno: Number(getAlumnoId(selectedAlumno)),
            id_materia: Number(materiaId),
          })
        )
      );

      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error('Error al inscribir materias:', error);
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
    setSelectedMaterias([]);
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
        <div className="border-l-4 border-blue-600 bg-white pl-4 pt-6">
          <div className="flex items-start justify-between pr-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                <span>Inscripción de Materias</span>
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                <span>Seleccione al alumno y asigne nuevas materias</span>
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
                <span>Paso 2 — Materias Disponibles</span>
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
                  ) : materiasDisponibles.length ? (
                    <div className="space-y-3">
                      {materiasDisponibles.map((materia) => {
                        const materiaId = String(getMateriaId(materia));
                        const selected = selectedMaterias.includes(materiaId);

                        return (
                          <button
                            key={materiaId}
                            type="button"
                            onClick={() => toggleMateria(materiaId)}
                            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                              selected
                                ? 'border-blue-200 bg-blue-50 text-blue-700'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`flex h-5 w-5 items-center justify-center rounded-md border text-xs transition ${
                                  selected
                                    ? 'border-blue-600 bg-blue-600 text-white'
                                    : 'border-slate-300 bg-white text-transparent'
                                }`}
                              >
                                <Check className="h-3.5 w-3.5" />
                              </span>
                              <span className="text-base font-medium">
                                <span>{getMateriaNombre(materia)}</span>
                              </span>
                            </div>

                            {selected && (
                              <span className="text-sm font-semibold text-blue-700">
                                <span>Seleccionada</span>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
                      <span>Este alumno ya tiene todas las materias disponibles.</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
                  <span>Selecciona un alumno para ver sus materias disponibles.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-slate-200 bg-white p-6">
          {selectedAlumno && selectedMaterias.length >= 0 && (
            <div className="mb-4 text-center text-sm text-slate-500">
              <span>{`${selectedMaterias.length} de ${materiasDisponibles.length} materias seleccionadas`}</span>
            </div>
          )}

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
              onClick={handleSubmit}
              disabled={submitting || !selectedAlumno || !selectedMaterias.length}
              className="rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Inscribiendo...</span>
                </span>
              ) : (
                <span>Inscribir Materias</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InscribirMateriasDrawer;
