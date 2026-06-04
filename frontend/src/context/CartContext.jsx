import { createContext, useState, useEffect, useContext, useRef } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/axiosClient';
import { toast } from 'sonner';

const CartContext = createContext();

export default function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const debounceTimers = useRef({});

  useEffect(() => {
    if (user) {
      syncAndFetchCart();
    } else {
      const localCart = JSON.parse(localStorage.getItem('guest_cart')) || [];
      setCart(localCart);
    }
  }, [user]);

  const syncAndFetchCart = async () => {
    setIsSyncing(true);
    try {
      const localCart = JSON.parse(localStorage.getItem('guest_cart')) || [];
      if (localCart.length > 0) {
        try {
          await api.post('/cart/merge', { 
            items: localCart.map(item => ({
              productId: item.productId,
              quantity: item.quantity
            })) 
          });
          localStorage.removeItem('guest_cart');
        } catch (mergeError) {
          console.error('Lỗi khi merge giỏ hàng:', mergeError);
        }
      }

      const response = await api.get('/cart'); 
      const dbCart = response.data.data || []; 
      
      const formattedCart = dbCart.map(item => ({
        productId: item.ProductID || item.productId,
        productName: item.ProductName || item.productName,
        price: item.Price || item.price,
        quantity: item.Quantity || item.quantity,
        image: item.ImageURL || item.image 
      }));
      
      setCart(formattedCart);
      
    } catch (error) {
      console.error('Lỗi khi tải giỏ hàng:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const updateCartItemQuantity = async(productId, newQuantity) => {
    if (newQuantity < 1) return;

    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      );
      
      if (!user) {
        localStorage.setItem('guest_cart', JSON.stringify(updatedCart));
      }
      return updatedCart;
    });

    if (user) {
      if (debounceTimers.current[productId]) {
        clearTimeout(debounceTimers.current[productId]);
      }

      debounceTimers.current[productId] = setTimeout(async () => {
        try {
          await api.put(`/cart/${productId}`, { quantity: newQuantity });
          
          delete debounceTimers.current[productId];
        } catch (error) {
          console.error("Lỗi đồng bộ số lượng lên DB:", error);
          toast.error("Không thể lưu thay đổi số lượng. Vui lòng thử lại!");
        }
      }, 500); 
    }
  }

  const removeFromCart = async (productIds) => {
    // Ép kiểu đầu vào thành mảng để xử lý chung 1 logic cho tiện
    // VD: truyền vào 1 (số) -> thành [1]. Truyền [1, 2, 3] -> giữ nguyên [1, 2, 3].
    const idsToRemove = Array.isArray(productIds) ? productIds : [productIds];

    if (idsToRemove.length === 0) return;

    // 1. Lọc bỏ các sản phẩm bị xóa khỏi State ngay lập tức
    setCart((prevCart) => {
      const updatedCart = prevCart.filter(item => !idsToRemove.includes(item.productId));
      
      if (!user) {
        localStorage.setItem('guest_cart', JSON.stringify(updatedCart));
      }
      return updatedCart;
    });

    if (user) {
      try {
        idsToRemove.forEach(id => {
          if (debounceTimers.current[id]) {
            clearTimeout(debounceTimers.current[id]);
            delete debounceTimers.current[id];
          }
        });
        await Promise.all(
          idsToRemove.map(id => api.delete(`/cart/${id}`))
        );

      } catch (error) {
        console.error("Lỗi xóa sản phẩm DB:", error);
        toast.error("Lỗi khi xóa sản phẩm. Dữ liệu có thể chưa đồng bộ.");
      }
    } else {
      toast.success(`Đã xóa ${idsToRemove.length} sản phẩm!`);
    }
  };

  const addToCart = async (product, quantity, image) => {
    const productId = product._id || product.id || product.ProductID;

    if (user) {
      try {
        await api.post('/cart', { productId, quantity }); // Nhớ dùng đúng URL endpoint của bạn, lúc nãy thiết kế là /cart/items
        
        setCart((prevCart) => {
          const existingItem = prevCart.find(item => item.productId === productId);
          if (existingItem) {
            return prevCart.map(item => 
              item.productId === productId 
                ? { ...item, quantity: item.quantity + quantity } 
                : item
            );
          }
          // SỬA LỖI 1: Định dạng lại Object thêm mới chuẩn xác để Header có thể đọc được
          return [...prevCart, { 
            productId, 
            productName: product.ProductName,
            price: product.Price,
            image: image,
            quantity 
          }];
        });
        
        toast.success('Đã thêm vào giỏ hàng!');
      } catch (error) {
        toast.error(error.response.data.message);
      }
    } else {
      // (Nhánh guest giữ nguyên của bạn)
      let updatedCart = [...cart];
      const existingItemIndex = updatedCart.findIndex(item => item.productId === productId);

      if (existingItemIndex > -1) {
        updatedCart[existingItemIndex].quantity += quantity;
      } else {
        updatedCart.push({
          productId,
          productName: product.ProductName,
          price: product.Price,
          image: image,
          quantity
        });
      }

      setCart(updatedCart);
      localStorage.setItem('guest_cart', JSON.stringify(updatedCart));
      toast.success('Đã thêm vào giỏ hàng!');
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateCartItemQuantity, isSyncing, setCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart phải được dùng trong CartProvider');
  }
  return context;
};