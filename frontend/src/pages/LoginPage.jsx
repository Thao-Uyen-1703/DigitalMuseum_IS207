import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Logo from '../components/layout/Logo';
import api from '../api/axiosClient';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirectUrl = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: email,
        password: password
      });

      const { accessToken } = response.data;

      login(accessToken);

      navigate(redirectUrl);

    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex flex-1 bg-linear-to-br from-[#12372A] to-[#436850] text-white flex-col justify-center px-12 py-20">
        <h1 className="text-5xl font-bold mb-4">Welcome back</h1>
        <p className="text-lg opacity-80">Khám phá văn hoá Việt qua từng sản phẩm ✨</p>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 bg-[#FBFADA] flex justify-center items-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md">
          {/* LOGO */}
          <div className="flex justify-center mb-8">
            <Logo />
          </div>

          <h2 className="text-3xl font-bold text-[#12372A] text-center mb-2">Đăng nhập</h2>
          <p className="text-center text-gray-500 mb-8">Chào mừng bạn quay trở lại 💚</p>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* FORM */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* EMAIL */}
            <div>
              <input
                type="text"
                id="email"
                placeholder="Tên đăng nhập"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#436850] focus:ring-2 focus:ring-[#436850]/30 transition-all"
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#436850] focus:ring-2 focus:ring-[#436850]/30 transition-all pr-12"
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#436850] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#12372A] text-white font-semibold rounded-xl hover:bg-[#436850] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">Hoặc</span>
            </div>
          </div>

          {/* SOCIAL BUTTONS */}
          <div className="space-y-3">
            <button className="w-full py-3 bg-[#DB4437] text-white font-semibold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
              </svg>
              Google
            </button>
            <button className="w-full py-3 bg-[#1877F2] text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>

          {/* SIGNUP LINK */}
          <p className="text-center text-gray-600 mt-8">
            Chưa có tài khoản? <a href="/signup" className="text-[#12372A] font-semibold hover:text-[#436850] transition-colors">Đăng ký tại đây</a>
          </p>
        </div>
      </div>
    </div>
  );
}