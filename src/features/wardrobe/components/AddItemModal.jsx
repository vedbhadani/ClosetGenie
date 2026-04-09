import React, { useState, useRef, useEffect } from 'react'
import { useAIService } from '@/features/ai/services/aiService';
import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { FiX, FiUploadCloud, FiStar, FiAlertCircle, FiTag } from 'react-icons/fi';

const AddItemModal = ({ onClose, onAdd, editItem }) => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(editItem?.imageUrl || null);
  const [selectedSeasons, setSelectedSeasons] = useState(
    editItem?.seasons?.map(s => s.charAt(0).toUpperCase() + s.slice(1)) || []
  );
  const [formData, setFormData] = useState({
    name: editItem?.name || '',
    category: editItem?.category || 'Tops',
    material: 'Cotton',
    color: editItem?.color || '',
  });
  const [aiTags, setAiTags] = useState(editItem?.tags || []);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiDetected, setAiDetected] = useState(false);
  const aiError = false; 
  const [hasAiError, setHasAiError] = useState(false);
  const fileInputRef = useRef(null);
  const analysisRunRef = useRef(null); // prevent duplicate calls
  const aiService = useAIService();
  const generateUploadUrl = useMutation(api.wardrobe.generateUploadUrl);

  // Lock background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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

  // Run AI analysis when a new image is set
  useEffect(() => {
    if (!previewUrl || !image) return;

    // Prevent duplicate calls for the same image
    const imageKey = image.name + image.size;
    if (analysisRunRef.current === imageKey) return;
    analysisRunRef.current = imageKey;

    const runAnalysis = async () => {
      setIsAnalyzing(true);
      setAiDetected(false);
      setHasAiError(false);

      try {
        // Upload image temporarily for backend AI access
        const postUrl = await generateUploadUrl();
        const uploadResponse = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": image.type },
          body: image,
        });
        const { storageId } = await uploadResponse.json();

        // Safe backend-only OpenRouter call via Convex
        const result = await aiService.analyzeClothingImage(storageId);

        if (result) {
          setFormData(prev => ({
            ...prev,
            name: result.name || prev.name,
            category: result.category || prev.category,
            color: result.color || prev.color,
          }));
          setAiTags(result.tags || []);
          setAiDetected(true);
        } else {
          setHasAiError(true);
        }
      } catch (err) {
        console.error("AI Vision flow failed:", err);
        setHasAiError(true);
      } finally {
        setIsAnalyzing(false);
      }
    };

    runAnalysis();
  }, [previewUrl, image, aiService, generateUploadUrl]);

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
    e.currentTarget.classList.add('ring-2', 'ring-primary-container');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('ring-2', 'ring-primary-container');
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
    setAiDetected(false);
    setHasAiError(false);
    setAiTags([]);
    analysisRunRef.current = null;
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

  const handleRemoveTag = (tagToRemove) => {
    setAiTags(prev => prev.filter(t => t !== tagToRemove));
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
    if (!formData.name || (!image && !editItem) || selectedSeasons.length === 0) {
      return;
    }

    const newItem = {
      name: formData.name,
      category: formData.category,
      imageFile: image || undefined,
      seasons: selectedSeasons.includes('All') 
        ? ['all seasons'] 
        : selectedSeasons.map(s => s.toLowerCase()),
      color: formData.color || undefined,
      tags: aiTags.length > 0 ? aiTags : undefined,
    };

    onAdd(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-[env(safe-area-inset-bottom)]">
      {/* Stable backdrop — will-change prevents blur repaint on state updates */}
      <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-md" style={{ willChange: 'transform' }} onClick={onClose}></div>
      
      <div className="relative w-full max-w-lg max-h-[90vh] bg-surface-container-lowest rounded-2xl shadow-ambient flex flex-col" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="sticky top-0 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-outline-variant/20 px-6 py-4 flex justify-between items-center z-10 rounded-t-2xl">
          <h2 className="font-display font-bold text-lg">{editItem ? 'Edit Item' : 'Add New Item'}</h2>
          <button className="p-2 -mr-2 rounded-full hover:bg-surface-container-low transition" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-6 hide-scrollbar">
          
          {/* Uploader */}
          <div 
            className={`w-full h-48 border-2 border-dashed rounded-xl overflow-hidden cursor-pointer relative transition group flex flex-col items-center justify-center
              ${previewUrl ? 'border-transparent bg-surface-container-high' : 'border-outline-variant/50 hover:border-primary-container bg-surface-container-low/50 hover:bg-surface-container-low'}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onClick={handleUploadClick}
          >
            {previewUrl ? (
              <div className="w-full h-full relative border border-outline-variant/10 rounded-xl overflow-hidden bg-surface-container-lowest">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <span className="w-6 h-6 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin mb-3" />
                    <span className="font-body text-xs text-on-surface text-center px-4">
                      Analyzing via AI...<br/>
                      <span className="opacity-60 text-[10px]">Autofilling details automatically</span>
                    </span>
                  </div>
                )}

                <button 
                  type="button"
                  className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur text-on-surface rounded-full shadow-sm hover:bg-error hover:text-on-error transition"
                  onClick={handleRemoveImage}
                >
                  <FiX />
                </button>
              </div>
            ) : (
              <div className="text-center p-4">
                <FiUploadCloud className="mx-auto text-on-surface/40 mb-3" size={32} />
                <p className="font-body font-semibold text-sm text-on-surface/70">Drag & drop your image here</p>
                <span className="font-label text-xs uppercase tracking-wider text-on-surface/40">or click to browse files</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileInputChange}
              onClick={e => e.stopPropagation()}
            />
          </div>

          {/* AI Notice Badges */}
          {aiDetected && (
            <div className="flex items-center gap-2 p-3 bg-secondary-container/30 border border-secondary-container/50 text-on-secondary-container rounded-lg font-body text-xs">
              <FiStar /> AI auto-filled fields. Please verify.
            </div>
          )}
          {(aiError || hasAiError) && (
            <div className="flex items-center gap-2 p-3 bg-error-container/30 border border-error-container/50 text-error rounded-lg font-body text-xs">
              <FiAlertCircle /> AI analysis failed, fill manually.
            </div>
          )}

          {/* Core Form Fields */}
          <div className="flex flex-col gap-4">
            
            <div>
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/50 ml-1 mb-1 block">Item Name</label>
              <input 
                type="text"
                name="name"
                className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg font-body text-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition"
                placeholder="e.g., Blue Denim Jacket"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/50 ml-1 mb-1 block">Category</label>
                <select 
                  name="category"
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg font-body text-sm focus:outline-none focus:border-primary-container transition appearance-none"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="Tops">Tops</option>
                  <option value="Bottoms">Bottoms</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Outerwear">Outerwear</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              <div>
                 <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/50 ml-1 mb-1 block">Color</label>
                 <input
                  type="text"
                  name="color"
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg font-body text-sm focus:outline-none focus:border-primary-container transition"
                  placeholder="e.g., Navy"
                  value={formData.color}
                  onChange={handleInputChange}
                />
              </div>
            </div>

             <div>
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/50 ml-1 mb-1 block">Material</label>
                <select 
                  name="material"
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg font-body text-sm focus:outline-none focus:border-primary-container transition appearance-none"
                  value={formData.material}
                  onChange={handleInputChange}
                >
                  <option value="Cotton">Cotton</option>
                  <option value="Wool">Wool</option>
                  <option value="Polyester">Polyester</option>
                  <option value="Leather">Leather</option>
                </select>
            </div>
          </div>

          {/* AI Style Tags */}
          {aiTags.length > 0 && (
            <div>
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/50 ml-1 mb-2 flex items-center gap-1"><FiTag /> Style Tags</label>
              <div className="flex flex-wrap gap-2">
                {aiTags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 font-label text-[10px] uppercase tracking-wider bg-surface-container-high px-3 py-1.5 rounded-md text-on-surface/80">
                    {tag}
                    <button
                      type="button"
                      className="ml-1 text-on-surface/50 hover:text-error transition"
                      onClick={() => handleRemoveTag(tag)}
                    ><FiX size={12} /></button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Seasons (Required) */}
          <div>
            <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/50 ml-1 mb-2 block">Seasons</label>
            <div className="flex flex-wrap gap-2">
              {['Spring', 'Summer', 'Fall', 'Winter', 'All'].map((season) => (
                <button
                  key={season}
                  type="button"
                  className={`px-4 py-2 rounded-full font-label text-xs uppercase tracking-wider transition border ${
                    selectedSeasons.includes(season)
                      ? 'bg-secondary-container text-on-secondary-container border-secondary-container font-semibold'
                      : 'bg-surface-container-lowest text-on-surface border-outline-variant/30 hover:border-primary-container/30'
                  }`}
                  onClick={() => handleSeasonClick(season)}
                >
                  {season}
                </button>
              ))}
            </div>
          </div>

        </form>

        {/* Footer Actions */}
        <div className="border-t border-outline-variant/20 p-4 bg-surface-container-lowest flex justify-end gap-3 rounded-b-2xl">
           <button type="button" className="px-5 py-2.5 font-label text-xs uppercase tracking-wider text-on-surface/60 hover:text-on-surface hover:bg-surface-container-low rounded-lg transition" onClick={onClose}>
             Cancel
           </button>
           <button 
             type="submit" 
             onClick={handleSubmit}
             disabled={!formData.name || (!image && !editItem) || selectedSeasons.length === 0}
             className="px-6 py-2.5 bg-primary-container text-on-primary font-body font-semibold text-sm rounded-lg hover:opacity-90 disabled:opacity-50 transition shadow-sm"
           >
             {editItem ? 'Save Changes' : 'Add to Wardrobe'}
           </button>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}

export default AddItemModal