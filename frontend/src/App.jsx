import { Routes, Route } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetails from './pages/ProductDetails';
import { Toaster } from 'sonner';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import TrackingPage from './pages/TrackingPage';

function App() {
  return (
    <>
      <Toaster position="top-right" richColors closeButton duration={1000} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dang-nhap" element={<LoginPage />} />
        <Route path="/dang-ky" element={<SignupPage />} />
        <Route path="/thong-tin-ca-nhan" element={<ProfilePage />} />
        <Route path="/cua-hang" element={<ProductListPage />} />
        <Route path="/san-pham/:slug" element={<ProductDetails />} />
        <Route path="/gio-hang" element={<CartPage />} />
        <Route path="/thanh-toan" element={<CheckoutPage />} />
        <Route path="/tra-cuu" element={<TrackingPage />} />
      </Routes>
    </>
  )
}

export default App
