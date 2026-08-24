import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, Lock, Mail, User } from 'lucide-react';

export default function MiCuenta() {
  const [nombre, setNombre] = useState('Administrador General');
  const [correo] = useState('admin@escuela.com');
  const [password] = useState('AdminSeguro123');

  const [showEmail, setShowEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6" translate="no">
      <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-md">
            <span>A</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                <span>{nombre}</span>
              </h2>
              <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Activo</span>
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              <span>Administrador General del Sistema</span>
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">
              <span>Nombre Completo</span>
            </label>

            <div className="relative">
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 pl-10 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">
              <span>Correo Electrónico de Acceso</span>
            </label>
            <div className="relative">
              <input
                type={showEmail ? 'text' : 'password'}
                value={correo}
                readOnly
                className={`w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 pl-10 pr-10 text-sm font-medium text-slate-800 outline-none transition-all duration-200 ${
                  !showEmail ? 'blur-sm select-none' : ''
                }`}
              />
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowEmail(!showEmail)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                aria-label={showEmail ? 'Ocultar correo' : 'Mostrar correo'}
              >
                {showEmail ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">
              <span>Contraseña de Acceso</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                readOnly
                className={`w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 pl-10 pr-10 text-sm font-medium text-slate-800 outline-none transition-all duration-200 ${
                  !showPassword ? 'blur-sm select-none' : ''
                }`}
              />
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              <span>Haz clic en el ojo para revelar las credenciales asignadas.</span>
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-4">
          <button
            type="button"
            className="rounded-2xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <span>Guardar Cambios</span>
          </button>
        </div>
      </div>
    </div>
  );
}
