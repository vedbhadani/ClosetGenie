import React, { useRef, useState } from "react";
import ColorExtractor from './ColorExtractor';
import "./ImageUploader.css"; 

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
        onImageUpload(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="upload-container">
      <div
        className="uploader-container"
        onClick={() => fileInputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          type="file"
          accept="image/png, image/jpeg"
          className="hidden-input"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        {preview ? (
          <div className="preview-container">
            <ColorExtractor imageUrl={preview} onColorExtracted={onColorExtracted} />
            <div className="upload-success">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              <p>Image uploaded successfully</p>
            </div>
          </div>
        ) : (
          <div className="upload-placeholder">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <p>Click to upload or drag and drop</p>
            <p className="note">PNG, JPG up to 10MB</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
