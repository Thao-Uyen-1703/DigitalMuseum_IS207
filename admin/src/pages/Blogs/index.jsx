import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, Image as ImageIcon, Save, X, 
  ChevronLeft, ChevronRight, Eye, Search, Loader2, 
  AlertTriangle, RefreshCw 
} from 'lucide-react';
import { toast } from 'sonner';
import MainLayout from '../../components/MainLayout';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import api from '../../api/axiosClient';
import ImageDisplay from '../../components/common/ImageDisplay';

const ProductCard = ({ product, onEdit }) => {
  const [imgIdx, setImgIdx] = useState(0);

  let detailsData = { Story: [] };
  try {
    if (product.Details) {
      detailsData = typeof product.Details === 'string' ? JSON.parse(product.Details) : product.Details;
    }
  } catch (e) {}

  const images = [product.ImageURL, ...(detailsData.Story?.map(s => s.ImageURL) || [])].filter(Boolean);
  const safeImages = images.length > 0 ? images : ['/placeholder-product.png'];

  const nextImg = (e) => {
    e.stopPropagation();
    setImgIdx((prev) => (prev + 1) % safeImages.length);
  };

  const prevImg = (e) => {
    e.stopPropagation();
    setImgIdx((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  };

  return (
    <div className="group flex flex-col">
      <div 
        className="relative aspect-square overflow-hidden bg-gray-100 rounded-lg border border-gray-200 cursor-pointer"
        onClick={() => onEdit(product)}
      >
        <ImageDisplay    
          src={safeImages[imgIdx]} 
          alt={product.ProductName}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {safeImages.length > 1 && (
          <>
            <button 
              onClick={prevImg} 
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full text-gray-800 opacity-0 group-hover:opacity-100 hover:bg-white transition-all shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={nextImg} 
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full text-gray-800 opacity-0 group-hover:opacity-100 hover:bg-white transition-all shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
            
            <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 z-10">
              {safeImages.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all ${i === imgIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} />
              ))}
            </div>
          </>
        )}

        <div className="absolute bottom-4 left-4 right-4 lg:translate-y-4 opacity-100 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product);
            }}
            className="w-full inline-flex items-center justify-center gap-2 rounded bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 shadow-sm"
          >
            <Edit2 size={16} /> Biên tập chi tiết
          </button>
        </div>
      </div>
      
      <div className="mt-4 flex flex-col flex-1">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
          <span className="inline-flex items-center gap-1"><Eye size={14} />{product.ViewCount} Lượt xem</span>
        </div>
        <h3 className="text-base font-semibold text-gray-900 leading-snug">{product.ProductName}</h3>
      </div>
    </div>
  );
};

export default function BlogManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pagination & Search States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [description, setDescription] = useState('');
  const [culturalStory, setCulturalStory] = useState('');
  const [stories, setStories] = useState([]);
  const [isCreating, setIsCreating] = useState(true);

  const fetchProducts = async (page = 1, perPage = 10, search = '') => {
    try {
      setLoading(true);
      const response = await api.get('/admin/blogs', { params: { page, perPage, search } });
      if (response.data.success) {
        setProducts(response.data.data.blogs || []);
        setTotalPages(response.data.data.totalPages);
        setCurrentPage(page);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1, itemPerPage, searchInput);
  }, [itemPerPage, refreshTrigger]);

  const handleSearch = () => {
    fetchProducts(1, itemPerPage, searchInput);
  };

  const handleRefresh = () => {
    setSearchInput('');
    setCurrentPage(1);
    setRefreshTrigger(prev => prev + 1);
  };

  const handlePageChange = (page) => {
    fetchProducts(page, itemPerPage, searchInput);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    let detailsData = { Description: '', Story: [] };
    
    if (product.Details) {
      try {
        detailsData = typeof product.Details === 'string' ? JSON.parse(product.Details) : product.Details;
        setIsCreating(false);
      } catch (e) {
        setIsCreating(true);
      }
    } else {
      setIsCreating(true);
    }

    setDescription(detailsData.Description || '');
    setCulturalStory(product.CulturalStory || '');
    setStories(detailsData.Story || []);
    setShowModal(true);
  };

  const handleAddStory = () => {
    if (stories.length >= 3) return;
    setStories([...stories, { Title: '', ImageURL: '', Lines: [{ Text: '' }] }]);
  };

  const handleRemoveStory = (storyIndex) => {
    setStories(stories.filter((_, index) => index !== storyIndex));
  };

  const handleStoryChange = (storyIndex, field, value) => {
    const updated = [...stories];
    updated[storyIndex][field] = value;
    setStories(updated);
  };

  const handleAddLine = (storyIndex) => {
    const updated = [...stories];
    updated[storyIndex].Lines.push({ Text: '' });
    setStories(updated);
  };

  const handleRemoveLine = (storyIndex, lineIndex) => {
    const updated = [...stories];
    updated[storyIndex].Lines = updated[storyIndex].Lines.filter((_, index) => index !== lineIndex);
    setStories(updated);
  };

  const handleLineTextChange = (storyIndex, lineIndex, value) => {
    const updated = [...stories];
    updated[storyIndex].Lines[lineIndex].Text = value;
    setStories(updated);
  };

  const handleFileChange = (storyIndex, file) => {
    if (!file) return;

    const localPreviewUrl = URL.createObjectURL(file);
    
    const updated = [...stories];
    updated[storyIndex].ImageURL = localPreviewUrl; 
    updated[storyIndex].ImageFile = file; 
    
    setStories(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const sanitizedDescription = description.trim();
    const sanitizedCulturalStory = culturalStory.trim();

    // Validation
    for (let i = 0; i < stories.length; i++) {
      const story = stories[i];
      const trimmedTitle = story.Title?.trim();
      const validLines = story.Lines.filter(line => line.Text?.trim() !== '');

      if (!trimmedTitle) {
        toast.error(`Vui lòng nhập tiêu đề cho chi tiết minh họa thứ ${i + 1}.`);
        return;
      }
      if (validLines.length === 0) {
        toast.error(`Chi tiết minh họa "${trimmedTitle}" cần có ít nhất một dòng nội dung.`);
        return;
      }
    }

    setIsSubmitting(true); 

    try {
      const formData = new FormData();

      const processedStories = stories.map((story, index) => {
        if (story.ImageFile) {
          formData.append(`image_${index}`, story.ImageFile);
        }

        return {
          Title: story.Title.trim(),
          ImageURL: story.ImageURL, 
          Lines: story.Lines
            .filter(line => line.Text?.trim() !== '')
            .map(line => ({ Text: line.Text.trim() }))
        };
      });

      const payload = {
        CulturalStory: sanitizedCulturalStory,
        Details: {
          Description: sanitizedDescription,
          Story: processedStories
        }
      };

      formData.append('payload', JSON.stringify(payload));

      if (isCreating) {
        await api.post(`/admin/blogs/${selectedProduct.ProductID}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.put(`/admin/blogs/${selectedProduct.ProductID}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      toast.success('Lưu thông tin thành công');
      setShowModal(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu dữ liệu hoặc tải ảnh. Vui lòng thử lại!';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false); 
    }
  };

  const confirmDeleteStory = () => {
    setShowDeleteConfirm(true);
  };

  const executeDeleteStory = async () => {
    try {
      setIsSubmitting(true);
      await api.delete(`/admin/blogs/${selectedProduct.ProductID}`);
      toast.success('Đã xóa thông tin thành công');
      setShowDeleteConfirm(false);
      setShowModal(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Có lỗi xảy ra khi xóa thông tin. Vui lòng thử lại!';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Blogs</h1>
            <p className="text-sm text-gray-500">Biên tập câu chuyện cho sản phẩm và thống kê lượt xem.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
              <Search size={18} className="text-gray-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Tìm theo tên sản phẩm..."
                className="w-full bg-transparent text-sm text-gray-700 outline-none"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleSearch}
                className="inline-flex items-center justify-center rounded-xl bg-[#2C4C3E] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#264033] transition"
              >
                Tìm kiếm
              </button>
              <button
                onClick={handleRefresh}
                title="Làm mới"
                className="inline-flex items-center justify-center rounded-xl bg-white border border-gray-200 p-3 text-gray-500 shadow-sm hover:bg-gray-50 hover:text-gray-900 transition"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-500">
            <Loader2 size={24} className="animate-spin text-gray-400 mr-2" /> 
            Đang tải danh mục tác phẩm...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {products.map((product) => (
                <ProductCard key={product.ProductID} product={product} onEdit={openEditModal} />
              ))}
            </div>

            {products.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemPerPage={itemPerPage}
                onPageChange={handlePageChange}
                onItemPerPageChange={(perPage) => {
                  setItemPerPage(perPage);
                  setCurrentPage(1);
                }}
              />
            )}
          </>
        )}

        <Modal isOpen={showModal} title="Biên tập Tác phẩm" onClose={() => !isSubmitting && setShowModal(false)} size="2xl">
          <form onSubmit={handleSubmit} className="flex flex-col h-auto max-h-[80vh] -mx-6 -my-4">
            
            {/* Body scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              {/* Basic Inputs */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Tên Tác Phẩm</label>
                  <input 
                    readOnly 
                    value={selectedProduct?.ProductName || ''} 
                    className="w-full rounded-md border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-700 outline-none cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Câu chuyện văn hóa</label>
                  <textarea
                    value={culturalStory}
                    onChange={(e) => setCulturalStory(e.target.value)}
                    placeholder="Nhập thông tin xuất xứ, văn hóa..."
                    rows={2}
                    className="w-full resize-none rounded-md border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#2C4C3E] focus:ring-1 focus:ring-[#2C4C3E] transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-semibold text-gray-900">Mô tả tổng quan</label>
                    <span className={`text-xs ${description.length >= 255 ? 'text-red-500 font-bold' : 'text-gray-500 font-medium'}`}>
                      {description.length} / 255
                    </span>
                  </div>
                  <textarea
                    maxLength={255}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Đoạn giới thiệu ngắn về sản phẩm..."
                    rows={4}
                    className="w-full resize-none rounded-md border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#2C4C3E] focus:ring-1 focus:ring-[#2C4C3E] transition-all"
                  />
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Story Lines / Details Block */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Thông tin chi tiết</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Tối đa 3 mục ({stories.length}/3)</p>
                  </div>
                  {stories.length < 3 && (
                    <button
                      type="button"
                      onClick={handleAddStory}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#2C4C3E]/10 px-3 py-1.5 text-xs font-semibold text-[#2C4C3E] hover:bg-[#2C4C3E]/20 transition-colors"
                    >
                      <Plus size={14} /> Thêm mới
                    </button>
                  )}
                </div>

                {stories.length === 0 ? (
                  <div className="py-10 text-center border border-dashed border-gray-300 rounded-xl bg-gray-50">
                    <p className="text-sm text-gray-500">Chưa có nội dung</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {stories.map((story, sIdx) => (
                      <div key={sIdx} className="group relative bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-[#2C4C3E]/40 transition-colors">
                        
                        <div className="flex items-start justify-between mb-4 gap-4">
                          <input
                            value={story.Title}
                            onChange={(e) => handleStoryChange(sIdx, 'Title', e.target.value)}
                            placeholder="Nhập tiêu đề câu chuyện..."
                            className="flex-1 bg-transparent text-lg font-semibold text-gray-900 outline-none placeholder:text-gray-300 border-b border-transparent focus:border-gray-300 pb-1 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveStory(sIdx)}
                            className="text-gray-400 hover:text-red-500 p-1 bg-gray-50 rounded hover:bg-red-50 transition-colors"
                            title="Xóa chi tiết này"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="grid gap-6 md:grid-cols-[1fr_240px]">
                          <div className="space-y-3">
                            {story.Lines.map((line, lIdx) => (
                              <div key={lIdx} className="flex gap-2 group/line">
                                <textarea
                                  value={line.Text}
                                  onChange={(e) => handleLineTextChange(sIdx, lIdx, e.target.value)}
                                  placeholder="Nội dung văn bản..."
                                  rows={3}
                                  className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 leading-relaxed outline-none focus:border-[#2C4C3E] focus:bg-white hover:bg-gray-100 transition-colors"
                                />
                                {story.Lines.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveLine(sIdx, lIdx)}
                                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover/line:opacity-100 transition-opacity mt-2 h-max"
                                  >
                                    <X size={16} />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleAddLine(sIdx)}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-[#2C4C3E] transition-colors"
                            >
                              <Plus size={14} /> Thêm dòng mới
                            </button>
                          </div>

                          <div className="flex flex-col gap-2">
                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-50 border border-gray-200 group/img">
                              {story.ImageURL ? (
                                <>
                                  <ImageDisplay src={story.ImageURL} alt="Detail visual" className="h-full w-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                    <label className="cursor-pointer text-gray-900 text-xs font-semibold bg-white px-3 py-1.5 rounded shadow-sm hover:bg-gray-50 transition-colors">
                                      Thay ảnh
                                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(sIdx, e.target.files[0])} />
                                    </label>
                                  </div>
                                </>
                              ) : (
                                <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 text-gray-400 hover:bg-gray-100 transition-colors">
                                  <ImageIcon size={24} />
                                  <span className="text-xs font-medium">Tải ảnh lên (Tùy chọn)</span>
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(sIdx, e.target.files[0])} />
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 rounded-b-lg shrink-0">
              {!isCreating && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={confirmDeleteStory}
                  className="mr-auto rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Xóa toàn bộ nội dung
                </button>
              )}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowModal(false)}
                className="rounded-lg px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2C4C3E] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#203a2f] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>

        <Modal 
          isOpen={showDeleteConfirm} 
          title="Xác nhận xóa" 
          onClose={() => !isSubmitting && setShowDeleteConfirm(false)} 
          size="md"
        >
          <div className="">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-2 bg-red-100 text-red-600 rounded-full shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Xóa thông tin sản phẩm</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Bạn có chắc chắn muốn xóa toàn bộ thông tin chi tiết của sản phẩm này không? Hành động này không thể hoàn tác.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowDeleteConfirm(false)} 
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button 
                type="button"
                disabled={isSubmitting}
                onClick={executeDeleteStory} 
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Xác nhận xóa
              </button>
            </div>
          </div>
        </Modal>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e5e7eb; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #d1d5db; }
      `}} />
    </MainLayout>
  );
}