import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosClient';
import { toast } from 'sonner';

export default function Login() {
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if(user) {
            navigate('/');
        }
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!email || !password) {
            setError('Vui lòng điền đầy đủ thông tin đăng nhập.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post('/auth/staff/login', {
                email: email,
                password: password
            });

            const { accessToken } = response.data;

            await login(accessToken);

            navigate('/');
        } catch (err) {
            setError('Tài khoản hoặc mật khẩu không chính xác.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                
                {/* Header Logo & Title */}
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-[#2C4C3E] rounded-xl flex items-center justify-center shadow-md shadow-[#2C4C3E]/20">
                        <Lock className="text-white" size={24} />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900 tracking-tight">
                        Lacani System
                    </h2>
                </div>

                {/* Khung hiển thị thông báo lỗi nếu có */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Form Đăng Nhập */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Input Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Địa chỉ Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2C4C3E]/20 focus:border-[#2C4C3E] focus:bg-white transition-all"
                                    placeholder="admin@example.com"
                                />
                            </div>
                        </div>

                        {/* Input Mật khẩu */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2C4C3E]/20 focus:border-[#2C4C3E] focus:bg-white transition-all"
                                    placeholder="••••••••"
                                />
                                {/* Nút ẩn hiện mật khẩu */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="rememberMe"
                                name="rememberMe"
                                type="checkbox"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                                className="h-4 w-4 text-[#2C4C3E] focus:ring-[#2C4C3E] border-gray-300 rounded cursor-pointer accent-[#2C4C3E]"
                            />
                            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-600 cursor-pointer select-none">
                                Ghi nhớ đăng nhập
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-medium text-[#2C4C3E] hover:underline">
                                Quên mật khẩu?
                            </a>
                        </div>
                    </div> */}

                    {/* Nút Đăng Nhập */}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-[#2C4C3E] hover:bg-[#1f362c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C4C3E] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-[#2C4C3E]/10"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    {/* SVG Spinner quay vòng */}
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Đang xác thực...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform">
                                    <span>Đăng nhập</span>
                                    <ArrowRight size={16} />
                                </div>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}