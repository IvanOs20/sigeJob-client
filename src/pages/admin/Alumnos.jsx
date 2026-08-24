import { useEffect, useMemo, useState } from 'react';
import { Search, GraduationCap, Edit3, Trash2, ChevronDown, Check, X, Loader2 } from 'lucide-react';
import api from '../../api/axios.js';
import EditarAlumnoDrawer from '../../components/admin/EditarAlumnoDrawer';

const getGrupoId = (grupo) => grupo?.id_grupo || grupo?.id;
const getTutorId = (tutor) => tutor?.id_tutor || tutor?.id;
const getAlumnoId = (alumno) => alumno?.id_alumno || alumno?.id;

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

const getTutorIniciales = (tutor) => {
  const initials = getTutorNombre(tutor)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return initials || 'T';
};

const getInitials = (nombre = '', apellidos = '') => {
  const first = String(nombre || '').trim().charAt(0).toUpperCase();
  const second = String(apellidos || '').trim().charAt(0).toUpperCase();
  return `${first}${second}` || 'A';
};

const getAlumnoNombreCompleto = (alumno) => {
  const nombre = String(alumno?.nombre || '').trim();
  const apellidos = String(alumno?.apellidos || alumno?.apellido || '').trim();
  return `${nombre} ${apellidos}`.trim() || 'Alumno sin nombre';
};

const Alumnos = () => {
  const [listaAlumnos, setListaAlumnos] = useState([]);
  const [listaGrupos, setListaGrupos] = useState([]);
  const [listaTutores, setListaTutores] = useState([]);

  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [selectedGrupoId, setSelectedGrupoId] = useState('');
  const [selectedTutorId, setSelectedTutorId] = useState('');
  const [grupoQuery, setGrupoQuery] = useState('');
  const [tutorQuery, setTutorQuery] = useState('');
  const [isGrupoOpen, setIsGrupoOpen] = useState(false);
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [alumnoEditando, setAlumnoEditando] = useState(null);

  const fetchData = async () => {
    setLoading(true);

    try {
      const [alumnosResponse, gruposResponse, tutoresResponse] = await Promise.all([
        api.get('/alumnos'),
        api.get('/grupos'),
        api.get('/tutores'),
      ]);

      setListaAlumnos(alumnosResponse.data || []);
      setListaGrupos(gruposResponse.data || []);
      setListaTutores(tutoresResponse.data || []);
    } catch (error) {
      console.error('Error al cargar alumnos, grupos y tutores:', error);
      setListaAlumnos([]);
      setListaGrupos([]);
      setListaTutores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const gruposFiltrados = useMemo(() => {
    const query = grupoQuery.trim().toLowerCase();
    if (!query) return listaGrupos;

    return listaGrupos.filter((grupo) => getGrupoLabel(grupo).toLowerCase().includes(query));
  }, [listaGrupos, grupoQuery]);

  const tutoresFiltrados = useMemo(() => {
    const query = tutorQuery.trim().toLowerCase();
    if (!query) return listaTutores;

    return listaTutores.filter((tutor) => {
      const nombreCompleto = `${tutor?.nombre || ''} ${tutor?.apellido || tutor?.apellidos || ''}`.toLowerCase();
      const correo = (tutor?.correo || tutor?.email || '').toLowerCase();
      return nombreCompleto.includes(query) || correo.includes(query);
    });
  }, [listaTutores, tutorQuery]);

  const alumnosFiltrados = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return listaAlumnos;

    return listaAlumnos.filter((alumno) => {
      const id = String(getAlumnoId(alumno) || '').toLowerCase();
      const nombre = getAlumnoNombreCompleto(alumno).toLowerCase();
      return id.includes(query) || nombre.includes(query);
    });
  }, [listaAlumnos, searchTerm]);

  const selectedGrupo = useMemo(
    () => listaGrupos.find((grupo) => String(getGrupoId(grupo)) === String(selectedGrupoId)) || null,
    [listaGrupos, selectedGrupoId]
  );

  const selectedTutor = useMemo(
    () => listaTutores.find((tutor) => String(getTutorId(tutor)) === String(selectedTutorId)) || null,
    [listaTutores, selectedTutorId]
  );

  const getAlumnosPorGrupo = (grupo) => {
    const grupoId = getGrupoId(grupo);
    return listaAlumnos.filter((alumno) => String(alumno?.id_grupo || alumno?.grupo?.id_grupo || alumno?.grupo?.id) === String(grupoId)).length;
  };

  const getAlumnosPorTutor = (tutor) => {
    const tutorId = getTutorId(tutor);
    return listaAlumnos.filter((alumno) => String(alumno?.id_tutor || alumno?.tutor?.id_tutor || alumno?.tutor?.id) === String(tutorId)).length;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!nombre.trim() || !apellidos.trim() || !selectedGrupoId || !selectedTutorId) return;

    setCreating(true);

    try {
      await api.post('/alumnos', {
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        id_grupo: Number(selectedGrupoId),
        id_tutor: Number(selectedTutorId),
      });

      await fetchData();
      setNombre('');
      setApellidos('');
      setSelectedGrupoId('');
      setSelectedTutorId('');
      setGrupoQuery('');
      setTutorQuery('');
      setIsGrupoOpen(false);
      setIsTutorOpen(false);
    } catch (error) {
      console.error('Error al registrar alumno:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAlumno = async (alumno) => {
    const alumnoId = getAlumnoId(alumno);
    if (!alumnoId) return;

    const shouldDelete = window.confirm(`¿Deseas eliminar al alumno ${getAlumnoNombreCompleto(alumno)}?`);
    if (!shouldDelete) return;

    try {
      await api.delete(`/alumnos/${alumnoId}`);
      await fetchData();
    } catch (error) {
      console.error('Error al eliminar alumno:', error);
    }
  };

  const handleSelectGrupo = (grupo) => {
    setSelectedGrupoId(String(getGrupoId(grupo)));
    setGrupoQuery(getGrupoLabel(grupo));
    setIsGrupoOpen(false);
  };

  const handleSelectTutor = (tutor) => {
    setSelectedTutorId(String(getTutorId(tutor)));
    setTutorQuery(getTutorNombre(tutor));
    setIsTutorOpen(false);
  };

  return (
    <div className="space-y-6" translate="no">
      <EditarAlumnoDrawer
        isOpen={Boolean(alumnoEditando)}
        onClose={() => setAlumnoEditando(null)}
        onSuccess={async () => {
          await fetchData();
          setAlumnoEditando(null);
        }}
        alumno={alumnoEditando}
        grupos={listaGrupos}
        tutores={listaTutores}
        alumnos={listaAlumnos}
      />

      <div className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
          <GraduationCap className="h-5 w-5 text-blue-600" />
          <span>Registrar Alumno</span>
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="nombre-alumno" className="mb-1.5 block text-sm font-medium text-slate-600">
              <span>Nombre(s) *</span>
            </label>
            <input
              id="nombre-alumno"
              type="text"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              placeholder="Ej. Sofía"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              disabled={creating}
            />
          </div>

          <div>
            <label htmlFor="apellidos-alumno" className="mb-1.5 block text-sm font-medium text-slate-600">
              <span>Apellidos *</span>
            </label>
            <input
              id="apellidos-alumno"
              type="text"
              value={apellidos}
              onChange={(event) => setApellidos(event.target.value)}
              placeholder="Ej. Martínez Vega"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              disabled={creating}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              <span>Grupo Asignado *</span>
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsGrupoOpen(!isGrupoOpen)}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                disabled={creating}
              >
                <span>{selectedGrupo ? getGrupoLabel(selectedGrupo) : 'Seleccionar grupo...'}</span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isGrupoOpen ? 'rotate-180 text-blue-600' : ''}`} />
              </button>

              {isGrupoOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsGrupoOpen(false)} />

                  <div className="absolute left-0 top-full z-30 mt-1.5 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                    {gruposFiltrados.length ? (
                      gruposFiltrados.map((grupo) => {
                        const grupoId = getGrupoId(grupo);
                        const count = getAlumnosPorGrupo(grupo);
                        const selected = String(grupoId) === String(selectedGrupoId);

                        return (
                          <button
                            key={grupoId}
                            type="button"
                            onClick={() => handleSelectGrupo(grupo)}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${
                              selected ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-sm font-semibold">{getGrupoLabel(grupo)}</span>
                            <span className={`text-xs ${selected ? 'text-blue-100' : 'text-slate-500'}`}>
                              <span>{count} alumnos</span>
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-2.5 py-2 text-sm text-slate-500">
                        <span>No se encontraron grupos</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              <span>Tutor Responsable *</span>
            </label>

            {selectedTutor ? (
              <div className="flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50/50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    <span>{getTutorIniciales(selectedTutor)}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold leading-tight text-slate-900">
                      <span>{getTutorNombre(selectedTutor)}</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      <span>{getTutorCorreo(selectedTutor)}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedTutorId('');
                    setTutorQuery('');
                    setIsTutorOpen(true);
                  }}
                  className="rounded-full p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                  title="Desmarcar tutor"
                  aria-label="Desmarcar tutor"
                  disabled={creating}
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
                    setIsTutorOpen(true);
                  }}
                  onFocus={() => setIsTutorOpen(true)}
                  placeholder="Buscar tutor por nombre o correo..."
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  disabled={creating}
                />

                {isTutorOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsTutorOpen(false)} />

                    <div className="absolute left-0 top-full z-20 mt-1.5 w-full max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                      {tutoresFiltrados.length ? (
                        tutoresFiltrados.map((tutor) => {
                          const tutorId = getTutorId(tutor);
                          const selected = String(tutorId) === String(selectedTutorId);
                          const cantidad = getAlumnosPorTutor(tutor);

                          return (
                            <button
                              key={tutorId}
                              type="button"
                              onClick={() => handleSelectTutor(tutor)}
                              className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition ${
                                selected ? 'bg-slate-100' : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                                <span>{getTutorIniciales(tutor)}</span>
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-800">
                                  <span>{getTutorNombre(tutor)}</span>
                                </p>
                                <p className="truncate text-xs text-slate-500">
                                  <span>{getTutorCorreo(tutor)}</span>
                                </p>
                              </div>

                              <span className="text-xs text-slate-500">
                                <span>{`Tutor de ${cantidad} alumno(s)`}</span>
                              </span>
                            </button>
                          );
                        })
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

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={creating || !nombre.trim() || !apellidos.trim() || !selectedGrupoId || !selectedTutorId}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Registrando...</span>
                </span>
              ) : (
                <>
                  <PlusIcon />
                  <span>Registrar Alumno</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <span>Lista de Alumnos</span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
              <span>{listaAlumnos.length}</span>
            </span>
          </h2>

          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nombre o ID..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Cargando alumnos...</span>
            </span>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full table-fixed text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                <tr>
                  <th className="w-16 px-5 py-3">
                    <span>#ID</span>
                  </th>
                  <th className="w-2/5 px-5 py-3">
                    <span>ALUMNO</span>
                  </th>
                  <th className="w-1/5 px-5 py-3">
                    <span>GRUPO</span>
                  </th>
                  <th className="w-1/4 px-5 py-3">
                    <span>TUTOR</span>
                  </th>
                  <th className="w-24 px-5 py-3 text-right">
                    <span>ACCIONES</span>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
              {alumnosFiltrados.length ? (
                alumnosFiltrados.map((alumno) => {
                  const alumnoId = getAlumnoId(alumno);
                  const grupo = listaGrupos.find((grupoItem) => String(getGrupoId(grupoItem)) === String(alumno?.id_grupo || alumno?.grupo?.id_grupo || alumno?.grupo?.id)) || null;
                  const tutor = listaTutores.find((tutorItem) => String(getTutorId(tutorItem)) === String(alumno?.id_tutor || alumno?.tutor?.id_tutor || alumno?.tutor?.id)) || null;

                  return (
                    <tr key={alumnoId} className="hover:bg-slate-50/50">
                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-700">{`#${alumnoId}`}</span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
                            <span>{getInitials(alumno?.nombre, alumno?.apellidos || alumno?.apellido)}</span>
                          </div>

                          <div>
                            <p className="text-base font-bold text-slate-900">
                              <span>{getAlumnoNombreCompleto(alumno)}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-xl bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                          <span>{grupo ? getGrupoLabel(grupo) : 'Sin grupo'}</span>
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-slate-700">
                          <span>{tutor ? getTutorNombre(tutor) : 'Sin tutor'}</span>
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setAlumnoEditando(alumno)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
                            aria-label="Editar alumno"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteAlumno(alumno)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-500 transition hover:bg-rose-100"
                            aria-label="Eliminar alumno"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <span className="text-sm text-slate-500">No se encontraron alumnos.</span>
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export default Alumnos;
