import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Đang tải dữ liệu...</div>;

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dang-nhap" replace />;
  }
  
  return <Outlet />;
}