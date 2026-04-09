import React, { useEffect } from 'react';
import ColorThief from 'colorthief';

const ColorExtractor = ({ imageUrl, onColorExtracted }) => {
  useEffect(() => {
    if (!imageUrl || !onColorExtracted) return;

    const extractColor = async () => {
      try {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imageUrl;

        img.onload = () => {
          const colorThief = new ColorThief();
          const color = colorThief.getColor(img);
          const rgbColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
          onColorExtracted(rgbColor);
        };

        img.onerror = () => {
          console.error('Error loading image');
          onColorExtracted(null);
        };
      } catch (error) {
        console.error('Error extracting color:', error);
        onColorExtracted(null);
      }
    };

    extractColor();
  }, [imageUrl, onColorExtracted]);

  return null; 
};

export default ColorExtractor; 