import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Edit3, Trash2, BookOpen, Loader2 } from 'lucide-react';
import api from '../../api/axios.js';
import MateriaModal from '../../components/admin/MateriaModal';

const getMateriaId = (materia) => materia?.id_materia || materia?.id;

const Materias = () => {
  const [materias, setMaterias] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMateria, setEditingMateria] = useState(null);

  useEffect(() => {
    const fetchMaterias = async () => {
      setLoading(true);

      try {
        const response = await api.get('/materias');
        setMaterias(response.data || []);
      } catch (error) {
        console.error('Error al cargar materias:', error);
        setMaterias([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterias();
  }, []);

  const filteredMaterias = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return materias;

    return materias.filter((materia) => {
      const nombre = String(materia?.nombre_materia || '').toLowerCase();
      return nombre.includes(query);
    });
  }, [materias, searchTerm]);

  const openCreateModal = () => {
    setEditingMateria(null);
    setIsModalOpen(true);
  };

  const openEditModal = (materia) => {
    setEditingMateria(materia);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMateria(null);
  };

  const handleSaveMateria = async (nombre) => {
    const cleanNombre = String(nombre || '').trim();
    if (!cleanNombre) return;

    try {
      if (editingMateria) {
        const materiaId = getMateriaId(editingMateria);
        if (!materiaId) return;

        const response = await api.put(`/materias/${materiaId}`, { nombre_materia: cleanNombre });
        const updated = response.data || { ...editingMateria, nombre_materia: cleanNombre };

        setMaterias((current) =>
          current.map((item) => (getMateriaId(item) === materiaId ? { ...item, ...updated } : item))
        );
      } else {
        const response = await api.post('/materias', { nombre_materia: cleanNombre });
        const created = response.data || { id: Date.now(), nombre_materia: cleanNombre };
        setMaterias((current) => [created, ...current]);
      }
    } catch (error) {
      console.error('Error al guardar materia:', error);
      throw error;
    }
  };

  const handleDeleteMateria = async (materia) => {
    const materiaId = getMateriaId(materia);
    if (!materiaId) return;

    const nombre = materia?.nombre_materia || materia?.nombre || 'esta materia';
    const shouldDelete = window.confirm(`¿Deseas eliminar ${nombre}?`);

    if (!shouldDelete) return;

    try {
      await api.delete(`/materias/${materiaId}`);
      setMaterias((current) => current.filter((item) => getMateriaId(item) !== materiaId));
    } catch (error) {
      console.error('Error al eliminar materia:', error);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Cargando materias...</span>
          </span>
        </div>
      );
    }

    if (filteredMaterias.length) {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredMaterias.map((materia) => {
            const materiaId = getMateriaId(materia);
            const nombre = materia?.nombre_materia || materia?.nombre || 'Materia';

            return (
              <div
                key={materiaId || nombre}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div>
                  <div className="w-fit rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                    <BookOpen className="h-5 w-5" />
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-slate-900">
                    <span>{nombre}</span>
                  </h3>
                </div>

                <div className="mt-6 flex items-center gap-4 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => openEditModal(materia)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-700"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteMateria(materia)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">
        <span className="text-base font-semibold text-slate-800">
          <span>No hay materias para mostrar</span>
        </span>
        <span className="mt-2 text-sm text-slate-500">
          <span>
            {searchTerm
              ? `No hay coincidencias para "${searchTerm}".`
              : 'Aún no hay asignaturas registradas en el catálogo.'}
          </span>
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-5" translate="no">
      <MateriaModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveMateria}
        materia={editingMateria}
      />

      <div className="mb-6 flex items-center justify-between gap-4">
        <label className="relative block w-full max-w-xs">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar materia..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Materia</span>
        </button>
      </div>

      {renderContent()}
    </div>
  );
};

export default Materias;
