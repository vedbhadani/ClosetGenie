import React, { useState } from 'react';
import './OutfitHistory.css';
import { useQuery, useMutation } from "convex/react";
import { api } from '@convex/_generated/api';
import { useUser } from "@clerk/clerk-react";
import { HistorySkeleton } from '@/shared/components/PageSkeleton';

function OutfitHistory() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const userId = user?.id;

  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState(null);

  const rawOutfits = useQuery(api.wardrobe.getOutfitHistory, userId ? { userId } : "skip");
  const isLoading = !isUserLoaded || (userId && rawOutfits === undefined);
  const outfits = rawOutfits || [];

  if (isLoading) return <HistorySkeleton />;
  
  const toggleFavoriteMutation = useMutation(api.wardrobe.toggleFavoriteOutfit);
  const deleteOutfitMutation = useMutation(api.wardrobe.deleteOutfit);
  const clearHistoryMutation = useMutation(api.wardrobe.clearHistory);

  const clearAll = async () => {
    if (!userId) return;
    await clearHistoryMutation({ userId });
  };

  const deleteOutfit = async (outfitId) => {
    await deleteOutfitMutation({ outfitId });
  };

  const toggleFavorite = async (outfitId) => {
    await toggleFavoriteMutation({ outfitId });
  };

  const formatDate = (dateNumber) => {
    const d = new Date(dateNumber || Date.now());
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const visibleOutfits = favoritesOnly ? outfits.filter(o => o.isFavorite) : outfits;

  return (
    <div className="history-container-modern">
      <section className="history-header-modern">
        <div className="header-content">
          <div>
            <h1 className="history-title">Outfit History</h1>
            <p className="history-subtitle">Your previously generated looks and favorites</p>
          </div>
          <div className="header-actions">
            <div className="toggle-favorites">
              <input id="fav-toggle" type="checkbox" checked={favoritesOnly} onChange={e => setFavoritesOnly(e.target.checked)} />
              <label htmlFor="fav-toggle">Show favorites only</label>
            </div>
            {outfits.length > 0 && (
              <button className="clear-btn" onClick={clearAll}>
                <i className="bi bi-trash"></i>
                Clear All
              </button>
            )}
          </div>
        </div>
        <div className="history-stats">
          <div className="stat-card">
            <span className="stat-number">{outfits.length}</span>
            <span className="stat-label">Total Outfits</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{outfits.filter(o => o.isFavorite).length}</span>
            <span className="stat-label">Favorites</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{new Set(outfits.map(o => o.occasion || o.preferences?.occasion)).size || 0}</span>
            <span className="stat-label">Occasions</span>
          </div>
        </div>
      </section>

      <section className="history-grid-section">
        {visibleOutfits.length === 0 ? (
          <div className="modern-empty">
            <i className="bi bi-clock-history"></i>
            <h3>No outfits yet</h3>
            <p>Your generated outfits will show up here. Try creating one from the generator.</p>
          </div>
        ) : (
          <div className="history-grid">
            {visibleOutfits.map(outfit => (
              <div key={outfit._id} className="history-card-modern">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">{outfit.title || 'Generated Outfit'}</h3>
                    <div className="card-tags">
                      {outfit.occasion && <span className="tag">{outfit.occasion}</span>}
                      {outfit.season && <span className="tag">{outfit.season}</span>}
                      {outfit.weather && <span className="tag">{outfit.weather}</span>}
                      {outfit.styleVibe && <span className="tag">{outfit.styleVibe}</span>}
                    </div>
                  </div>
                  <div className="card-actions">
                    <button type="button" className="details" onClick={() => setSelectedOutfit(outfit)} aria-label="View details">
                      <i className="bi bi-eye"></i>
                    </button>
                    <button type="button" className={`favorite ${outfit.isFavorite ? 'active' : ''}`} onClick={() => toggleFavorite(outfit._id)} aria-label="Toggle favorite">
                      <i className={outfit.isFavorite ? 'bi bi-heart-fill' : 'bi bi-heart'}></i>
                    </button>
                    <button type="button" className="delete" onClick={() => deleteOutfit(outfit._id)} aria-label="Delete outfit">
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
                <div className="card-body" role="button" tabIndex={0} onClick={() => setSelectedOutfit(outfit)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedOutfit(outfit); }}>
                  {(outfit.items && outfit.items.length > 0) ? (
                    <div className="thumbs">
                      {outfit.items.slice(0,4).map((item, idx) => (
                        <div key={idx} className="thumb">
                          <img src={item.imageUrl} alt={item.name} />
                          <span className="thumb-badge">{item.category}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    (outfit.suggestion || outfit.baseItem) && (
                      <div className="legacy-preview">
                        {outfit.suggestion && (
                          <p className="preview-suggestion">{outfit.suggestion[0] || outfit.suggestion}</p>
                        )}
                        {outfit.baseItem && (
                          <div className="preview-base">
                            <span className="color-dot" style={{ backgroundColor: outfit.baseItem.color }}></span>
                            {outfit.baseItem.type}
                          </div>
                        )}
                        <div className="preview-tags">
                          { (outfit.preferences?.occasion || outfit.occasion) && (<span className="tag">{outfit.preferences?.occasion || outfit.occasion}</span>) }
                          { (outfit.preferences?.season || outfit.season) && (<span className="tag">{outfit.preferences?.season || outfit.season}</span>) }
                          { (outfit.preferences?.weather || outfit.weather) && (<span className="tag">{outfit.preferences?.weather || outfit.weather}</span>) }
                        </div>
                      </div>
                    )
                  )}
                  <div className="meta-row">
                    <span className="date">{formatDate(outfit.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedOutfit && (
        <div className="history-modal-overlay" onClick={() => setSelectedOutfit(null)}>
          <div className="history-modal" onClick={e => e.stopPropagation()}>
            <div className="history-modal-header">
              <div>
                <h2>{selectedOutfit.title || 'Outfit details'}</h2>
                <div className="card-tags">
                  {selectedOutfit.occasion && <span className="tag">{selectedOutfit.occasion}</span>}
                  {selectedOutfit.season && <span className="tag">{selectedOutfit.season}</span>}
                  {selectedOutfit.weather && <span className="tag">{selectedOutfit.weather}</span>}
                  {selectedOutfit.styleVibe && <span className="tag">{selectedOutfit.styleVibe}</span>}
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelectedOutfit(null)} aria-label="Close">
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="history-modal-body">
              {(selectedOutfit.items && selectedOutfit.items.length > 0) ? (
                <div className="modal-thumbs">
                  {selectedOutfit.items.map((item, idx) => (
                    <div key={idx} className="thumb">
                      <img src={item.imageUrl} alt={item.name} />
                      <span className="thumb-badge">{item.category}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="legacy-details">
                  {selectedOutfit.suggestion && (
                    <div className="legacy-block">
                      <h4>AI Suggestion</h4>
                      <div className="legacy-suggestion">
                        {Array.isArray(selectedOutfit.suggestion) ? (
                          selectedOutfit.suggestion.map((s, idx) => <p key={idx}>{s}</p>)
                        ) : (
                          <p>{selectedOutfit.suggestion}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {selectedOutfit.baseItem && (
                    <div className="legacy-block">
                      <h4>Base Item</h4>
                      <p>
                        <span className="color-dot" style={{ backgroundColor: selectedOutfit.baseItem.color }}></span>
                        {selectedOutfit.baseItem.type}
                      </p>
                    </div>
                  )}
                </div>
              )}
              <p className="modal-date">{formatDate(selectedOutfit.createdAt)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OutfitHistory;
