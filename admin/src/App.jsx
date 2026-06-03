import { Routes, Route } from 'react-router-dom';
import './App.css';
import DashboardPage from './pages/Dashboard/index';
import { Toaster } from 'sonner';
import Login from './pages/Login/index';
import ProtectedRoute from './components/ProtectedRoute';
import ProductList from './pages/Products';
import CategoryList from './pages/Categories';
import LocationList from './pages/Locations';
import OrderList from './pages/Orders';

function App() {
  return (
    <>
      <Toaster position="top-right" richColors closeButton duration={1000} />
      <Routes>
        <Route path="/dang-nhap" element={<Login />} />
        <Route element={<ProtectedRoute allowedRoles={['Staff', 'Admin', 'Manager']} />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/san-pham" element={<ProductList />} />
          <Route path="/danh-muc" element={<CategoryList />} />
          <Route path="/dia-diem" element={<LocationList />} />
          <Route path="/don-hang" element={<OrderList />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
