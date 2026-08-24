import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Mail, ShieldCheck } from 'lucide-react';
import api from '../../api/axios';

const RegistrarUsuario = ({ onBack, onSuccess }) => {
  const [tipoUsuario, setTipoUsuario] = useState('docente');
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNombre('');
    setApellidos('');
    setEmail('');
    setTelefono('');
    setMensajeError('');
    setMensajeExito('');
  }, [tipoUsuario]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMensajeError('');
    setMensajeExito('');
    setLoading(true);

    const isDocente = tipoUsuario === 'docente';
    const endpoint = isDocente ? '/docentes' : '/tutores';
    const payload = isDocente
      ? {
          nombre: nombre.trim(),
          apellidos: apellidos.trim(),
          email: email.trim(),
        }
      : {
          nombre: nombre.trim(),
          apellidos: apellidos.trim(),
          telefono: telefono.trim(),
          email: email.trim(),
        };

    try {
      await api.post(endpoint, payload);
      setMensajeExito('¡Usuario registrado con éxito! Correo de activación enviado.');
      setNombre('');
      setApellidos('');
      setEmail('');
      setTelefono('');

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      const msg =
        error.response?.data?.message ||
        'Error al registrar el usuario. Revisa que todos los campos estén completos.';
      setMensajeError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl pb-8" translate="no">
      <div className="mb-6 flex items-center justify-start">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver a Usuarios</span>
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <span className="block text-3xl font-bold text-slate-900">
            <span>Registrar Nuevo Usuario</span>
          </span>
          <span className="mt-2 block text-sm text-slate-500">
            <span>Complete los datos del nuevo usuario. Se le enviará un correo de activación automática.</span>
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <span>PASO 1 — SELECCIONAR ROL</span>
            </span>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  value: 'docente',
                  title: 'Docente',
                  description: 'Acceso a grupos, alumnos y registro de calificaciones.',
                  icon: <ShieldCheck className="h-6 w-6" />,
                },
                {
                  value: 'tutor',
                  title: 'Tutor / Padre de Familia',
                  description: 'Consulta de boletas y seguimiento del alumno a cargo.',
                  icon: <Mail className="h-6 w-6" />,
                },
              ].map(({ value, title, description, icon }) => {
                const isSelected = tipoUsuario === value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTipoUsuario(value)}
                    className={`relative rounded-2xl border p-5 text-left transition ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-sm ring-2 ring-blue-100'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          {icon}
                        </div>
                        <div>
                          <span className="block text-lg font-bold text-slate-900">
                            <span>{title}</span>
                          </span>
                          <span className="block text-sm text-slate-500">
                            <span>{description}</span>
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <span>PASO 2 — DATOS DEL USUARIO</span>
            </span>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label htmlFor="nombre" className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">
                  <span>Nombre(s) *</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  value={nombre}
                  onChange={(event) => setNombre(event.target.value)}
                  placeholder="Ej. Carlos"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div className="sm:col-span-1">
                <label htmlFor="apellidos" className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">
                  <span>Apellidos *</span>
                </label>
                <input
                  type="text"
                  id="apellidos"
                  value={apellidos}
                  onChange={(event) => setApellidos(event.target.value)}
                  placeholder="Ej. Pérez López"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div className="sm:col-span-1">
                <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">
                  <span>Correo Electrónico *</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="correo@escuela.edu.mx"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              {tipoUsuario === 'tutor' && (
                <div className="sm:col-span-1">
                  <label htmlFor="telefono" className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">
                    <span>Teléfono *</span>
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    value={telefono}
                    onChange={(event) => setTelefono(event.target.value)}
                    placeholder="55 0000-0000"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                  <span className="mt-1 block text-[11px] text-slate-400">10 dígitos</span>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              <span>
                Al guardar, se enviará un correo automatizado vía Nodemailer con un token único de activación para que el usuario establezca su contraseña. Su estado inicial será Pendiente.
              </span>
            </div>

            {mensajeError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <span>{mensajeError}</span>
              </div>
            )}

            {mensajeExito && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                <span>{mensajeExito}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <span>Cancelar</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              <span>{loading ? 'Registrando...' : 'Registrar Usuario'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrarUsuario;
