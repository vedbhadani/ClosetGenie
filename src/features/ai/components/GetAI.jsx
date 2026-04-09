import React, { useState, useEffect } from 'react'
import ImageUploader from '@/features/wardrobe/components/ImageUploader'
import { useNavigate } from 'react-router-dom';
import ColorThief from 'colorthief';
import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useUser } from '@clerk/clerk-react';
import { FiStar, FiSave, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { useAIService } from '@/features/ai/services/aiService';

const GetAI = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const userId = user?.id;
  const aiService = useAIService();
  const generateUploadUrl = useMutation(api.wardrobe.generateUploadUrl);

  const [file, setFile] = useState(null);
  const [clothingType, setClothingType] = useState("");
  const [occasion, setOccasion] = useState("Casual");
  const [vibe, setVibe] = useState("Chill");
  const [weather, setWeather] = useState("Sunny");
  const [season, setSeason] = useState("Summer");
  const [customDescription, setCustomDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [dominantColor, setDominantColor] = useState("");
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiDetected, setAiDetected] = useState(false);
  const [hasAiError, setHasAiError] = useState(false);
  const [isWeatherAutoDetected, setIsWeatherAutoDetected] = useState(false);
  
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  useEffect(() => {
    if (suggestion || showErrorPopup || showDiscardConfirm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [suggestion, showErrorPopup]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
          const data = await res.json();
          const code = data.current_weather?.weathercode;
          
          if (code === 0) {
            setWeather("Sunny");
          } else if ([1, 2, 3, 45, 48].includes(code)) {
            setWeather("Cloudy");
          } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code)) {
            setWeather("Rainy");
          } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
            setWeather("Snowy");
          }
          setIsWeatherAutoDetected(true);
        } catch (err) {
          console.error("Failed to fetch current weather:", err);
        }
      }, (err) => {
        console.log("Geolocation access denied or failed. Defaulting to Sunny.", err);
      });
    }
  }, []);

  const getColorName = (rgbString) => {
    if (!rgbString) return "";
    const rgb = rgbString.match(/\d+/g)?.map(Number);
    if (!rgb || rgb.length < 3) return "";
    const [r, g, b] = rgb;

    const colors = {
      'black': [0, 0, 0], 'white': [255, 255, 255], 'red': [255, 0, 0],
      'green': [0, 255, 0], 'blue': [0, 0, 255], 'yellow': [255, 255, 0],
      'purple': [128, 0, 128], 'pink': [255, 192, 203], 'orange': [255, 165, 0],
      'brown': [165, 42, 42], 'gray': [128, 128, 128], 'navy': [0, 0, 128],
      'maroon': [128, 0, 0], 'teal': [0, 128, 128], 'olive': [128, 128, 0],
      'beige': [245, 245, 220], 'cyan': [0, 255, 255], 'magenta': [255, 0, 255]
    };

    let minDistance = Infinity;
    let closestColor = '';

    for (const [colorName, colorValue] of Object.entries(colors)) {
      const distance = Math.sqrt(
        Math.pow(r - colorValue[0], 2) +
        Math.pow(g - colorValue[1], 2) +
        Math.pow(b - colorValue[2], 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestColor = colorName;
      }
    }
    return closestColor;
  };

  const isButtonDisabled = isLoading; // Allow generating without file

  const extractColor = (imageSrc) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      try {
        const colorThief = new ColorThief()
        const color = colorThief.getColor(img)
        const rgbColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        setDominantColor(rgbColor);
      } catch (e) {
        console.error("ColorThief failed", e);
      }
    }
    img.src = imageSrc
  }

  const handleImageUpload = async (imageData, fileObj) => {
    setFile(imageData);
    setAiDetected(false);
    setHasAiError(false);
    extractColor(imageData);

    if (fileObj) {
      setIsAnalyzing(true);
      try {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": fileObj.type },
          body: fileObj,
        });
        const { storageId } = await result.json();

        // Use AI vision to detect clothing type
        const aiResult = await aiService.analyzeClothingImage(storageId);
        
        if (aiResult) {
          setClothingType(aiResult.category || "");
          setAiDetected(true);
        } else {
          setHasAiError(true);
        }
      } catch (err) {
        console.error("Vision AI Error:", err);
        setHasAiError(true);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const addOutfitMutation = useMutation(api.wardrobe.addOutfit);

  const saveToHistory = async () => {
    if (!userId) {
      alert("Please sign in to save outfits.");
      return;
    }

    let suggestionPoints = [];
    if (suggestion.includes('---GENIE---')) {
      const parts = suggestion.split('---GENIE---');
      suggestionPoints = parts[0]
        .split(/\d+\./)
        .filter(point => point.trim())
        .map(point => point.trim());
      suggestionPoints.push('---GENIE---' + parts[1].trim());
    } else {
      suggestionPoints = suggestion
        .split(/\d+\./)
        .filter(point => point.trim())
        .map(point => point.trim());
    }

    // Fix: We provide baseItem only if there's a specific type selected
    const baseItem = clothingType ? {
      type: clothingType,
      color: dominantColor || 'rgb(0,0,0)',
      colorName: getColorName(dominantColor) || 'Mixed'
    } : undefined;

    const newOutfit = {
      userId,
      title: clothingType ? `AI Suggestion for ${clothingType}` : `AI Suggestion for a ${vibe} look`,
      occasion,
      season,
      weather,
      styleVibe: vibe,
      isFavorite: false,
      baseItem: baseItem,
      suggestion: suggestionPoints
    };
    
    try {
      await addOutfitMutation(newOutfit);
      setSuggestion(""); // Firmly close popup
      navigate('/outfit-history');
    } catch (err) {
      console.error('Error saving outfit:', err);
      alert('Failed to save outfit history.');
    }
  };

  const getOutfitSuggestion = async (bypassCache = false) => {
    setIsLoading(true);
    let prompt = "";
    
    if (file || clothingType) {
      // Suggesting around a specific uploaded/typed item
      const colorName = dominantColor ? getColorName(dominantColor) : "colored";
      const itemDescription = clothingType ? `${colorName} ${clothingType}` : `your ${colorName} item`;
      
      prompt = `Act as an expert high-fashion stylist. Tell me what to wear based on the following:
      I have a ${itemDescription}. The occasion is ${occasion}. The overall vibe should be ${vibe}, and the weather is ${weather} during the ${season} season. ${customDescription ? `Additional context: ${customDescription}. ` : ''}
      Provide a highly detailed, curated outfit. Structure your response EXACTLY like this (you MUST include the ---GENIE--- separator line):
      
      1. *The Outfit:* Detailed description of the top, bottom, or dress to wear, and why it works.
      2. *Footwear:* What specific shoes to pair with it and why.
      3. *Accessories:* Matching statement pieces, jewelry, or bags.
      
      ---GENIE---
      Write a punchy, 1-2 sentence final verdict of exactly how to embody this look.`;
    } else {
      // General suggestion purely based on dropdown preferences (no item uploaded)
      prompt = `Act as an expert high-fashion stylist. I need a whole outfit from scratch.
      The occasion is ${occasion}. The overall vibe should be ${vibe}, and the weather is ${weather} during the ${season} season. ${customDescription ? `Additional context: ${customDescription}. ` : ''}
      Provide a highly detailed, curated outfit from head to toe. Structure your response EXACTLY like this (you MUST include the ---GENIE--- separator line):
      
      1. *The Outfit:* Detailed description of the top, bottom, or dress to wear. Include specific colors.
      2. *Footwear:* What specific shoes to pair with it.
      3. *Accessories:* Matching statement pieces, jewelry, or bags.
      
      ---GENIE---
      Write a punchy, 1-2 sentence final verdict of exactly how to embody this look.`;
    }

    try {
      setShowErrorPopup(false);
      setErrorMessage("");
      let result = await aiService.generateCreativeOutput(prompt, bypassCache);
      
      if (result && !result.includes('---GENIE---')) {
        // Fallback parser if AI ignores our strict prompt
        result = result.replace(/Final [Vv]erdict:?\s*/i, '\n---GENIE---\n');
        if (!result.includes('---GENIE---')) {
          result = result.replace(/[Vv]erdict:?\s*/i, '\n---GENIE---\n');
        }
      }
      
      setSuggestion(result || "No suggestion received.");
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(error.message || "Failed to get suggestion. Please try again.");
      setShowErrorPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const selectClass = "w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg font-body text-sm focus:outline-none focus:border-primary-container transition appearance-none";

  return (
    <div className="w-full bg-surface overflow-y-hidden overflow-x-hidden" style={{ height: 'calc(100vh - 76px)' }}>

      {/* Header */}
      <section className="px-6 lg:px-12 pt-10 pb-4 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-secondary-container/50 text-on-secondary-container rounded-full font-label text-[10px] uppercase tracking-wider flex items-center gap-1.5">
            <FiStar size={12} /> AI Stylist
          </span>
        </div>
        <h1 className="font-display text-4xl font-bold text-on-surface tracking-tight leading-[1.1]">
          Style <span className="text-primary-container">Advisor</span>
        </h1>
        <p className="font-body text-sm text-on-surface/60 max-w-md mt-2">
          Upload a clothing item or just set your preferences, and let AI curate a complete look that fits the moment.
        </p>
      </section>



      <main className="px-6 lg:px-12 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 mt-6">

        {/* Upload Section */}
        <div className="flex flex-col justify-between gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-[0_2px_12px_rgba(26,28,28,0.02)] flex-1">
            <h2 className="font-display font-bold text-lg mb-4">Base Item <span className="text-on-surface/40 text-sm font-normal">(Optional)</span></h2>
            <ImageUploader onImageUpload={handleImageUpload} />
            
            {/* AI Image Analysis Tracking */}
            {isAnalyzing && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-secondary-container/20 rounded-lg text-on-secondary-container/80 text-sm animate-pulse">
                <span className="w-4 h-4 border-2 border-on-secondary-container border-t-transparent rounded-full animate-spin"></span>
                AI is analyzing your item...
              </div>
            )}
            {aiDetected && !isAnalyzing && (
              <div className="flex items-center gap-2 mt-4 p-3 border border-[#064e3b] bg-[#064e3b]/5 text-[#064e3b] rounded-lg text-sm">
                <FiStar /> AI successfully tagged your item.
              </div>
            )}
            {hasAiError && !isAnalyzing && (
              <div className="flex items-center gap-2 mt-4 p-3 border border-[#ba1a1a]/30 bg-[#ba1a1a]/5 text-[#ba1a1a] rounded-lg text-sm">
                <FiAlertCircle /> AI analysis failed, fill manually.
              </div>
            )}

            {file && dominantColor && (
              <div className="flex items-center gap-3 mt-4 p-3 bg-surface-container-low rounded-lg">
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest shadow-sm" style={{ backgroundColor: dominantColor }}></div>
                <span className="font-body text-sm text-on-surface/80">
                  {clothingType ? `${clothingType}: ${getColorName(dominantColor)}` : `Detected: ${getColorName(dominantColor)}`}
                </span>
              </div>
            )}
            {!file && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-secondary-container/20 rounded-lg text-on-secondary-container/70">
                <FiInfo className="flex-shrink-0" />
                <span className="font-body text-xs">Skip uploading if you just want general outfit ideas based on your preferences!</span>
              </div>
            )}
          </div>

          {/* How it Works — narrow, matching Base Item width */}
          <div className="bg-secondary-container/20 border border-secondary-container/30 rounded-xl p-4 flex gap-3 items-start">
            <div className="w-8 h-8 shrink-0 bg-secondary-container text-primary-container rounded-full flex items-center justify-center">
              <FiInfo size={16} />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-on-surface">How does this work?</h3>
              <p className="font-body text-xs text-on-surface/70 mt-1 leading-relaxed">
                <strong>Option A:</strong> Upload a photo — AI will tag it and build a complete outfit around it.<br/>
                <strong>Option B:</strong> Skip the upload and just set your preferences for a fresh look from scratch.
              </p>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="font-display font-bold text-lg mb-1">Style Preferences</h2>
            <p className="font-body text-xs text-on-surface/50">Tell us about the occasion and vibe</p>
          </div>
          
          <div className="flex flex-col gap-4">
            <div>
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/50 ml-1 mb-1 block">Clothing Type</label>
              <input
                type="text"
                value={clothingType}
                onChange={(e) => setClothingType(e.target.value)}
                placeholder={file ? "e.g., T-shirt, Jeans, Dress" : "Leave blank for a full outfit from scratch"}
                className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg font-body text-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/50 ml-1 mb-1 block">Occasion</label>
                <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className={selectClass}>
                  <option value="Casual">Casual</option>
                  <option value="Formal">Formal</option>
                  <option value="Business">Business</option>
                  <option value="Party">Party</option>
                  <option value="Date">Date</option>
                  <option value="Sport">Sport</option>
                </select>
              </div>

              <div>
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/50 ml-1 mb-1 block">Vibe</label>
                <select value={vibe} onChange={(e) => setVibe(e.target.value)} className={selectClass}>
                  <option value="Chill">Chill</option>
                  <option value="Elegant">Elegant</option>
                  <option value="Trendy">Trendy</option>
                  <option value="Classic">Classic</option>
                  <option value="Bold">Bold</option>
                  <option value="Minimalist">Minimalist</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/50 ml-1 mb-1 flex items-center justify-between">
                  Weather
                  {isWeatherAutoDetected && <span className="text-[8px] text-primary-container tracking-normal lowercase bg-primary-container/10 px-1.5 py-0.5 rounded flex items-center gap-1"><FiStar size={8}/> auto-detected</span>}
                </label>
                <select value={weather} onChange={(e) => { setWeather(e.target.value); setIsWeatherAutoDetected(false); }} className={selectClass}>
                  <option value="Sunny">Sunny</option>
                  <option value="Rainy">Rainy</option>
                  <option value="Cloudy">Cloudy</option>
                  <option value="Snowy">Snowy</option>
                  <option value="Windy">Windy</option>
                </select>
              </div>

              <div>
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/50 ml-1 mb-1 block">Season</label>
                <select value={season} onChange={(e) => setSeason(e.target.value)} className={selectClass}>
                  <option value="Summer">Summer</option>
                  <option value="Winter">Winter</option>
                  <option value="Spring">Spring</option>
                  <option value="Fall">Fall</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface/50 ml-1 mb-1 block">Extra Details <span className="opacity-60">(Optional)</span></label>
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Going to a specific party? Looking to incorporate a particular color? Tell the AI any extra details..."
                className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg font-body text-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition min-h-[100px] resize-y"
              />
            </div>
          </div>

          <button
            className={`w-full flex items-center justify-center gap-3 bg-primary-container text-on-primary px-8 py-4 rounded-lg font-body font-semibold text-lg hover:opacity-90 transition shadow-ambient disabled:opacity-50`}
            onClick={() => !isButtonDisabled && getOutfitSuggestion()}
            disabled={isButtonDisabled}
          >
            {isLoading ? (
              <>
                <span className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin flex-shrink-0" />
                <span className="text-center">Getting Suggestions...<br/><span className="text-xs opacity-80">(Using free AI, may take longer)</span></span>
              </>
            ) : (
              'Get Outfit Suggestions'
            )}
          </button>
        </div>
      </main>

      {/* Suggestion Results Modal */}
      {suggestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pb-safe">
          <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-md" onClick={() => setSuggestion("")}></div>
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-surface-container-lowest rounded-2xl shadow-ambient flex flex-col animate-in zoom-in-95 fade-in duration-200">
            
            <div className="sticky top-0 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-outline-variant/20 px-6 py-4 flex justify-between items-center z-10 rounded-t-2xl">
              <h2 className="font-display font-bold text-xl text-primary-container tracking-tight">Your Custom Look</h2>
            </div>
            
            <div className="p-6 lg:p-8 overflow-y-auto hide-scrollbar flex flex-col gap-6">
              {suggestion.includes('---GENIE---') ? (
                <>
                  <div className="flex flex-col gap-4">
                    {suggestion.split('---GENIE---')[0].split(/\d+\./).filter(point => point.trim()).map((point, index) => (
                      <div key={index} className="flex gap-4 items-start p-4 bg-surface-container-low/50 rounded-xl shadow-sm border border-outline-variant/10">
                        <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-primary-container/10 text-primary-container rounded-full font-display font-bold text-sm">
                           {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="font-body text-sm leading-relaxed text-on-surface/80 pt-1 prose prose-p:my-1 prose-strong:text-on-surface prose-strong:font-semibold" dangerouslySetInnerHTML={{__html: point.replace(/\*(.*?)\*/g, '<strong>$1</strong>').trim() }}></div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 p-6 bg-gradient-to-br from-primary-container/20 to-primary-container/5 border border-primary-container/30 rounded-2xl text-center shadow-ambient">
                    <h3 className="font-display font-bold flex items-center justify-center gap-2 text-primary-container mb-3 text-lg">
                       <FiStar /> Genie Suggested
                    </h3>
                    <div className="font-body text-base text-on-surface/90 italic leading-relaxed" dangerouslySetInnerHTML={{__html: suggestion.split('---GENIE---')[1].trim().replace(/\*(.*?)\*/g, '<strong>$1</strong>')}}></div>
                  </div>
                </>
              ) : suggestion.match(/\d+\./) ? (
                suggestion.split(/\d+\./).filter(point => point.trim()).map((point, index) => (
                  <div key={index} className="flex gap-4 items-start p-4 bg-surface-container-low/50 rounded-xl">
                    <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-primary-container/10 text-primary-container rounded-full font-display font-bold text-sm">
                       {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="font-body text-sm leading-relaxed text-on-surface/80 pt-1 prose prose-p:my-1 prose-strong:text-on-surface prose-strong:font-semibold" dangerouslySetInnerHTML={{__html: point.replace(/\*(.*?)\*/g, '<strong>$1</strong>').trim() }}></div>
                  </div>
                ))
              ) : (
                <div className="flex gap-4 items-start p-4 bg-surface-container-low/50 rounded-xl text-on-surface/70 border border-outline-variant/20 shadow-sm">
                  <FiInfo size={20} className="flex-shrink-0 mt-0.5 text-primary-container" />
                  <div className="font-body text-sm leading-relaxed whitespace-pre-wrap">{suggestion}</div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-outline-variant/20 bg-surface-container-lowest rounded-b-2xl flex flex-col sm:flex-row gap-3 justify-end items-center">
              <button 
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-outline-variant/60 font-body font-semibold text-sm hover:bg-surface-container-low transition"
                onClick={() => setSuggestion("")}
              >
                Close
              </button>
              <button 
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-error/10 text-error font-body font-semibold text-sm hover:bg-error/20 transition"
                onClick={() => setShowDiscardConfirm(true)}
              >
                Discard & Regenerate
              </button>
              <button 
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-2.5 bg-primary-container text-on-primary rounded-lg font-body font-semibold text-sm hover:opacity-90 transition shadow-ambient"
                onClick={saveToHistory}
              >
                <FiSave /> Save to History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discard Confirmation Modal */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-sm flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <h3 className="font-display font-bold text-lg text-on-surface">Discard Output?</h3>
            <p className="font-body text-sm text-on-surface/70 leading-relaxed">
              Discarding will delete this response permanently. Do you want to generate a new outfit with the same inputs?
            </p>
            <div className="flex gap-3 justify-end mt-4">
              <button 
                onClick={() => setShowDiscardConfirm(false)}
                className="px-5 py-2.5 rounded-lg font-body font-semibold text-sm hover:bg-surface-container-low transition"
              >
                No, Keep it
              </button>
              <button 
                onClick={() => {
                  setShowDiscardConfirm(false);
                  setSuggestion("");
                  getOutfitSuggestion(true);
                }}
                className="px-5 py-2.5 rounded-lg bg-error text-on-error font-body font-semibold text-sm hover:opacity-90 shadow-sm transition"
              >
                Yes, Discard & Regenerate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Popup Modal */}
      {showErrorPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-sm flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center">
                <FiAlertCircle size={24} />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg mb-1 text-on-surface">Oops!</h3>
                <p className="font-body text-sm text-on-surface/70 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-center mt-2 w-full">
              <button 
                onClick={() => setShowErrorPopup(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-outline-variant/60 font-body font-semibold text-sm hover:bg-surface-container-low transition"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowErrorPopup(false);
                  getOutfitSuggestion(true);
                }}
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary-container text-on-primary font-body font-semibold text-sm hover:opacity-90 shadow-ambient transition"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetAI;