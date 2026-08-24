import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Trash2, Loader2 } from 'lucide-react';
import api from '../../api/axios.js';
import InscribirMateriasDrawer from '../../components/admin/InscribirMateriasDrawer';
import BajaMateriasDrawer from '../../components/admin/BajaMateriasDrawer';

const getAlumnoId = (alumno) => alumno?.id_alumno || alumno?.id;
const getGrupoLabel = (alumno) => {
  const grupo = alumno?.grupo || alumno?.tb_grupo || {};
  const grado = String(grupo?.grado || alumno?.grado || '').trim();
  const letra = String(grupo?.grupo || alumno?.grupo_letra || alumno?.letra || '').trim().toUpperCase();
  return `${grado} ${letra}`.trim() || 'Sin grupo';
};

const getTutorNombre = (alumno) => {
  const tutor = alumno?.tutor || alumno?.tb_tutor || null;
  const nombre = String(tutor?.nombre || alumno?.nombre_tutor || '').trim();
  const apellido = String(tutor?.apellido || tutor?.apellidos || alumno?.apellidos_tutor || '').trim();
  const nombreCompleto = `${nombre} ${apellido}`.trim();
  return nombreCompleto || String(tutor?.correo || tutor?.email || 'Sin tutor').trim();
};

const getAlumnoNombreCompleto = (alumno) => {
  const nombre = String(alumno?.nombre || '').trim();
  const apellidos = String(alumno?.apellidos || alumno?.apellido || '').trim();
  return `${nombre} ${apellidos}`.trim() || 'Alumno sin nombre';
};

const getInitials = (nombre = '', apellidos = '') => {
  const n = nombre ? String(nombre).trim().charAt(0) : '';
  const a = apellidos ? String(apellidos).trim().charAt(0) : '';
  return (n + a).toUpperCase() || 'AL';
};

const AltasMaterias = () => {
  const [listaAlumnos, setListaAlumnos] = useState([]);
  const [listaMaterias, setListaMaterias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [showInscribirDrawer, setShowInscribirDrawer] = useState(false);
  const [showBajaDrawer, setShowBajaDrawer] = useState(false);

  const cargarTodo = async () => {
    setLoading(true);

    try {
      const [resAlumnos, resMaterias] = await Promise.allSettled([
        api.get('/alumnos'),
        api.get('/materias'),
      ]);

      if (resAlumnos.status === 'fulfilled') {
        setListaAlumnos(Array.isArray(resAlumnos.value.data) ? resAlumnos.value.data : []);
      }

      if (resMaterias.status === 'fulfilled') {
        setListaMaterias(Array.isArray(resMaterias.value.data) ? resMaterias.value.data : []);
      }
    } catch (err) {
      console.error('Error al recargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  const alumnosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return listaAlumnos;

    const q = busqueda.toLowerCase().trim();

    return listaAlumnos.filter((alumno) => {
      const idStr = String(alumno.id_alumno || '');
      const nombreCompleto = `${alumno.nombre || ''} ${alumno.apellidos || ''}`.toLowerCase();
      return idStr.includes(q) || nombreCompleto.includes(q);
    });
  }, [listaAlumnos, busqueda]);

  const handleCloseInscribir = () => setShowInscribirDrawer(false);
  const handleCloseBaja = () => setShowBajaDrawer(false);

  const renderTable = () => {
    if (loading) {
      return (
        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Cargando alumnos...</span>
          </span>
        </div>
      );
    }

    return (
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full table-fixed text-left text-sm text-slate-600">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-400">
            <tr>
              <th className="w-20 px-6 py-3">
                <span>#ID</span>
              </th>
              <th className="w-2/5 px-6 py-3">
                <span>ALUMNO</span>
              </th>
              <th className="w-1/4 px-6 py-3">
                <span>GRUPO</span>
              </th>
              <th className="w-1/3 px-6 py-3">
                <span>TUTOR</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-xs text-slate-400">
                  <span>Cargando datos...</span>
                </td>
              </tr>
            ) : alumnosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-xs text-slate-400">
                  <span>No hay alumnos para mostrar</span>
                </td>
              </tr>
            ) : (
              alumnosFiltrados.map((alumno) => (
                <tr key={alumno?.id_alumno} className="hover:bg-slate-50/50">
                  <td className="w-20 px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-400">
                    <span>{`#${String(alumno?.id_alumno || 0).padStart(3, '0')}`}</span>
                  </td>

                  <td className="w-2/5 px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                        <span>{getInitials(alumno?.nombre, alumno?.apellidos)}</span>
                      </div>
                      <h3 className="text-sm font-bold leading-tight text-slate-900">
                        <span>{`${alumno?.nombre || ''} ${alumno?.apellidos || ''}`.trim()}</span>
                      </h3>
                    </div>
                  </td>

                  <td className="w-1/4 px-6 py-4 whitespace-nowrap">
                    {alumno?.tb_grupo ? (
                      <span className="inline-flex items-center rounded-xl bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                        {`${alumno.tb_grupo.grado}° ${alumno.tb_grupo.grupo}`}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">
                        <span>Sin grupo</span>
                      </span>
                    )}
                  </td>

                  <td className="w-1/3 px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <span>
                      {alumno?.tb_tutore
                        ? `${alumno.tb_tutore.nombre || ''} ${alumno.tb_tutore.apellidos || ''}`.trim()
                        : 'Sin tutor'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6" translate="no">
      <InscribirMateriasDrawer
        isOpen={showInscribirDrawer}
        onClose={handleCloseInscribir}
        onSuccess={cargarTodo}
        alumnos={listaAlumnos}
        materias={listaMaterias}
      />

      <BajaMateriasDrawer
        isOpen={showBajaDrawer}
        onClose={handleCloseBaja}
        onSuccess={cargarTodo}
        alumnos={listaAlumnos}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-8">
        <button
          type="button"
          onClick={() => setShowInscribirDrawer(true)}
          className="group flex w-full items-center rounded-2xl border border-blue-600 bg-white px-5 py-6 text-left shadow-sm transition hover:bg-blue-50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-600 bg-blue-50 text-blue-600">
            <Plus className="h-6 w-6" />
          </div>

          <div className="ml-5">
            <div className="text-2xl font-bold text-blue-700">
              <span>Inscribir</span>
            </div>
            <div className="mt-1 text-sm text-slate-600">
              <span>Inscribir o agregar materias a la carga de un alumno</span>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setShowBajaDrawer(true)}
          className="group flex w-full items-center rounded-2xl border border-red-200 bg-white px-5 py-6 text-left shadow-sm transition hover:bg-red-50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500">
            <Trash2 className="h-6 w-6" />
          </div>

          <div className="ml-5">
            <div className="text-2xl font-bold text-red-600">
              <span>Eliminar</span>
            </div>
            <div className="mt-1 text-sm text-slate-600">
              <span>Dar de baja o quitar materias asignadas a un alumno</span>
            </div>
          </div>
        </button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold text-slate-900">
          <span>Lista de Alumnos</span>
        </h2>

        <div className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar por nombre, ID o grupo..."
            aria-label="Buscar alumno"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pb-2">
        <div className="text-sm text-slate-500">
          <span>{`${alumnosFiltrados.length} alumnos registrados`}</span>
        </div>
      </div>

      {renderTable()}
    </div>
  );
};

export default AltasMaterias;
