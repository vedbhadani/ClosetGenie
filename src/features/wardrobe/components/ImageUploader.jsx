import React, { useRef, useState } from "react";
import ColorExtractor from '@/shared/utils/ColorExtractor';
import { FiUploadCloud, FiCheck } from 'react-icons/fi';

const ImageUploader = ({ onImageUpload, onColorExtracted }) => {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (!file) return;

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      alert("Only PNG and JPG files are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size should be under 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      if (onImageUpload) {
        onImageUpload(reader.result, file);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full">
      <div
        className={`w-full min-h-[200px] border-2 border-dashed rounded-xl cursor-pointer transition flex items-center justify-center overflow-hidden
          ${preview 
            ? 'border-transparent bg-surface-container-high' 
            : 'border-outline-variant/50 hover:border-primary-container bg-surface-container-low/50 hover:bg-surface-container-low'
          }`}
        onClick={() => fileInputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          type="file"
          accept="image/png, image/jpeg"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        {preview ? (
          <div className="w-full relative">
            <ColorExtractor imageUrl={preview} onColorExtracted={onColorExtracted} />
            <div className="flex items-center justify-center gap-2 p-4 text-primary-container">
              <FiCheck size={20} />
              <p className="font-body text-sm font-semibold">Image uploaded successfully</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <FiUploadCloud className="text-on-surface/40 mb-3" size={32} />
            <p className="font-body font-semibold text-sm text-on-surface/70">Click to upload or drag and drop</p>
            <p className="font-label text-xs text-on-surface/40 mt-1 uppercase tracking-wider">PNG, JPG up to 10MB</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
