import { useEffect, useMemo, useState } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import api from '../../api/axios';

const getGrupoId = (grupo) => grupo?.id_grupo || grupo?.id;
const getTutorId = (tutor) => tutor?.id_tutor || tutor?.id;

const getGrupoLabel = (grupo) => {
  const grado = String(grupo?.grado || '').trim();
  const letra = String(grupo?.grupo || '').trim().toUpperCase();

  return `${grado} ${letra}`.trim() || 'Sin grupo';
};

const getTutorNombre = (tutor) => {
  const nombre = String(tutor?.nombre || '').trim();
  const apellido = String(tutor?.apellido || tutor?.apellidos || '').trim();
  const fullName = `${nombre} ${apellido}`.trim();

  return fullName || String(tutor?.nombre_completo || tutor?.correo || 'Tutor');
};

const getTutorCorreo = (tutor) => String(tutor?.correo || tutor?.email || 'Sin correo registrado').trim();

const getTutorInitials = (tutor) => {
  const initials = getTutorNombre(tutor)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return initials || 'T';
};

const getAlumnoGrupoId = (alumno) => alumno?.id_grupo || alumno?.grupo?.id_grupo || alumno?.grupo?.id;
const getAlumnoTutorId = (alumno) => alumno?.id_tutor || alumno?.tutor?.id_tutor || alumno?.tutor?.id;

const EditarAlumnoDrawer = ({
  isOpen,
  onClose,
  onSuccess,
  alumno,
  grupos = [],
  tutores = [],
  alumnos = [],
}) => {
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [selectedGrupoId, setSelectedGrupoId] = useState('');
  const [selectedTutorId, setSelectedTutorId] = useState('');
  const [grupoQuery, setGrupoQuery] = useState('');
  const [tutorQuery, setTutorQuery] = useState('');
  const [isGrupoDropdownOpen, setIsGrupoDropdownOpen] = useState(false);
  const [isTutorDropdownOpen, setIsTutorDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!alumno) return;

    const nextGrupoId = getAlumnoGrupoId(alumno) ?? '';
    const nextTutorId = getAlumnoTutorId(alumno) ?? '';
    const currentGrupo = grupos.find((grupo) => String(getGrupoId(grupo)) === String(nextGrupoId)) || null;
    const currentTutor = tutores.find((tutor) => String(getTutorId(tutor)) === String(nextTutorId)) || null;

    setNombre(String(alumno?.nombre || ''));
    setApellidos(String(alumno?.apellidos || alumno?.apellido || ''));
    setSelectedGrupoId(nextGrupoId ? String(nextGrupoId) : '');
    setSelectedTutorId(nextTutorId ? String(nextTutorId) : '');
    setGrupoQuery(currentGrupo ? getGrupoLabel(currentGrupo) : '');
    setTutorQuery(currentTutor ? getTutorNombre(currentTutor) : '');
    setIsGrupoDropdownOpen(false);
    setIsTutorDropdownOpen(false);
  }, [alumno, grupos, tutores]);

  const selectedGrupo = useMemo(
    () => grupos.find((grupo) => String(getGrupoId(grupo)) === String(selectedGrupoId)) || null,
    [grupos, selectedGrupoId]
  );

  const selectedTutor = useMemo(
    () => tutores.find((tutor) => String(getTutorId(tutor)) === String(selectedTutorId)) || null,
    [tutores, selectedTutorId]
  );

  const gruposFiltrados = useMemo(() => {
    const query = grupoQuery.trim().toLowerCase();

    if (!query) return grupos;

    return grupos.filter((grupo) => getGrupoLabel(grupo).toLowerCase().includes(query));
  }, [grupos, grupoQuery]);

  const tutoresFiltrados = useMemo(() => {
    const query = tutorQuery.trim().toLowerCase();

    if (!query) return tutores;

    return tutores.filter((tutor) => {
      const nombreCompleto = `${tutor?.nombre || ''} ${tutor?.apellido || tutor?.apellidos || ''}`.toLowerCase();
      const correo = (tutor?.correo || tutor?.email || '').toLowerCase();
      return nombreCompleto.includes(query) || correo.includes(query);
    });
  }, [tutores, tutorQuery]);

  const alumnosEnGrupo = useMemo(() => {
    if (!selectedGrupoId) return 0;

    return alumnos.filter((item) => String(getAlumnoGrupoId(item)) === String(selectedGrupoId)).length;
  }, [alumnos, selectedGrupoId]);

  const materiasInscritas = useMemo(() => {
    if (Array.isArray(alumno?.materias)) return alumno.materias.length;
    if (typeof alumno?.materias_inscritas === 'number') return alumno.materias_inscritas;
    if (typeof alumno?.cantidad_materias === 'number') return alumno.cantidad_materias;

    return 3;
  }, [alumno]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!alumno?.id_alumno) return;
    if (!nombre.trim() || !apellidos.trim()) return;
    if (!selectedGrupoId || !selectedTutorId) return;

    setLoading(true);

    try {
      await api.put(`/alumnos/${alumno.id_alumno}`, {
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        id_grupo: Number(selectedGrupoId),
        id_tutor: Number(selectedTutorId),
      });

      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error('Error al actualizar alumno:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearGrupo = () => {
    setSelectedGrupoId('');
    setGrupoQuery('');
    setIsGrupoDropdownOpen(true);
  };

  const handleClearTutor = () => {
    setSelectedTutorId('');
    setTutorQuery('');
    setIsTutorDropdownOpen(true);
  };

  const handleSelectGrupo = (grupo) => {
    setSelectedGrupoId(String(getGrupoId(grupo)));
    setGrupoQuery(getGrupoLabel(grupo));
    setIsGrupoDropdownOpen(false);
  };

  const handleSelectTutor = (tutor) => {
    setSelectedTutorId(String(getTutorId(tutor)));
    setTutorQuery(getTutorNombre(tutor));
    setIsTutorDropdownOpen(false);
  };

  if (!isOpen || !alumno) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 h-screen w-screen overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end"
      translate="no"
    >
      <div className="flex w-full max-w-md flex-col justify-between overflow-y-auto bg-white shadow-2xl">
        <div className="space-y-6 p-5">
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                <span>Editar Alumno</span>
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                <span>{`ID #${alumno?.id_alumno}`}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Cerrar"
              disabled={loading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-base font-bold text-sky-700">
                <span>{`${(nombre || 'A').charAt(0).toUpperCase()}${(apellidos || 'A').charAt(0).toUpperCase()}` || 'A'}</span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  <span>{`${nombre || 'Nombre'} ${apellidos || 'Apellidos'}`.trim() || 'Alumno'}</span>
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  <span>{`${materiasInscritas} materias inscritas`}</span>
                </p>
              </div>
            </div>
          </div>

          <form id="editar-alumno-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="nombre-alumno" className="mb-1.5 block text-sm font-medium text-slate-600">
                <span>Nombre(s) *</span>
              </label>
              <input
                id="nombre-alumno"
                type="text"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Nombre(s)"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="apellido-alumno" className="mb-1.5 block text-sm font-medium text-slate-600">
                <span>Apellidos *</span>
              </label>
              <input
                id="apellido-alumno"
                type="text"
                value={apellidos}
                onChange={(event) => setApellidos(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Apellidos"
                disabled={loading}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                <span>Grupo Asignado *</span>
              </label>

              {selectedGrupo ? (
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      <span>{getGrupoLabel(selectedGrupo)}</span>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        <span>{getGrupoLabel(selectedGrupo)}</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        <span>{`${alumnosEnGrupo} alumnos`}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearGrupo}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                    aria-label="Quitar grupo"
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={grupoQuery}
                    onChange={(event) => {
                      setGrupoQuery(event.target.value);
                      setIsGrupoDropdownOpen(true);
                    }}
                    onFocus={() => setIsGrupoDropdownOpen(true)}
                    placeholder="Buscar grupo..."
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    disabled={loading}
                  />

                  {isGrupoDropdownOpen && gruposFiltrados.length > 0 && (
                    <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                      {gruposFiltrados.map((grupo) => (
                        <button
                          key={getGrupoId(grupo)}
                          type="button"
                          onClick={() => handleSelectGrupo(grupo)}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50"
                        >
                          <span className="text-sm font-semibold text-slate-800">{getGrupoLabel(grupo)}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {isGrupoDropdownOpen && !gruposFiltrados.length && (
                    <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-500 shadow-xl">
                      <span>No se encontraron grupos</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                <span>Tutor Responsable *</span>
              </label>

              {selectedTutor ? (
                <div className="flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50/50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      <span>{getTutorInitials(selectedTutor)}</span>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        <span>{getTutorNombre(selectedTutor)}</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        <span>{getTutorCorreo(selectedTutor)}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearTutor}
                    className="rounded-full p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                    aria-label="Quitar tutor"
                    disabled={loading}
                    title="Desmarcar tutor"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={tutorQuery}
                    onChange={(event) => {
                      setTutorQuery(event.target.value);
                      setIsTutorDropdownOpen(true);
                    }}
                    onFocus={() => setIsTutorDropdownOpen(true)}
                    placeholder="Buscar tutor por nombre o correo..."
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    disabled={loading}
                  />

                  {isTutorDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsTutorDropdownOpen(false)} />

                      <div className="absolute left-0 top-full z-20 mt-1.5 max-h-60 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                        {tutoresFiltrados.length > 0 ? (
                          tutoresFiltrados.map((tutor) => (
                            <button
                              key={getTutorId(tutor)}
                              type="button"
                              onClick={() => handleSelectTutor(tutor)}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50"
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                                <span>{getTutorInitials(tutor)}</span>
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-800">
                                  <span>{getTutorNombre(tutor)}</span>
                                </p>
                                <p className="truncate text-xs text-slate-500">
                                  <span>{getTutorCorreo(tutor)}</span>
                                </p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-2.5 py-2 text-sm text-slate-500">
                            <span>No se encontraron tutores</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-slate-100 bg-white p-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            disabled={loading}
          >
            <span>Cancelar</span>
          </button>

          <button
            type="submit"
            form="editar-alumno-form"
            disabled={loading || !nombre.trim() || !apellidos.trim() || !selectedGrupoId || !selectedTutorId}
            className="rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Guardando...</span>
              </span>
            ) : (
              <span>Guardar Cambios</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarAlumnoDrawer;
