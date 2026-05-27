import { Routes, Route } from 'react-router-dom';
import './App.css';
import DashboardPage from './pages/Dashboard/index';
import { Toaster } from 'sonner';
import Login from './pages/Login/index';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <Toaster position="top-right" richColors closeButton duration={1000} />
      <Routes>
        <Route path="/dang-nhap" element={<Login />} />
        <Route element={<ProtectedRoute allowedRoles={['Admin', 'Manager']} />}>
          <Route path="/" element={<DashboardPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
