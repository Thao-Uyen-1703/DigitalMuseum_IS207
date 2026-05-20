import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';

const AuthContext = createContext();

export default function AuthProvider ({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
              setUser(jwtDecode(newAccessToken));
              
            } catch (refreshError) {
              console.error("Phiên đăng nhập đã hết hạn hoàn toàn", refreshError);
              logout(false);
            }
          } else {
            setUser(decoded);
          }
        } catch (error) {
          logout(false);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token) => {
    localStorage.setItem('access_token', token);
    const decoded = jwtDecode(token);
    setUser(decoded);
    toast.success('Đăng nhập thành công');
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    toast.success('Đăng xuất thành công');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng trong AuthProvider');
  }
  return context;
};