import { useEffect, useMemo, useState } from 'react';
import { Loader2, Search, X, ChevronDown, Check } from 'lucide-react';
import api from '../../api/axios';

const gradosDisponibles = ['1°', '2°', '3°', '4°', '5°', '6°'];

const getDocenteId = (docente) => docente?.id_docente || docente?.id;

const getDocenteNombre = (docente) => {
  const nombre = String(docente?.nombre || '').trim();
  const apellido = String(docente?.apellido || docente?.apellidos || '').trim();
  const fullName = `${nombre} ${apellido}`.trim();

  return fullName || String(docente?.nombre_completo || docente?.correo || 'Docente');
};

const getDocenteInitials = (docente) => {
  const fullName = getDocenteNombre(docente)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('');

  return fullName.toUpperCase() || 'D';
};

const getDocenteStatus = (docente) => {
  const tbGrupo = docente?.tb_grupo;

  if (tbGrupo && tbGrupo.grado && tbGrupo.grupo) {
    const gradoFormateado = String(tbGrupo.grado).includes('°')
      ? tbGrupo.grado
      : `${tbGrupo.grado}°`;
    const grupoLetra = String(tbGrupo.grupo).toUpperCase();

    return `Titular en ${gradoFormateado} ${grupoLetra}`;
  }

  return 'Sin grupo asignado';
};

const EditarGrupoDrawer = ({ isOpen, onClose, onSuccess, grupo, docentes = [], alumnosCount = 0 }) => {
  const [grado, setGrado] = useState('1°');
  const [isGradoOpen, setIsGradoOpen] = useState(false);
  const [letraGrupo, setLetraGrupo] = useState('');
  const [selectedDocente, setSelectedDocente] = useState(null);
  const [searchTermDocente, setSearchTermDocente] = useState('');
  const [showDocentesDropdown, setShowDocentesDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!grupo) return;

    const currentDocenteId = grupo?.id_docente || grupo?.docente?.id_docente || grupo?.docente?.id;
    const currentDocente = docentes.find((docente) => getDocenteId(docente) === currentDocenteId) || null;

    setGrado(String(grupo?.grado || '1°'));
    setLetraGrupo(String(grupo?.grupo || '').toUpperCase());
    setSelectedDocente(currentDocente);
    setSearchTermDocente(currentDocente ? getDocenteNombre(currentDocente) : '');
    setShowDocentesDropdown(false);
  }, [grupo, docentes, isOpen]);

  const filteredDocentes = useMemo(() => {
    const query = searchTermDocente.trim().toLowerCase();

    if (!query) return docentes;

    return docentes.filter((docente) => getDocenteNombre(docente).toLowerCase().includes(query));
  }, [docentes, searchTermDocente]);

  const previewGrupo = `${grado || ''} ${String(letraGrupo || '').toUpperCase()}`.trim();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!grupo?.id_grupo) return;

    setSubmitting(true);

    try {
      await api.put(`/grupos/${grupo.id_grupo}`, {
        grado,
        grupo: String(letraGrupo || '').toUpperCase(),
        id_docente: selectedDocente?.id_docente || selectedDocente?.id || null,
      });

      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error('Error al actualizar grupo:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectDocente = (docente) => {
    setSelectedDocente(docente);
    setSearchTermDocente(getDocenteNombre(docente));
    setShowDocentesDropdown(false);
  };

  const handleChangeSearchDocente = (event) => {
    const value = event.target.value;

    if (selectedDocente) {
      setSelectedDocente(null);
    }

    setSearchTermDocente(value);
    setShowDocentesDropdown(true);
  };

  const handleClearSelectedDocente = () => {
    setSelectedDocente(null);
    setSearchTermDocente('');
    setShowDocentesDropdown(true);
  };

  if (!isOpen || !grupo) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 h-screen w-screen overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end"
      translate="no"
    >
      <div
        className="flex w-full max-w-md flex-col justify-between overflow-y-auto bg-white shadow-2xl"
      >
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                <span>Editar Grupo</span>
              </h2>
              <p className="text-xs text-slate-400">
                <span>Los cambios se aplican inmediatamente</span>
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

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-base font-bold text-white">
                <span>{previewGrupo || 'G'}</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  <span>{grupo?.nombre_grupo || `Grupo ${previewGrupo}`}</span>
                </h3>

                <div className="mt-1 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  <span>{`• ${alumnosCount} Alumnos`}</span>
                </div>
              </div>
            </div>
          </div>

          <form id="editar-grupo-form" onSubmit={handleSubmit} className="space-y-6">
            <section className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span>Identificador de Grupo</span>
              </h4>

              <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-3">
                <div>
                  <label htmlFor="grado" className="mb-1.5 block text-xs font-semibold text-slate-500">
                    <span>Grado</span>
                  </label>
                  <div className="relative w-28">
                    <button
                      type="button"
                      onClick={() => setIsGradoOpen(!isGradoOpen)}
                      className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      disabled={submitting}
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
                  <label htmlFor="grupo-letra" className="mb-1.5 block text-xs font-semibold text-slate-500">
                    <span>Grupo</span>
                  </label>
                  <input
                    id="grupo-letra"
                    type="text"
                    value={letraGrupo}
                    onChange={(event) => setLetraGrupo(event.target.value.toUpperCase())}
                    maxLength={2}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold uppercase text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    disabled={submitting}
                  />
                </div>

                <div className="mb-0.5 inline-flex min-w-[72px] items-center justify-center rounded-xl bg-blue-50 px-3 py-2.5 text-sm font-bold text-blue-600">
                  <span>{previewGrupo || '--'}</span>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span>REASIGNAR DOCENTE TITULAR</span>
              </h4>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={selectedDocente ? getDocenteNombre(selectedDocente) : searchTermDocente}
                  onChange={handleChangeSearchDocente}
                  onFocus={() => setShowDocentesDropdown(true)}
                  placeholder="Buscar docente titular..."
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  disabled={submitting}
                />

                {selectedDocente && (
                  <button
                    type="button"
                    onClick={handleClearSelectedDocente}
                    className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Limpiar docente seleccionado"
                    disabled={submitting}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {showDocentesDropdown && filteredDocentes.length > 0 && !selectedDocente && (
                  <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                    {filteredDocentes.map((docente, index) => {
                      const docenteId = getDocenteId(docente);
                      const tieneOtroGrupo = Boolean(
                        docente?.tb_grupo &&
                        docente.tb_grupo.id_grupo &&
                        docente.tb_grupo.id_grupo !== grupo?.id_grupo
                      );

                      return (
                        <button
                          key={`docente-opt-${docenteId || index}-${index}`}
                          type="button"
                          disabled={submitting || tieneOtroGrupo}
                          onClick={() => handleSelectDocente(docente)}
                          className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition ${
                            tieneOtroGrupo
                              ? 'cursor-not-allowed opacity-50 bg-slate-50'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                              <span>{getDocenteInitials(docente)}</span>
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                <span>{getDocenteNombre(docente)}</span>
                              </p>
                              <p className="text-xs text-slate-500">
                                <span>{getDocenteStatus(docente)}</span>
                              </p>
                            </div>
                          </div>

                          {tieneOtroGrupo && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                              Ocupado
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {showDocentesDropdown && !filteredDocentes.length && !selectedDocente && (
                  <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-500 shadow-xl">
                    <span>No se encontraron docentes</span>
                  </div>
                )}
              </div>
            </section>
          </form>
        </div>

        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-slate-100 bg-white p-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            disabled={submitting}
          >
            <span>Cancelar</span>
          </button>

          <button
            type="submit"
            form="editar-grupo-form"
            disabled={submitting}
            className="rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? (
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

export default EditarGrupoDrawer;