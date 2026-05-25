import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/layout/Logo';
import api from '../api/axiosClient';
import { toast } from 'sonner';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullname: '',
    phone: '',
    email: '',
    password: '',
    repassword: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showRepassword, setShowRepassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Họ tên không được để trống';
    } else if (formData.fullname.trim().length < 5) {
      newErrors.fullname = 'Họ tên tối thiểu 5 ký tự';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!/^0\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Số điện thoại phải bắt đầu bằng 0 và có 10 chữ số';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (formData.password.length < 5) {
      newErrors.password = 'Mật khẩu tối thiểu 5 ký tự';
    }

    if (!formData.repassword.trim()) {
      newErrors.repassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.repassword) {
      newErrors.repassword = 'Mật khẩu nhập lại không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        fullname: formData.fullname.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        password: formData.password,
        repassword: formData.repassword
      });

      toast.success('Đăng ký thành công!');
      navigate('/dang-nhap');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex flex-1 bg-linear-to-br from-[#12372A] to-[#436850] text-white flex-col justify-center px-12 py-20">
        <h1 className="text-5xl font-bold mb-4">Gia nhập cộng đồng</h1>
        <p className="text-lg opacity-80">Khám phá và sở hữu những sản phẩm văn hóa độc đáo 🎭</p>
      </div>

      <div className="flex-1 bg-[#FBFADA] flex justify-center items-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Logo />
          </div>

          <h2 className="text-3xl font-bold text-[#12372A] text-center mb-2">Đăng ký</h2>
          <p className="text-center text-gray-500 mb-8">Tạo tài khoản mới để bắt đầu</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                name="fullname"
                placeholder="Họ tên"
                value={formData.fullname}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#436850] focus:ring-2 focus:ring-[#436850]/30 transition"
              />
              {errors.fullname && <p className="mt-1 text-xs text-red-600">{errors.fullname}</p>}
            </div>

            <div>
              <input
                type="text"
                name="phone"
                placeholder="Số điện thoại"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#436850] focus:ring-2 focus:ring-[#436850]/30 transition"
              />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#436850] focus:ring-2 focus:ring-[#436850]/30 transition"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#436850] focus:ring-2 focus:ring-[#436850]/30 transition pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#436850]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            <div className="relative">
              <input
                type={showRepassword ? 'text' : 'password'}
                name="repassword"
                placeholder="Nhập lại mật khẩu"
                value={formData.repassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#436850] focus:ring-2 focus:ring-[#436850]/30 transition pr-12"
              />
              <button
                type="button"
                onClick={() => setShowRepassword(!showRepassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#436850]"
              >
                {showRepassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.repassword && <p className="mt-1 text-xs text-red-600">{errors.repassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#12372A] text-white font-semibold rounded-xl hover:bg-[#436850] transition disabled:opacity-50 mt-6"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Đã có tài khoản? <Link to="/dang-nhap" className="text-[#12372A] font-semibold hover:text-[#436850]">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
