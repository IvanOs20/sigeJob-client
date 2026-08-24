import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Recuperar datos al recargar la página
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('rol');
    const userData = localStorage.getItem('user');

    if (token && role) {
      setUser({
        token,
        rol: role,
        data: userData ? JSON.parse(userData) : null,
      });
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    // Expecting response: { token/accessToken, rol, user }
    const token = data.accessToken || data.token;
    const role = data.rol;
    const userInfo = data.user || data.usuario || {};

    localStorage.setItem('token', token);
    localStorage.setItem('rol', role);
    localStorage.setItem('user', JSON.stringify(userInfo));

    setUser({ token, rol: role, data: userInfo });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);