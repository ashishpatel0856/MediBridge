import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      authService.getMe()
        .then(({ data }) => setUser(data.data))
        .catch(() => sessionStorage.clear())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const { data } = await authService.login(credentials);
    const { accessToken, refreshToken, user: userData, requiresMfa, mfaTempToken } = data.data;

    if (requiresMfa) {
      return { requiresMfa: true, mfaTempToken };
    }

    sessionStorage.setItem('accessToken', accessToken);
    if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);
    setUser(userData);
    return { requiresMfa: false, user: userData };
  };

  const verifyMfa = async (token, mfaTempToken) => {
    const { data } = await authService.verifyMfa({ token, mfaTempToken });
    const { accessToken, refreshToken, user: userData } = data.data;
    sessionStorage.setItem('accessToken', accessToken);
    if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    sessionStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, verifyMfa, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
