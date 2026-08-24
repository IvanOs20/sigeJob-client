import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';

const MateriaModal = ({ isOpen, onClose, onSave, materia }) => {
  const [nombreMateria, setNombreMateria] = useState(materia?.nombre_materia || materia?.nombre || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setNombreMateria(materia?.nombre_materia || materia?.nombre || '');
  }, [materia, isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onSave?.(nombreMateria);
      setNombreMateria('');
      onClose?.();
    } finally {
      setSubmitting(false);
    }
  };

  const submitLabel = materia ? 'Guardar Cambios' : '+ Agregar Materia';

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      translate="no"
    >
      <div className="w-full max-w-md space-y-5 rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-0 top-0 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Cerrar"
            disabled={submitting}
          >
            <X className="h-5 w-5" />
          </button>

          <h2 className="pr-10 text-lg font-bold text-slate-900">
            <span>{materia ? 'Editar Materia' : 'Nueva Materia'}</span>
          </h2>

          {!materia && (
            <p className="mt-0.5 text-xs text-slate-400">
              <span>Agrega una asignatura al plan de estudios</span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nombre-materia" className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">
              <span>Nombre de la Materia *</span>
            </label>
            <input
              id="nombre-materia"
              type="text"
              value={nombreMateria}
              onChange={(event) => setNombreMateria(event.target.value)}
              placeholder="Ej. Ciencias Naturales"
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              required
              disabled={submitting}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-2xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
            >
              <span>Cancelar</span>
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Guardando...</span>
                </span>
              ) : (
                <span>{submitLabel}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MateriaModal;
