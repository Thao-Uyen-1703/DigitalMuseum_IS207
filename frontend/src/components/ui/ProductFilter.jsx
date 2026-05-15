import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function ProductFilter({ filters, setFilters, locationList }) {
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    price: true,
    sort: true,
  });

  const [localPriceFrom, setLocalPriceFrom] = useState(filters.priceFrom || '');
  const [localPriceTo, setLocalPriceTo] = useState(filters.priceTo || '');  

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'name', label: 'Tên (A-Z)' },
    { value: 'asc', label: 'Giá: Thấp đến Cao' },
    { value: 'desc', label: 'Giá: Cao đến Thấp' },
  ];

  const priceRage = [
    { label: 'Dưới 200.000đ', min: 0, max: 200000 },
    { label: '200.000đ - 500.000đ', min: 200000, max: 500000 },
    { label: '500.000đ - 1.000.000đ', min: 500000, max: 1000000 },
    { label: 'Trên 1.000.000đ', min: 1000000, max: 999999999 },
  ]

  useEffect(() => {
    setLocalPriceFrom(filters.priceFrom || '');
    setLocalPriceTo(filters.priceTo || '');
  }, [filters.priceFrom, filters.priceTo]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleLocationChange = (locationName) => {
    const isCurrentActive = filters.location === locationName;
    setFilters({
      location: isCurrentActive ? '' : locationName
    });
  };

  const handleSubmitPriceRange = (e) => {
    e.preventDefault();
    setFilters({
      priceFrom: localPriceFrom,
      priceTo: localPriceTo
    });
  };

  const handlePresetPriceClick = (min, max) => {
    setLocalPriceFrom(min);
    setLocalPriceTo(max);
    setFilters({
      priceFrom: min,
      priceTo: max
    });
  };

  const handleSortChange = (sortBy) => {
    setFilters({
      sort: sortBy
    })
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      {/* Location Filter */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <button
          onClick={() => toggleSection('location')}
          className="w-full flex items-center justify-between text-lg font-semibold text-gray-800 hover:text-amber-600 transition-colors"
        >
          Địa điểm
          <ChevronDown
            className={`w-5 h-5 transition-transform ${expandedSections.location ? 'rotate-180' : ''}`}
          />
        </button>

        {expandedSections.location && (
          <div className="mt-4 space-y-2">
            {locationList.map((location) => (
              <label
                key={location.LocationID}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.location.includes(location.LocationName)}
                  onChange={() => handleLocationChange(location.LocationName)}
                  className="w-4 h-4 rounded border-gray-300 text-amber-600 cursor-pointer accent-amber-600"
                />
                <span className="text-sm text-gray-700 group-hover:text-amber-600 transition-colors">
                  {location.LocationName}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Filter */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between text-lg font-semibold text-gray-800 hover:text-amber-600 transition-colors"
        >
          Khoảng Giá
          <ChevronDown
            className={`w-5 h-5 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`}
          />
        </button>

        {expandedSections.price && (
          <div className="mt-4 space-y-4">
            {/* Price Input Fields */}
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-600">Từ</label>
                <input
                  type="number"
                  value={localPriceFrom}
                  onChange={(e) => setLocalPriceFrom(Math.max(0, parseInt(e.target.value) || ''))}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Đến</label>
                <input
                  type="number"
                  value={localPriceTo}
                  onChange={(e) => setLocalPriceTo(Math.max(0, parseInt(e.target.value) || ''))}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="1000000"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleSubmitPriceRange}
                  className="w-full py-1.5 bg-amber-600 text-white rounded text-xs font-medium hover:bg-amber-700 transition-colors"
                >
                  Áp dụng khoảng giá
                </button>
              </div>
            </div>
            

            {/* Price Presets */}
            <div className="space-y-2">
              <p className="text-xs text-gray-600 font-semibold">Mức giá phổ biến:</p>
              <div className="space-y-1">
                {priceRage.map((preset) => {
                  const currentFrom = filters.priceFrom !== undefined && filters.priceFrom !== null ? String(filters.priceFrom) : "";
                  const currentTo = filters.priceTo !== undefined && filters.priceTo !== null ? String(filters.priceTo) : "";
                  
                  const presetMin = preset.min !== undefined && preset.min !== null ? String(preset.min) : "";
                  const presetMax = preset.max !== undefined && preset.max !== null ? String(preset.max) : "";

                  const isActive = currentFrom === presetMin && currentTo === presetMax;
                  return (
                    <button
                    type="button"
                    key={preset.label}
                    onClick={() => handlePresetPriceClick(preset.min, preset.max)}
                    className={`w-full text-left text-xs px-2.5 py-2 rounded transition-colors ${
                      isActive
                        ? 'bg-amber-50 text-amber-700 font-semibold border border-amber-200'
                        : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                    }`}>
                    {preset.label}
                  </button> 
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sort Filter */}
      <div>
        <button
          onClick={() => toggleSection('sort')}
          className="w-full flex items-center justify-between text-lg font-semibold text-gray-800 hover:text-amber-600 transition-colors"
        >
          Sắp xếp theo
          <ChevronDown
            className={`w-5 h-5 transition-transform ${expandedSections.sort ? 'rotate-180' : ''}`}
          />
        </button>

        {expandedSections.sort && (
          <div className="mt-4 space-y-2">
            {sortOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="sort"
                  value={option.value}
                  checked={filters.sort === option.value}
                  onChange={() => handleSortChange(option.value)}
                  className="w-4 h-4 border-gray-300 text-amber-600 cursor-pointer accent-amber-600"
                />
                <span className="text-sm text-gray-700 group-hover:text-amber-600 transition-colors">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
