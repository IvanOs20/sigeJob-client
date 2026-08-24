import { useState, useEffect } from 'react';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';
import client from '../../api/axios.js';

const obtenerIdDocenteSesion = () => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      const id = payload.id_perfil ?? payload.id_docente ?? payload.id_usuario ?? payload.idPerfil ?? payload.idDocente;

      if (id) return Number(id);
    }
  } catch (err) {
    console.warn('Error al decodificar token para ID del docente:', err);
  }

  try {
    const rawUser = localStorage.getItem('user') || localStorage.getItem('usuario');
    if (rawUser) {
      const storedUser = JSON.parse(rawUser);
      const user = storedUser.data || storedUser;
      const id = user.id_perfil ?? user.id_docente ?? user.id_usuario ?? user.id;

      if (id) return Number(id);
    }
  } catch (err) {
    console.warn('Error al parsear usuario de localStorage:', err);
  }

  return null;
};

const PerfilDocente = () => {
  const [docente, setDocente] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const cargarPerfilDocente = async () => {
      if (mounted) setLoading(true);
      const idDocente = obtenerIdDocenteSesion();

      if (!idDocente) {
        console.error('No se encontró ID de docente en la sesión activa.');
        if (mounted) setLoading(false);
        return;
      }

      try {
        console.log(`>> [DEBUG] Consultando perfil para docente ID: ${idDocente}`);
        const res = await client.get(`/docentes/${idDocente}`);
        const datos = Array.isArray(res.data) ? res.data[0] : res.data?.data || res.data;
        if (mounted) setDocente(datos || null);
      } catch (error) {
        console.error('Error al cargar el perfil del docente:', error);
        try {
          const rawUser = localStorage.getItem('user');
          if (mounted && rawUser) {
            const storedUser = JSON.parse(rawUser);
            setDocente(storedUser.data || storedUser);
          }
        } catch (fallbackError) {
          console.warn('Error al recuperar el perfil local del docente:', fallbackError);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    cargarPerfilDocente();

    return () => {
      mounted = false;
    };
  }, []);

  const getInitials = (nombre = '', apellidos = '') => {
    const n = nombre || '';
    const a = apellidos || '';
    if (n && a) return `${n.charAt(0)}${a.charAt(0)}`.toUpperCase();
    if (n) return n.slice(0, 2).toUpperCase();
    return '';
  };

  const nombre = docente?.nombre || docente?.nombre_completo || '';
  const apellidos = docente?.apellidos || docente?.apellido || '';
  const nombreCompleto = `${nombre} ${apellidos}`.trim() || 'Sin nombre';
  const correo = docente?.email || docente?.correo || '-';
  const cuentaActiva = docente?.activo ?? docente?.estado === 'Activo';

  return (
    <main translate="no" className="max-w-2xl mx-auto px-4 sm:px-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm mb-6">
        {/* Banner Azul Superior */}
        <div className="h-24 bg-blue-600 w-full" />

        {/* Cuerpo del Perfil en zona blanca */}
        <div className="px-6 pb-6">
          {/* Avatar flotante sobre el banner */}
          <div className="-mt-10 mb-3">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-white text-2xl font-bold border-4 border-white shadow-md">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <span>{getInitials(nombre, apellidos) || 'D'}</span>
              )}
            </div>
          </div>

          {/* Nombre y Detalles (Completamente despegados del azul) */}
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              <span>{loading ? 'Cargando...' : nombreCompleto}</span>
            </h2>
            <p className="text-sm font-medium text-slate-500">
              <span>Docente Titular</span>
            </p>
          </div>

          {/* Indicador Estado de Cuenta */}
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>{cuentaActiva ? 'Cuenta Activa' : 'Cuenta Inactiva'}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 text-sm font-semibold text-slate-600 border-b border-slate-100"><span>INFORMACIÓN DEL DOCENTE</span></div>

        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b border-slate-100 last:border-none gap-1 sm:gap-4">
            <div className="text-sm text-slate-500"><span>Nombre completo</span></div>
            <div className="text-sm text-slate-900 text-right sm:text-left"><span>{loading ? 'Cargando...' : nombreCompleto}</span></div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b border-slate-100 last:border-none gap-1 sm:gap-4">
            <div className="text-sm text-slate-500 flex items-center gap-2"><Mail className="w-4 h-4" /><span>Correo electrónico</span></div>
            <div className="text-sm text-slate-900 font-mono truncate text-right sm:text-left"><span>{loading ? 'Cargando...' : correo}</span></div>
          </div>


          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-1 sm:gap-4">
            <div className="text-sm text-slate-500"><span>Rol en el sistema</span></div>
            <div className="text-sm"><span className="bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-full text-xs inline-block"><span>Docente</span></span></div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PerfilDocente;
