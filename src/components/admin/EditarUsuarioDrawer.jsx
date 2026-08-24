import { useEffect, useState } from 'react';
import { Loader2, Lock, X } from 'lucide-react';
import api from '../../api/axios';

const EditarUsuarioDrawer = ({ user, role, isOpen, onClose, onSuccess }) => {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setNombreCompleto(`${user.nombre || ''} ${user.apellido || user.apellidos || ''}`.trim());
      setTelefono(user.telefono || '');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // 1. Obtener el ID correcto según la tabla
      const userId = user.id_tutor ?? user.id_docente ?? user.id_usuario ?? user.id;

      // 2. Separar nombre y apellidos para las columnas de la BD
      const partes = nombreCompleto.trim().split(' ');
      const nombre = partes[0] || '';
      const apellidos = partes.slice(1).join(' ') || '';

      const isTutor = role === 'tutores' || role === 'tutor' || user.id_tutor !== undefined;

      const payload = isTutor
        ? {
            nombre,
            apellidos,
            nombreCompleto,
            correo: user.correo || user.email || '',
            email: user.correo || user.email || '',
            telefono: telefono.trim(),
          }
        : {
            nombre,
            apellidos,
            nombreCompleto,
            correo: user.correo || user.email || '',
            email: user.correo || user.email || '',
          };

      const endpoint = isTutor ? `/tutores/${userId}` : `/docentes/${userId}`;
      await api.put(endpoint, payload);
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 h-screen w-screen overflow-hidden bg-slate-900/50 backdrop-blur-sm"
      translate="no"
    >
      <div className="flex h-full justify-end">
        <div className="flex h-full w-full max-w-md flex-col justify-between overflow-y-auto bg-white shadow-2xl">
          <div className="space-y-6 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  <span>Editar Información de Usuario</span>
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
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-base font-bold text-white">
                <span>{(nombreCompleto || 'U').charAt(0).toUpperCase()}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                <span>{nombreCompleto || 'Usuario'}</span>
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">
                  <span>Nombre Completo</span>
                </label>
                <input
                  type="text"
                  value={nombreCompleto}
                  onChange={(event) => setNombreCompleto(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">
                  <span>Correo Electrónico</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={user.correo || user.email || ''}
                    disabled
                    className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2.5 pr-10 text-sm font-medium text-slate-500"
                  />
                  <Lock className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  <span>El correo no puede modificarse por seguridad.</span>
                </p>
              </div>

              {(role === 'tutores' || role === 'tutor' || user.id_tutor !== undefined) && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">
                    <span>Teléfono de Contacto</span>
                  </label>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(event) => setTelefono(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-slate-100 bg-white p-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <span>Cancelar</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
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
    </div>
  );
};

export default EditarUsuarioDrawer;