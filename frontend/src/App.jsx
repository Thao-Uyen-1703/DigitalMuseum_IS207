import { Routes, Route } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ProductListPage from './pages/ProductListPage';
import ProductDetails from './pages/ProductDetails';
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dang-nhap" element={<LoginPage />} />
        <Route path="/cua-hang" element={<ProductListPage />} />
        <Route path="/san-pham/:slug" element={<ProductDetails />} />
      </Routes>
    </>
  )
}

export default App
