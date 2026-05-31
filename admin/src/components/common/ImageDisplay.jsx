import React, { useState, useEffect } from 'react';
import noImage from '../../assets/no-image.png';

const ImageDisplay = ({ src, alt, type = 'be', ...props }) => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_APP_URL;

  const resolveImageSource = (source, sourceType) => {
    if (!source) return noImage;

    if (sourceType === 'fe') {
      return '/images/' + source;
    }

    return `${BACKEND_URL}/images/${source}`;
  };

  const [imgSrc, setImgSrc] = useState(() => resolveImageSource(src, type));

  useEffect(() => {
    setImgSrc(resolveImageSource(src, type));
  }, [src, type]);

  const handleError = () => {
    setImgSrc(noImage);
  };

  return (
    <img 
      {...props} 
      src={imgSrc} 
      alt={alt || "Hình ảnh hệ thống"} 
      onError={handleError} 
    />
  );
};

export default ImageDisplay;