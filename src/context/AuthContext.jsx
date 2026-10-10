import { createContext, useState, useEffect, useContext } from 'react';
import api, { setAccessToken } from '../api/axios';

const AuthContext = createContext();

const getTokenPayload = (token) => {
  try {
    const payload = token?.split('.')[1];
    if (!payload) return {};

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch {
    return {};
  }
};

const getUserFromResponse = (data, token) => {
  const source = data?.user || data?.usuario || data || {};
  const payload = getTokenPayload(token);

  return {
    id_usuario: source.id_usuario ?? payload.id_usuario,
    nombre: source.nombre ?? payload.nombre,
    email: source.email ?? payload.email,
    rol: source.rol ?? source.role ?? payload.rol ?? payload.role,
    id_perfil: source.id_perfil ?? payload.id_perfil,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const response = await api.post('/auth/refresh', undefined, {
          withCredentials: true,
        });
        const token = response.data?.accessToken;

        if (!token) {
          throw new Error('La respuesta de refresh no contiene accessToken.');
        }

        setAccessToken(token);
        if (mounted) setUser(getUserFromResponse(response.data, token));
      } catch {
        setAccessToken(null);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  const login = (data) => {
    const token = data.accessToken;
    setAccessToken(token);
    setUser(getUserFromResponse(data, token));
  };

  const logout = async () => {
    setAccessToken(null);
    setUser(null);

    try {
      await api.post('/auth/logout', undefined, {
        withCredentials: true,
      });
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
