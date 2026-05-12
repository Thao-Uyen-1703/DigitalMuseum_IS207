import { Mail, Phone } from 'lucide-react';
import { FacebookIcon } from '../icons/Icons';

export default function Footer() {
  return (
    <footer className="bg-teal-950 text-white py-4 mt-auto border-t border-teal-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* BÊN TRÁI: THÔNG TIN LIÊN HỆ */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2 group">
            <Mail className="text-amber-500 shrink-0" size={16} />
            <a href="mailto:Lacani@gmail.com" className="text-teal-100/70 hover:text-amber-400 text-sm transition-colors font-medium">
              Lacani@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-2 group">
            <Phone className="text-amber-500 shrink-0" size={16} />
            <a href="tel:0865206285" className="text-teal-100/70 hover:text-amber-400 text-sm transition-colors font-medium">
              0865.206.285
            </a>
          </div>
        </div>

        {/* BÊN PHẢI: ICON MẠNG XÃ HỘI */}
        <div className="flex items-center gap-5">
          <div className="flex gap-4">
            <a href="#" className="text-teal-400 hover:text-amber-400 transition-all hover:-translate-y-1">
              <FacebookIcon className="w-5 h-5"/>
            </a>
            {/* Bạn có thể thêm các icon khác ở đây */}
          </div>
        </div>

      </div>
      
      {/* Dòng bản quyền siêu nhỏ ở dưới cùng */}
      <div className="text-center text-teal-600/30 text-[10px] mt-2">
        &copy; 2024 Lacani. All rights reserved.
      </div>
    </footer>
  );
}