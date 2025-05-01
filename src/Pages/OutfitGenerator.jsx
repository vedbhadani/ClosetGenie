import React, { useState } from 'react';
import './OutfitGenerator.css';

export default function OutfitGenerator() {
  const [occasion, setOccasion] = useState('casual');
  const [season, setSeason] = useState('spring');
  const [weather, setWeather] = useState('sunny');
  const [styleVibe, setStyleVibe] = useState('');
  const [generatedOutfit, setGeneratedOutfit] = useState(null);
  const [showModal, setShowModal] = useState(false);



  const handleCloseModal = () => {
    setShowModal(false);
    setGeneratedOutfit(null);
  };

  return (
    <div className="outfit-generator">
      <div className="generator-header">
        <h1 className="text-center">Outfit Generator</h1>
        <p className="text-center">Get personalized outfit recommendations based on your preferences and wardrobe items.</p>
      </div>

      <div className="generator-content">
        <div className="preferences-container">
          <h2>What are you dressing for?</h2>
          
          <div className="preference-group">
            <label>Occasion</label>
            <div className="preference-options">
              {['Casual', 'Work', 'Formal', 'Date', 'Workout', 'Party'].map((type) => (
                <button
                  key={type}
                  className={`preference-btn ${occasion === type.toLowerCase() ? 'active' : ''}`}
                  onClick={() => setOccasion(type.toLowerCase())}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="preference-group">
            <label>Season</label>
            <div className="preference-options">
              {['Spring', 'Summer', 'Fall', 'Winter'].map((type) => (
                <button
                  key={type}
                  className={`preference-btn ${season === type.toLowerCase() ? 'active' : ''}`}
                  onClick={() => setSeason(type.toLowerCase())}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="preference-group">
            <label>Weather</label>
            <div className="preference-options">
              {['Sunny', 'Rainy', 'Cold', 'Hot', 'Windy'].map((type) => (
                <button
                  key={type}
                  className={`preference-btn ${weather === type.toLowerCase() ? 'active' : ''}`}
                  onClick={() => setWeather(type.toLowerCase())}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="preference-group">
            <label>Style Vibe (Optional)</label>
            <div className="preference-options">
              {['Classic', 'Trendy', 'Bohemian', 'Minimalist', 'Streetwear', 'Preppy', 'Vintage'].map((type) => (
                <button
                  key={type}
                  className={`preference-btn ${styleVibe === type.toLowerCase() ? 'active' : ''}`}
                  onClick={() => setStyleVibe(type.toLowerCase())}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <button className="generate-outfit-btn">
            <span className="icon">⚡</span> Generate Outfit
          </button>
        </div>
      </div>

      {showModal && generatedOutfit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="generated-outfit-header">
              <button className="close-modal" onClick={handleCloseModal}>
                ×
              </button>
              <h2>Generated Outfit</h2>
            </div>

            <div className="outfit-details">
              <div className="outfit-title-section">
                <div className="outfit-title-info">
                  <h3>{generatedOutfit.title}</h3>
                  <div className="outfit-tags">
                    <span className="date-tag">Invalid Date</span>
                    {generatedOutfit.tags.map((tag, index) => (
                      <span key={index} className={`tag ${tag.toLowerCase()}`}>{tag}</span>
                    ))}
                  </div>
                </div>
                <button className="like-button">♡</button>
              </div>

              <div className="outfit-items">
                {generatedOutfit.items.map((item, index) => (
                  <div key={index} className="outfit-item-card">
                    <div className="item-image">
                      <img src={item.imageUrl} alt={item.name} />
                    </div>
                    <div className="item-details">
                      <p className="item-name">{item.name}</p>
                      <p className="item-category">{item.category}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="outfit-actions">
                <button className="generate-similar-btn">
                  <span>↻ Generate Similar</span>
                </button>
                <button className="remove-btn">
                  <span>🗑 Remove</span>
                </button>
              </div>

              <div className="outfit-description">
                <h4>About This Outfit</h4>
                <p>This outfit was generated based on your spring wardrobe items, optimized for casual occasions. Perfect for sunny spring days.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
