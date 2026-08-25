import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Edit, Trash2, UserCheck, Clock, X } from 'lucide-react';
import api from '../../api/axios';
import EditarUsuarioDrawer from '../../components/admin/EditarUsuarioDrawer';
import RegistrarUsuario from '../../components/admin/RegistrarUsuario';

const normalizeText = (value) => String(value ?? '').trim();

const getInitials = (nombre = '', apellido = '') => {
  const first = normalizeText(nombre).charAt(0);
  const second = normalizeText(apellido).charAt(0);

  return `${first}${second}`.toUpperCase() || 'U';
};

const getFullName = (user = {}) => {
  const nombre = normalizeText(user.nombre);
  const apellido = normalizeText(user.apellido || user.apellidos);
  return [nombre, apellido].filter(Boolean).join(' ') || 'Usuario sin nombre';
};

const GestionUsuarios = () => {
  const [activeTab, setActiveTab] = useState('docentes');
  const [docentes, setDocentes] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUsers = async () => {
    try {
      const [docentesResponse, tutoresResponse] = await Promise.all([
        api.get('/docentes'),
        api.get('/tutores'),
      ]);

      setDocentes(docentesResponse.data || []);
      setTutores(tutoresResponse.data || []);
    } catch (error) {
      console.error('Error al recargar usuarios:', error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);

      try {
        const [docentesResponse, tutoresResponse] = await Promise.all([
          api.get('/docentes'),
          api.get('/tutores'),
        ]);

        setDocentes(docentesResponse.data || []);
        setTutores(tutoresResponse.data || []);
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
        setDocentes([]);
        setTutores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const usersForTab = activeTab === 'docentes' ? docentes : tutores;

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return usersForTab;

    return usersForTab.filter((user) => {
      const nombre = getFullName(user).toLowerCase();
      const correo = normalizeText(user.correo || user.email).toLowerCase();
      const telefono = normalizeText(user.telefono).toLowerCase();

      if (activeTab === 'docentes') {
        return nombre.includes(query) || correo.includes(query);
      }

      return nombre.includes(query) || correo.includes(query) || telefono.includes(query);
    });
  }, [activeTab, searchTerm, usersForTab]);

  const currentRoleLabel = activeTab === 'docentes' ? 'docentes' : 'tutores';

  const handleDelete = async (user) => {
    const roleKey = activeTab === 'docentes' ? 'docentes' : 'tutores';
    const userId = user.id || user.id_docente || user.id_tutor;

    if (!userId) return;

    try {
      if (activeTab === 'docentes') {
        await api.delete(`/docentes/${userId}`);
        setDocentes((current) => current.filter((item) => (item.id || item.id_docente) !== userId));
      } else {
        await api.delete(`/tutores/${userId}`);
        setTutores((current) => current.filter((item) => (item.id || item.id_tutor) !== userId));
      }
    } catch (error) {
      console.error(`Error al eliminar ${roleKey}:`, error);
    }
  };

  const handleSaveUser = async (payload) => {
    const endpoint = activeTab === 'docentes' ? '/docentes' : '/tutores';
    const id = editingUser ? editingUser.id || editingUser.id_docente || editingUser.id_tutor : null;

    try {
      if (editingUser) {
        const response = await api.put(`${endpoint}/${id}`, payload);
        const updatedUser = response.data || payload;

        if (activeTab === 'docentes') {
          setDocentes((current) =>
            current.map((item) => ((item.id || item.id_docente) === id ? { ...item, ...updatedUser } : item))
          );
        } else {
          setTutores((current) =>
            current.map((item) => ((item.id || item.id_tutor) === id ? { ...item, ...updatedUser } : item))
          );
        }
      } else {
        const response = await api.post(endpoint, payload);
        const createdUser = response.data || payload;

        if (activeTab === 'docentes') {
          setDocentes((current) => [createdUser, ...current]);
        } else {
          setTutores((current) => [createdUser, ...current]);
        }
      }

      setEditingUser(null);
      setIsRegistering(false);
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    }
  };

  const renderRows = () => {
    if (loading) {
      return (
        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <span className="text-sm font-medium text-slate-500">Cargando usuarios...</span>
        </div>
      );
    }

    if (!filteredUsers.length) {
      return (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">
          <span className="text-base font-semibold text-slate-800">No se encontraron resultados</span>
          <span className="mt-2 text-sm text-slate-500">
            {searchTerm
              ? `No se encontraron resultados que coincidan con '${searchTerm}' en el listado de ${currentRoleLabel}`
              : `No hay usuarios registrados en el listado de ${currentRoleLabel}`}
          </span>
        </div>
      );
    }

    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            <tr>
              <th className="px-6 py-3 text-left">
                <span>USUARIO</span>
              </th>
              <th className="px-6 py-3 text-left">
                <span>{activeTab === 'docentes' ? 'CORREO' : 'CORREO ELECTRÓNICO'}</span>
              </th>
              {activeTab === 'tutores' && (
                <th className="px-6 py-3 text-left">
                  <span>TELÉFONO</span>
                </th>
              )}
              <th className="px-6 py-3 text-right">
                <span>ACCIONES</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredUsers.map((user) => {
              const fullName = getFullName(user);
              const correo = normalizeText(user.correo || user.email);
              const phone = normalizeText(user.telefono);
              const initials = getInitials(user.nombre, user.apellido || user.apellidos);
              const userId = user.id || user.id_docente || user.id_tutor;

              return (
                <tr key={userId} className="hover:bg-slate-50/50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
                        <span>{initials}</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold leading-tight text-slate-900">
                          <span>{fullName}</span>
                        </h3>
                      </div>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                    <span>{correo || '-'}</span>
                  </td>

                  {activeTab === 'tutores' && (
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      <span>{phone || '-'}</span>
                    </td>
                  )}

                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingUser(user)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
                        aria-label="Editar usuario"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(user)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                        aria-label="Eliminar usuario"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-5" translate="no">
      {editingUser && (
        <EditarUsuarioDrawer
          user={editingUser}
          role={activeTab}
          isOpen={Boolean(editingUser)}
          onClose={() => setEditingUser(null)}
          onSuccess={async () => {
            await refreshUsers();
            setEditingUser(null);
          }}
        />
      )}

      {isRegistering ? (
        <RegistrarUsuario
          rolInicial={activeTab === 'tutores' ? 'tutor' : 'docente'}
          onBack={() => {
            setIsRegistering(false);
            setEditingUser(null);
          }}
          onSuccess={async () => {
            await refreshUsers();
            setIsRegistering(false);
          }}
        />
      ) : (
        <>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-transparent p-1">
              {[
                { key: 'docentes', label: 'Docentes', count: docentes.length },
                { key: 'tutores', label: 'Tutores', count: tutores.length },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                    activeTab === key
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-slate-900'
                  }`}
                >
                  <span>{label}</span>
                  <span
                    className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] ${
                      activeTab === key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative block min-w-[220px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar usuario..."
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <button
                type="button"
                onClick={() => setIsRegistering(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>Registrar Nuevo Usuario</span>
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-1">
            {renderRows()}
          </div>
        </>
      )}
    </div>
  );
};

export default GestionUsuarios;