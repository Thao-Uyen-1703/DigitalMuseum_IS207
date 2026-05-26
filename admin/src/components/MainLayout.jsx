import React, { useState, useEffect } from 'react';
import Sidebar from './layout/Sidebar';
import { Menu } from 'lucide-react';

const MainLayout = ({ children }) => {
  // Mặc định mở, nhưng sẽ được check lại bởi useEffect ngay khi component mount
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Tự động đóng sidebar nếu màn hình là mobile (< 768px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    // Chạy lần đầu tiên khi load
    handleResize(); 
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans relative">
      
      {/* Lớp phủ mờ (Backdrop) trên Mobile khi Sidebar mở */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Top Header chỉ dành cho Mobile */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 z-10 shadow-sm">
          <span className="font-bold text-lg text-[#2C4C3E]">Admin Panel</span>
          <button 
            onClick={toggleSidebar} 
            className="p-2 bg-gray-100 rounded-md text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Khu vực render trang con */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;