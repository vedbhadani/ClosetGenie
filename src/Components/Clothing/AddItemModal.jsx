import React, { useState, useRef } from 'react'
import './AddItemModal.css'

const AddItemModal = ({ onClose, onAdd }) => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedSeasons, setSelectedSeasons] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Tops',
    material: 'Cotton'
  });
  const fileInputRef = useRef(null);

  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleImageUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSeasonClick = (season) => {
    setSelectedSeasons(prev => {
      if (season === 'All') {
        if (prev.includes('All')) {
          return [];
        } else {
          return ['All'];
        }
      } else {
        if (prev.includes('All')) {
          return [season];
        } else {
          if (prev.includes(season)) {
            return prev.filter(s => s !== season);
          } else {
            return [...prev, season];
          }
        }
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !image || selectedSeasons.length === 0) {
      return;
    }

    const newItem = {
      id: Date.now(),
      name: formData.name,
      category: formData.category,
      imageUrl: previewUrl,
      seasons: selectedSeasons.includes('All') 
        ? ['All seasons'] 
        : selectedSeasons.map(s => s.toLowerCase()),
    };

    onAdd(newItem);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Item</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-content">
          <div 
            className={`image-upload-area ${previewUrl ? 'has-image' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onClick={handleUploadClick}>
            
            {previewUrl ? (
              <div className="preview-container">
                <img src={previewUrl} alt="Preview" className="preview-image" />
           
                <button 
                  type="button"
                  className="remove-image"
                  onClick={handleRemoveImage}
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>Drag & drop your image here</p>
                <span>or click to browse files</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden-input"
              accept="image/*"
              onChange={handleFileInputChange}
              onClick={e => e.stopPropagation()}
            />
          </div>

          <input 
            type="text"
            name="name"
            className="item-input"
            placeholder="e.g., Blue Denim Jacket"
            value={formData.name}
            onChange={handleInputChange}
            required
          />

          <select 
            name="category"
            className="item-select"
            value={formData.category}
            onChange={handleInputChange}
          >
            <option value="Tops">Tops</option>
            <option value="Bottoms">Bottoms</option>
            <option value="Footwear">Footwear</option>
            <option value="Outerwear">Outerwear</option>
            <option value="Accessories">Accessories</option>
          </select>

          <select 
            name="material"
            className="item-select"
            value={formData.material}
            onChange={handleInputChange}
          >
            <option value="Cotton">Cotton</option>
            <option value="Wool">Wool</option>
            <option value="Polyester">Polyester</option>
            <option value="Leather">Leather</option>
          </select>

          <div className="seasons-section">
            <span>Seasons</span>
            <div className="season-buttons">
              {['Spring', 'Summer', 'Fall', 'Winter', 'All'].map((season) => (
                <button
                  key={season}
                  type="button"
                  className={`season-btn ${selectedSeasons.includes(season) ? 'active' : ''}`}
                  onClick={() => handleSeasonClick(season)}
                >
                  {season}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button 
              type="submit" 
              className="add-btn"
              disabled={!formData.name || !image || selectedSeasons.length === 0}
            >
              Add to Wardrobe
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddItemModal