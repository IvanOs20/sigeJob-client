import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Plus, Edit3, Trash2, Users, Check, X, Loader2, ChevronDown } from 'lucide-react';
import api from '../../api/axios.js';
import EditarGrupoDrawer from '../../components/admin/EditarGrupoDrawer';

const gradosDisponibles = ['1°', '2°', '3°', '4°', '5°', '6°'];

const getGrupoId = (grupo) => grupo?.id_grupo || grupo?.id;
const getDocenteId = (docente) => docente?.id_docente || docente?.id;

const getDocenteNombre = (docente) => {
  const nombre = String(docente?.nombre || '').trim();
  const apellido = String(docente?.apellido || docente?.apellidos || '').trim();
  const fullName = `${nombre} ${apellido}`.trim();

  return fullName || String(docente?.nombre_completo || docente?.correo || 'Docente');
};

const getDocenteIniciales = (docente) => {
  const initials = getDocenteNombre(docente)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return initials || 'D';
};

const getGrupoLabel = (grupo) => {
  const grado = String(grupo?.grado || '').trim();
  const letra = String(grupo?.grupo || '').trim().toUpperCase();
  return `${grado} ${letra}`.trim() || 'Sin grupo';
};

const Grupos = () => {
  const [listaGrupos, setListaGrupos] = useState([]);
  const [listaDocentes, setListaDocentes] = useState([]);
  const [listaAlumnos, setListaAlumnos] = useState([]);

  const [grado, setGrado] = useState('1°');
  const [isGradoOpen, setIsGradoOpen] = useState(false);
  const [letraGrupo, setLetraGrupo] = useState('');
  const [selectedDocente, setSelectedDocente] = useState(null);
  const [docenteQuery, setDocenteQuery] = useState('');
  const [isOpenDocenteDropdown, setIsOpenDocenteDropdown] = useState(false);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [grupoAEditar, setGrupoAEditar] = useState(null);

  const docenteDropdownRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);

    try {
      const [gruposResponse, docentesResponse, alumnosResponse] = await Promise.all([
        api.get('/grupos'),
        api.get('/docentes'),
        api.get('/alumnos'),
      ]);

      setListaGrupos(gruposResponse.data || []);
      setListaDocentes(docentesResponse.data || []);
      setListaAlumnos(alumnosResponse.data || []);
    } catch (error) {
      console.error('Error al cargar grupos/docentes/alumnos:', error);
      setListaGrupos([]);
      setListaDocentes([]);
      setListaAlumnos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!docenteDropdownRef.current) return;
      if (docenteDropdownRef.current.contains(event.target)) return;

      setIsOpenDocenteDropdown(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const docentesFiltrados = useMemo(() => {
    const query = docenteQuery.trim().toLowerCase();
    if (!query) return listaDocentes;

    return listaDocentes.filter((docente) => getDocenteNombre(docente).toLowerCase().includes(query));
  }, [listaDocentes, docenteQuery]);

  const docenteTitularByGrupoId = useMemo(() => {
    const map = new Map();

    listaGrupos.forEach((grupo) => {
      const grupoId = getGrupoId(grupo);
      const docenteId = grupo?.id_docente || grupo?.docente?.id_docente || grupo?.docente?.id;
      const docenteAsignado =
        listaDocentes.find((docente) => getDocenteId(docente) === docenteId) || grupo?.docente || null;

      map.set(grupoId, docenteAsignado);
    });

    return map;
  }, [listaGrupos, listaDocentes]);

  const getStatusDocente = (docente) => {
    const docenteId = getDocenteId(docente);
    const grupoAsignado = listaGrupos.find(
      (grupoItem) => (grupoItem?.id_docente || grupoItem?.docente?.id_docente || grupoItem?.docente?.id) === docenteId
    );

    if (grupoAsignado) {
      return `Titular en ${getGrupoLabel(grupoAsignado)}`;
    }

    return 'Sin grupo asignado';
  };

  const calcularCantidadAlumnos = (grupo) => {
    const grupoId = getGrupoId(grupo);
    return listaAlumnos.filter((alumno) => (alumno?.id_grupo || alumno?.grupo?.id_grupo) === grupoId).length;
  };

  const clearSelectedDocente = () => {
    setSelectedDocente(null);
    setDocenteQuery('');
    setIsOpenDocenteDropdown(true);
  };

  const handleSubmitNuevoGrupo = async (event) => {
    event.preventDefault();

    const letraNormalizada = String(letraGrupo || '').trim().toUpperCase();
    if (!letraNormalizada) return;

    setCreating(true);

    try {
      await api.post('/grupos', {
        grado,
        grupo: letraNormalizada,
        id_docente: selectedDocente?.id_docente || selectedDocente?.id || null,
      });

      await fetchData();
      setGrado('1°');
      setLetraGrupo('');
      setSelectedDocente(null);
      setDocenteQuery('');
      setIsOpenDocenteDropdown(false);
    } catch (error) {
      console.error('Error al crear grupo:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGrupo = async (grupo) => {
    const grupoId = getGrupoId(grupo);
    if (!grupoId) return;

    const shouldDelete = window.confirm(`¿Deseas eliminar el grupo ${getGrupoLabel(grupo)}?`);
    if (!shouldDelete) return;

    try {
      await api.delete(`/grupos/${grupoId}`);
      await fetchData();
    } catch (error) {
      console.error('Error al eliminar grupo:', error);
    }
  };

  return (
    <div className="space-y-5" translate="no">
      <EditarGrupoDrawer
        isOpen={Boolean(grupoAEditar)}
        onClose={() => setGrupoAEditar(null)}
        onSuccess={async () => {
          await fetchData();
          setGrupoAEditar(null);
        }}
        grupo={grupoAEditar}
        docentes={listaDocentes}
        alumnosCount={grupoAEditar ? calcularCantidadAlumnos(grupoAEditar) : 0}
      />

      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xs font-semibold uppercase text-slate-400">
          <span>CREAR NUEVO GRUPO</span>
        </h2>

        <form onSubmit={handleSubmitNuevoGrupo} className="grid items-end gap-3 lg:grid-cols-[110px_90px_1fr_auto]">
          <div>
            <label htmlFor="grado-nuevo" className="mb-1.5 block text-sm text-slate-500">
              <span>Grado</span>
            </label>

            <div className="relative w-28">
              <button
                type="button"
                onClick={() => setIsGradoOpen(!isGradoOpen)}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                disabled={creating}
              >
                <span>{grado}</span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                    isGradoOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>

              {isGradoOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsGradoOpen(false)} />

                  <div className="absolute left-0 top-full z-30 mt-1.5 w-full rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2">
                    {gradosDisponibles.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setGrado(option);
                          setIsGradoOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition ${
                          grado === option ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>{option}</span>
                        {grado === option && <Check className="h-4 w-4" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="grupo-nuevo" className="mb-1.5 block text-sm text-slate-500">
              <span>Grupo</span>
            </label>
            <input
              id="grupo-nuevo"
              type="text"
              value={letraGrupo}
              onChange={(event) => setLetraGrupo(event.target.value.toUpperCase())}
              placeholder="A"
              maxLength={2}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold uppercase text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              disabled={creating}
              required
            />
          </div>

          <div ref={docenteDropdownRef} className="relative">
            <label htmlFor="docente-nuevo" className="mb-1.5 block text-sm text-slate-500">
              <span>Docente Titular</span>
            </label>
            <Search className="pointer-events-none absolute left-4 top-[43px] h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="docente-nuevo"
              type="text"
              value={selectedDocente ? getDocenteNombre(selectedDocente) : docenteQuery}
              onChange={(event) => {
                const value = event.target.value;
                if (selectedDocente) setSelectedDocente(null);
                setDocenteQuery(value);
                setIsOpenDocenteDropdown(true);
              }}
              onFocus={() => setIsOpenDocenteDropdown(true)}
              placeholder="Buscar docente por nombre..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-11 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              disabled={creating}
            />

            {selectedDocente && (
              <button
                type="button"
                onClick={clearSelectedDocente}
                className="absolute right-2 top-[43px] inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Limpiar docente seleccionado"
                disabled={creating}
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {isOpenDocenteDropdown && !selectedDocente && (
              <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                {docentesFiltrados.length ? (
                  docentesFiltrados.map((docente) => {
                    const docenteId = getDocenteId(docente);

                    return (
                      <button
                        key={docenteId}
                        type="button"
                        onClick={() => {
                          setSelectedDocente(docente);
                          setDocenteQuery(getDocenteNombre(docente));
                          setIsOpenDocenteDropdown(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition hover:bg-slate-50"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                          <span>{getDocenteIniciales(docente)}</span>
                        </div>

                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800">
                            <span>{getDocenteNombre(docente)}</span>
                          </p>
                          <p className="text-xs text-slate-500">
                            <span>{getStatusDocente(docente)}</span>
                          </p>
                        </div>

                        <Check className="h-4 w-4 text-transparent" />
                      </button>
                    );
                  })
                ) : (
                  <div className="px-2.5 py-2 text-sm text-slate-500">
                    <span>No se encontraron docentes</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {creating ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creando...</span>
              </span>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Crear Grupo</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Cargando grupos...</span>
            </span>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-white text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              <tr>
                <th className="px-4 py-3">
                  <span>GRUPO</span>
                </th>
                <th className="px-4 py-3">
                  <span>DOCENTE TITULAR</span>
                </th>
                <th className="px-4 py-3">
                  <span>ALUMNOS</span>
                </th>
                <th className="px-4 py-3 text-right">
                  <span>ACCIONES</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {listaGrupos.length ? (
                listaGrupos.map((grupo) => {
                  const grupoId = getGrupoId(grupo);
                  const docenteAsignado = docenteTitularByGrupoId.get(grupoId);
                  const alumnosCount = calcularCantidadAlumnos(grupo);

                  return (
                    <tr key={grupoId} className="hover:bg-slate-50/40">
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-xl bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                          <span>{getGrupoLabel(grupo)}</span>
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {docenteAsignado ? (
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                              <span>{getDocenteIniciales(docenteAsignado)}</span>
                            </div>
                            <span className="font-medium text-slate-800">
                              <span>{getDocenteNombre(docenteAsignado)}</span>
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">
                            <span>Sin titular asignado</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          <Users className="h-3.5 w-3.5" />
                          <span>{alumnosCount}</span>
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setGrupoAEditar(grupo)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            aria-label="Editar grupo"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteGrupo(grupo)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-rose-300 transition hover:bg-rose-50 hover:text-rose-500"
                            aria-label="Eliminar grupo"
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
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <span className="text-sm text-slate-500">
                      <span>No hay grupos registrados.</span>
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Grupos;
