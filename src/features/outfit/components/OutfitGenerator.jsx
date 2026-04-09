import React, { useState, useEffect } from 'react';
import './OutfitGenerator.css';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useUser } from '@clerk/clerk-react';
import useWeather from '@/features/weather/hooks/useWeather';
import { GeneratorSkeleton } from '@/shared/components/PageSkeleton';

export default function OutfitGenerator() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const userId = user?.id;

  // Weather auto-detection
  const {
    weatherType: detectedWeather,
    temperature,
    description: weatherDescription,
    icon: weatherIcon,
    loading: weatherLoading,
    error: weatherError,
    locationName,
  } = useWeather();

  const [occasion, setOccasion] = useState('casual');
  const [season, setSeason] = useState('spring');
  const [weather, setWeather] = useState('sunny');
  const [weatherAutoFilled, setWeatherAutoFilled] = useState(false);
  const [styleVibe, setStyleVibe] = useState('');
  const [generatedOutfit, setGeneratedOutfit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notice, setNotice] = useState(null);
  const [aiDescription, setAiDescription] = useState("");

  // Auto-fill weather when detection completes (only once)
  useEffect(() => {
    if (detectedWeather && !weatherAutoFilled) {
      setWeather(detectedWeather);
      setWeatherAutoFilled(true);
    }
  }, [detectedWeather, weatherAutoFilled]);

  // Load data from Convex
  const rawWardrobe = useQuery(api.wardrobe.getUserClothes, userId ? { userId } : "skip");
  const rawHistory = useQuery(api.wardrobe.getOutfitHistory, userId ? { userId } : "skip");
  const isLoading = !isUserLoaded || (userId && (rawWardrobe === undefined || rawHistory === undefined));
  const wardrobeItems = rawWardrobe || [];
  const outfitHistory = rawHistory || [];
  const favoriteOutfits = outfitHistory.filter(o => o.isFavorite);

  const addOutfitMutation = useMutation(api.wardrobe.addOutfit);
  const toggleFavoriteMutation = useMutation(api.wardrobe.toggleFavoriteOutfit);
  const clearHistoryMutation = useMutation(api.wardrobe.clearHistory);
  const runCreativeAIMutation = useAction(api.ai.runCreativeAI);

  if (isLoading) return <GeneratorSkeleton />;

  const handleCloseModal = () => {
    setShowModal(false);
    setGeneratedOutfit(null);
  };

  const generateOutfit = async () => {
    if (wardrobeItems.length === 0) {
      setNotice({ type: 'warning', text: 'Please add some items to your wardrobe first!' });
      return;
    }

    setIsGenerating(true);
    
    // Simple outfit generation logic
    const filteredItems = wardrobeItems.filter(item => {
      // Filter based on season if seasons are available
      if (item.seasons && item.seasons.length > 0) {
        return item.seasons.some(s => 
          s.toLowerCase().includes(season) || 
          s.toLowerCase().includes('all')
        );
      }
      return true;
    });

    if (filteredItems.length < 2) {
      setNotice({ type: 'warning', text: 'Not enough suitable items for this season. Try adding more items or selecting a different season.' });
      setIsGenerating(false);
      return;
    }

    // Generate a random outfit
    const items = getRandomOutfitItems(filteredItems);
    const outfitData = {
      userId,
      title: `${occasion.charAt(0).toUpperCase() + occasion.slice(1)} ${season} Outfit`,
      occasion,
      season,
      weather,
      styleVibe,
      itemIds: items.map(i => i._id),
      isFavorite: false,
    };

    // Save to Convex
    const outfitId = await addOutfitMutation(outfitData);
    
    // Set local state for modal (include full items for display)
    setGeneratedOutfit({ ...outfitData, _id: outfitId, items });
    setShowModal(true);
    
    // Fetch AI description via secure Convex backend (Qwen model)
    try {
      const prompt = `Create a short, friendly 3-4 sentence description for an outfit with ${items.length} items for a ${occasion} occasion in ${season}. Weather: ${weather}. Style vibe: ${styleVibe || 'any'}. Mention key categories and when it works well.`;
      const description = await runCreativeAIMutation({ prompt });
      setAiDescription(description || "");
    } catch (err) {
      console.error('AI suggest error:', err);
      setAiDescription("");
    } finally {
      setIsGenerating(false);
    }
  };

  const getRandomOutfitItems = (items) => {
    const categories = ['Tops', 'Bottoms', 'Footwear'];
    const outfitItems = [];

    categories.forEach(category => {
      const categoryItems = items.filter(item => item.category === category);
      if (categoryItems.length > 0) {
        const randomItem = categoryItems[Math.floor(Math.random() * categoryItems.length)];
        outfitItems.push(randomItem);
      }
    });

    // Add accessories or outerwear if available
    const extras = items.filter(item => 
      item.category === 'Accessories' || item.category === 'Outerwear'
    );
    if (extras.length > 0 && Math.random() > 0.5) {
      const randomExtra = extras[Math.floor(Math.random() * extras.length)];
      outfitItems.push(randomExtra);
    }

    return outfitItems;
  };

  const toggleFavorite = async (outfitId) => {
    try {
      await toggleFavoriteMutation({ outfitId });
      
      if (generatedOutfit && (generatedOutfit._id === outfitId || generatedOutfit.id === outfitId)) {
        setGeneratedOutfit(prev => ({ ...prev, isFavorite: !prev.isFavorite }));
      }
    } catch (err) {
      console.error('Toggle favorite error:', err);
    }
  };

  const regenerateOutfit = () => {
    setShowModal(false);
    generateOutfit();
  };

  return (
    <div className="generator-container">
      {/* Header Section */}
      <section className="generator-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="generator-title">AI Outfit Generator</h1>
            <p className="generator-subtitle">
              Create perfect outfit combinations with AI-powered styling based on your wardrobe, preferences, and the occasion
            </p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{wardrobeItems.length}</span>
              <span className="stat-label">Wardrobe Items</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{outfitHistory.length}</span>
              <span className="stat-label">Outfits Generated</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{favoriteOutfits.length}</span>
              <span className="stat-label">Favorites</span>
            </div>
          </div>
        </div>
      </section>

      <div className="generator-content">
        <div className="main-content">
          {/* Preferences Panel */}
          <div className="preferences-panel">
            <div className="panel-header">
              <h2>Style Preferences</h2>
              <p>Tell us about your style and occasion</p>
            </div>

            <div className="preference-section">
              <div className="preference-group">
                <label className="preference-label">
                  <i className="bi bi-calendar-event"></i>
                  Occasion
                </label>
                <div className="preference-options">
                  {[
                    { value: 'casual', label: 'Casual', icon: 'bi-house' },
                    { value: 'work', label: 'Work', icon: 'bi-briefcase' },
                    { value: 'formal', label: 'Formal', icon: 'bi-suit-spade' },
                    { value: 'date', label: 'Date', icon: 'bi-heart' },
                    { value: 'workout', label: 'Workout', icon: 'bi-activity' },
                    { value: 'party', label: 'Party', icon: 'bi-music-note-beamed' }
                  ].map((item) => (
                    <button
                      key={item.value}
                      className={`preference-btn ${occasion === item.value ? 'active' : ''}`}
                      onClick={() => setOccasion(item.value)}
                    >
                      <i className={item.icon}></i>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="preference-group">
                <label className="preference-label">
                  <i className="bi bi-thermometer-half"></i>
                  Season
                </label>
                <div className="preference-options">
                  {[
                    { value: 'spring', label: 'Spring', icon: 'bi-flower1' },
                    { value: 'summer', label: 'Summer', icon: 'bi-sun' },
                    { value: 'fall', label: 'Fall', icon: 'bi-tree' },
                    { value: 'winter', label: 'Winter', icon: 'bi-snow' }
                  ].map((item) => (
                    <button
                      key={item.value}
                      className={`preference-btn season-${item.value} ${season === item.value ? 'active' : ''}`}
                      onClick={() => setSeason(item.value)}
                    >
                      <i className={item.icon}></i>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="preference-group">
                <label className="preference-label">
                  <i className="bi bi-cloud-sun"></i>
                  Weather
                </label>

                {/* Auto-detected weather badge */}
                {weatherLoading && (
                  <div className="weather-badge loading">
                    <div className="spinner" style={{ width: '0.8rem', height: '0.8rem', border: '2px solid rgba(102,126,234,0.3)', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }}></div>
                    <span>Detecting weather...</span>
                  </div>
                )}
                {!weatherLoading && detectedWeather && (
                  <div className="weather-badge detected">
                    <i className={`bi ${weatherIcon}`}></i>
                    <span>
                      Detected: {detectedWeather.charAt(0).toUpperCase() + detectedWeather.slice(1)}
                      {temperature !== null && ` (${temperature}°C)`}
                      {locationName && ` — ${locationName}`}
                    </span>
                  </div>
                )}
                {!weatherLoading && weatherError && (
                  <div className="weather-badge error">
                    <i className="bi bi-exclamation-circle"></i>
                    <span>{weatherError} — select manually</span>
                  </div>
                )}

                <div className="preference-options">
                  {[
                    { value: 'sunny', label: 'Sunny', icon: 'bi-brightness-high' },
                    { value: 'rainy', label: 'Rainy', icon: 'bi-cloud-rain' },
                    { value: 'cold', label: 'Cold', icon: 'bi-thermometer-low' },
                    { value: 'hot', label: 'Hot', icon: 'bi-thermometer-high' },
                    { value: 'windy', label: 'Windy', icon: 'bi-wind' }
                  ].map((item) => (
                    <button
                      key={item.value}
                      className={`preference-btn weather-${item.value} ${weather === item.value ? 'active' : ''}`}
                      onClick={() => setWeather(item.value)}
                    >
                      <i className={item.icon}></i>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="preference-group">
                <label className="preference-label">
                  <i className="bi bi-palette"></i>
                  Style Vibe <span className="optional">(Optional)</span>
                </label>
                <div className="preference-options">
                  {[
                    { value: 'classic', label: 'Classic' },
                    { value: 'trendy', label: 'Trendy' },
                    { value: 'bohemian', label: 'Bohemian' },
                    { value: 'minimalist', label: 'Minimalist' },
                    { value: 'streetwear', label: 'Streetwear' },
                    { value: 'preppy', label: 'Preppy' },
                    { value: 'vintage', label: 'Vintage' }
                  ].map((item) => (
                    <button
                      key={item.value}
                      className={`preference-btn style-${item.value} ${styleVibe === item.value ? 'active' : ''}`}
                      onClick={() => setStyleVibe(styleVibe === item.value ? '' : item.value)}
                    >
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="generate-section">
              {notice && (
                <div className={`inline-notice ${notice.type}`} role="status">
                  <i className={`bi ${notice.type === 'warning' ? 'bi-exclamation-triangle' : 'bi-info-circle'}`}></i>
                  <span>{notice.text}</span>
                  <button className="notice-close" onClick={() => setNotice(null)} aria-label="Dismiss message">
                    <i className="bi bi-x"></i>
                  </button>
                </div>
              )}
              <button 
                className={`generate-btn ${isGenerating ? 'generating' : ''}`}
                onClick={() => !isGenerating && generateOutfit()}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="spinner"></div>
                    <span style={{textAlign: "center", display: "inline-block"}}>Generating...<br/><small style={{fontSize: "0.75rem", opacity: 0.8}}>(Using free AI, may be slow)</small></span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-magic"></i>
                    <span>Generate Perfect Outfit</span>
                  </>
                )}
              </button>
              {wardrobeItems.length === 0 && (
                <p className="wardrobe-notice">
                  <i className="bi bi-info-circle"></i>
                  Add items to your wardrobe to generate outfits
                </p>
              )}
            </div>
          </div>

          {/* History Sidebar */}
          <div className="history-sidebar">
            <div className="sidebar-header">
              <h3>Recent Outfits</h3>
              {outfitHistory.length > 0 && (
                <span className="clear-history" onClick={() => clearHistoryMutation({ userId })}>Clear All</span>
              )}
            </div>
            
            <div className="history-list">
              {outfitHistory.length === 0 ? (
                <div className="empty-history">
                  <i className="bi bi-clock-history"></i>
                  <p>No outfits generated yet</p>
                </div>
              ) : (
                outfitHistory.slice(0, 5).map((outfit) => (
                  <div key={outfit._id} className="history-item">
                    <div className="history-images">
                      {(outfit.items || []).slice(0, 3).map((item, index) => (
                        <img key={index} src={item.imageUrl} alt={item.name} />
                      ))}
                    </div>
                    <div className="history-info">
                      <h4>{outfit.title}</h4>
                      <p>{new Date(outfit.createdAt).toLocaleDateString()}</p>
                      <div className="history-tags">
                        <span className="tag">{outfit.occasion}</span>
                        <span className="tag">{outfit.season}</span>
                      </div>
                    </div>
                    <button 
                      className={`favorite-btn ${outfit.isFavorite ? 'active' : ''}`}
                      onClick={() => toggleFavorite(outfit._id)}
                    >
                      <i className={outfit.isFavorite ? 'bi bi-heart-fill' : 'bi bi-heart'}></i>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Outfit Modal */}
      {showModal && generatedOutfit && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-section">
                <h2>{generatedOutfit.title}</h2>
                <div className="outfit-meta">
                  <span className="meta-tag occasion">{generatedOutfit.occasion}</span>
                  <span className="meta-tag season">{generatedOutfit.season}</span>
                  <span className="meta-tag weather">{generatedOutfit.weather}</span>
                  {generatedOutfit.styleVibe && (
                    <span className="meta-tag style">{generatedOutfit.styleVibe}</span>
                  )}
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  className={`favorite-btn ${generatedOutfit.isFavorite ? 'active' : ''}`}
                  onClick={() => toggleFavorite(generatedOutfit._id || generatedOutfit.id)}
                >
                  <i className={generatedOutfit.isFavorite ? 'bi bi-heart-fill' : 'bi bi-heart'}></i>
                </button>
                <button className="close-btn" onClick={handleCloseModal}>
                  <i className="bi bi-x"></i>
                </button>
              </div>
            </div>

            <div className="modal-body">
              <div className="outfit-showcase">
                {generatedOutfit.items.map((item, index) => (
                  <div key={index} className="showcase-item">
                    <div className="item-image-container">
                      <img src={item.imageUrl} alt={item.name} />
                      <div className="item-category-badge">
                        <span className={`category-dot ${item.category.toLowerCase()}`}></span>
                        {item.category}
                      </div>
                    </div>
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <div className="item-seasons">
                        {item.seasons && item.seasons.map(season => (
                          <span key={season} className="season-badge">{season}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="outfit-description">
                <h3>About This Outfit</h3>
            {aiDescription ? (
              <p>{aiDescription}</p>
            ) : (
              <p>
                Perfect for {generatedOutfit.occasion} occasions during {generatedOutfit.season} season. 
                {generatedOutfit.weather !== generatedOutfit.season && ` Ideal for ${generatedOutfit.weather} weather.`}
                {generatedOutfit.styleVibe && ` Styled with a ${generatedOutfit.styleVibe} vibe.`}
              </p>
            )}
              </div>

              <div className="outfit-actions">
                <button className="action-btn primary" onClick={regenerateOutfit}>
                  <i className="bi bi-arrow-clockwise"></i>
                  Generate Similar
                </button>
                <button className="action-btn secondary">
                  <i className="bi bi-share"></i>
                  Share Outfit
                </button>
                <button className="action-btn secondary">
                  <i className="bi bi-download"></i>
                  Save Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
