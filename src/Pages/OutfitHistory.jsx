import React, { useState, useEffect } from 'react';
import './OutfitHistory.css';

function OutfitHistory() {
  const [outfits, setOutfits] = useState([]);

  useEffect(() => {
    const savedOutfits = JSON.parse(localStorage.getItem('outfitHistory') || '[]');
    setOutfits(savedOutfits.reverse());
  }, []);

  const deleteOutfit = (id) => {
    const updatedOutfits = outfits.filter(outfit => outfit.id !== id);
    localStorage.setItem('outfitHistory', JSON.stringify(updatedOutfits));
    setOutfits(updatedOutfits);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="outfit-history">
      <div className="history-header">
        <h1>Outfit History</h1>
        <p>Your saved AI outfit suggestions</p>
      </div>

      <div className="history-container">
        {outfits.length === 0 ? (
          <div className="no-history">
            <i className="bi bi-clock-history"></i>
            <p>No outfit suggestions saved yet</p>
            <span>Your saved suggestions will appear here</span>
          </div>
        ) : (
          outfits.map(outfit => (
            <div key={outfit.id} className="history-card">
              <div className="history-card-header">
                <div className="history-meta">
                  <span className="history-date">{formatDate(outfit.date)}</span>
                  <div className="history-tags">
                    <span className="tag">{outfit.preferences.occasion}</span>
                    <span className="tag">{outfit.preferences.weather}</span>
                    <span className="tag">{outfit.preferences.season}</span>
                  </div>
                </div>
                <button 
                  className="delete-outfit"
                  onClick={() => deleteOutfit(outfit.id)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>

              <div className="history-content">
                <div className="base-item">
                  <h3>Base Item</h3>
                  <p>
                    <span className="color-dot" style={{ backgroundColor: outfit.baseItem.color }}></span>
                    {outfit.baseItem.type}
                  </p>
                </div>

                <div className="suggestion-content">
                  <h3>AI Suggestion</h3>
                  <p>{outfit.suggestion}</p>
                </div>

                <div className="preferences">
                  <div className="preference">
                    <span className="label">Vibe:</span>
                    <span className="value">{outfit.preferences.vibe}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default OutfitHistory;
