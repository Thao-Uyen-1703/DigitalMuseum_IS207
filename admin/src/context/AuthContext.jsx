import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';
import api from '../api/axiosClient';

const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      const profile = response.data.data;
      const normalizedUser = {
        id: profile.id,
        name: profile.username,
        avatar: profile.avatar,
        email: profile.email,
        phone: profile.phone,
        role: profile.role
      };
      setUser(normalizedUser);
      return normalizedUser;
    } catch (error) {
      localStorage.removeItem('access_token');
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            try {
              const response = await api.post('/auth/refresh');
              const newAccessToken = response.data.accessToken;
              localStorage.setItem('access_token', newAccessToken);
              await fetchCurrentUser();
            } catch (refreshError) {
              logout();
            }
          } else {
            await fetchCurrentUser();
          }
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (token) => {
    localStorage.setItem('access_token', token);
    const data = await fetchCurrentUser();
    if (data) {
      toast.success('Đăng nhập thành công');
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    toast.success('Đăng xuất thành công');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser: fetchCurrentUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng trong AuthProvider');
  }
  return context;
};