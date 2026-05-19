import React, { useState } from 'react';
import noImage from '../../assets/no-image.png'

const ImageDisplay = ({ src, alt, ...props }) => {
  const [imgSrc, setImgSrc] = useState(() => {
    if (!src) return noImage;
    return '/images/' + src;
  });

  const handleError = () => {
    setImgSrc(noImage);
  };

  return (
    <img 
      {...props} 
      src={imgSrc} 
      alt={alt || "Image"} 
      onError={handleError} 
    />
  );
};

export default ImageDisplay;