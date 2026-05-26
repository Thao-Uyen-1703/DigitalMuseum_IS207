import { Routes, Route } from 'react-router-dom';
import './App.css';
import DashboardPage from './pages/Dashboard/index';
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <Toaster position="top-right" richColors closeButton duration={1000} />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
      </Routes>
    </>
  )
}

export default App
