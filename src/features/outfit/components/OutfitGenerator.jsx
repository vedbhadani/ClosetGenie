import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useUser } from '@clerk/clerk-react';
import useWeather from '@/features/weather/hooks/useWeather';
import { GeneratorSkeleton } from '@/shared/components/PageSkeleton';
import { FiCloud, FiSun, FiWind, FiUmbrella, FiThermometer, FiCalendar, FiHeart, FiRefreshCcw, FiShare, FiDownload, FiX } from 'react-icons/fi';

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
    <div className="w-full bg-surface overflow-y-hidden overflow-x-hidden" style={{ height: "calc(100vh - 76px)" }}>
      {/* Header */}
      <section className="px-6 lg:px-12 pt-10 pb-4 max-w-[1400px] mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-4xl font-bold text-on-surface tracking-tight leading-[1.1]">Outfit Builder</h1>
          <p className="font-body text-sm text-on-surface/60 max-w-sm">Curate perfect combinations using AI styling logic connected directly to your archive.</p>
        </div>
      </section>

      <main className="px-6 lg:px-12 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 mt-6">
        
        {/* Builder Canvas (Left) */}
        <div className="lg:col-span-7 flex flex-col gap-8">

          {/* Occasion */}
          <div>
            <h3 className="font-display font-semibold text-sm mb-3 uppercase tracking-widest text-on-surface/80 flex items-center gap-2">
              <span className="w-4 h-[1px] bg-outline-variant"></span> Occasion
            </h3>
            <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2" role="group">
              {['casual', 'work', 'formal', 'date', 'workout', 'party'].map(val => (
                <button
                  key={val}
                  onClick={() => setOccasion(val)}
                  className={`flex-shrink-0 px-5 py-2.5 rounded-full font-label text-sm capitalize transition shadow-sm border ${
                    occasion === val 
                      ? 'bg-primary-container text-on-primary border-primary-container font-semibold' 
                      : 'bg-surface-container-lowest text-on-surface border-outline-variant/30 hover:border-primary-container/30'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Weather Status */}
          <div className="bg-surface-container-low p-4 rounded-lg flex items-center justify-between border border-outline-variant/20 shadow-[0_2px_12px_rgba(26,28,28,0.02)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                {weatherLoading ? <FiRefreshCcw className="animate-spin" /> : <FiCloud />}
              </div>
              <div>
                <p className="font-display font-semibold text-sm">Weather Detect</p>
                <p className="font-body text-xs text-on-surface/60 mt-0.5">
                  {weatherLoading ? 'Detecting local climate...' : (weatherError ? 'Detection failed' : `Live: ${temperature}°C in ${locationName}`)}
                </p>
              </div>
            </div>
          </div>

          {/* Season & Weather Manually */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-display font-semibold text-sm mb-3 uppercase tracking-widest text-on-surface/80 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-outline-variant"></span> Season
              </h3>
              <div className="flex flex-wrap gap-2">
                {['spring', 'summer', 'fall', 'winter'].map(val => (
                  <button
                    key={val}
                    onClick={() => setSeason(val)}
                    className={`px-4 py-2 rounded-full font-label text-xs uppercase tracking-wider transition border ${
                      season === val 
                        ? 'bg-secondary-container text-on-secondary-container border-secondary-container font-semibold' 
                        : 'bg-surface-container-lowest text-on-surface border-outline-variant/30'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-display font-semibold text-sm mb-3 uppercase tracking-widest text-on-surface/80 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-outline-variant"></span> Condition
              </h3>
              <div className="flex flex-wrap gap-2">
                {['sunny', 'rainy', 'cold', 'hot', 'windy'].map(val => (
                  <button
                    key={val}
                    onClick={() => setWeather(val)}
                    className={`px-4 py-2 rounded-full font-label text-xs capitalize transition border ${
                      weather === val 
                        ? 'bg-surface-container-highest text-on-surface border-on-surface font-semibold' 
                        : 'bg-surface-container-lowest text-on-surface border-outline-variant/30'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notice & CTA */}
          <div className="pt-4">
            {notice && (
              <div className="mb-4 bg-error-container text-on-error-container p-4 rounded-md font-body text-sm flex justify-between items-start">
                <span>{notice.text}</span>
                <button onClick={() => setNotice(null)}><FiX /></button>
              </div>
            )}
            <button 
              onClick={() => !isGenerating && generateOutfit()}
              disabled={isGenerating || wardrobeItems.length === 0}
              className="w-full flex items-center justify-center gap-3 bg-primary-container text-on-primary px-8 py-4 rounded-lg font-body font-semibold text-lg hover:opacity-90 transition shadow-ambient disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <span className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin flex-shrink-0" />
                  Generating Curated Look...
                </>
              ) : (
                'Generate Styles'
              )}
            </button>
          </div>

        </div>

        {/* History (Right Side Desktop) */}
        <div className="lg:col-span-5 flex flex-col gap-6 lg:border-l lg:border-outline-variant/20 lg:pl-12">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-bold text-lg">Recent Generations</h3>
            {outfitHistory.length > 0 && (
              <button 
                onClick={() => clearHistoryMutation({ userId })}
                className="font-label text-xs font-semibold text-error/80 uppercase tracking-widest hover:text-error"
              >
                Clear
              </button>
            )}
          </div>
          
          <div className="flex flex-col gap-4">
            {outfitHistory.length === 0 ? (
              <div className="p-8 text-center text-on-surface/50 font-body text-sm bg-surface-container-low rounded-lg">
                Your styling history will appear here.
              </div>
            ) : (
              outfitHistory.slice(0, 4).map((outfit) => (
                <div key={outfit._id} className="bg-surface-container-lowest border border-outline-variant/30 p-4 rounded-lg flex items-center gap-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-shadow">
                  <div className="flex -space-x-4">
                    {(outfit.items || []).slice(0, 3).map((item, idx) => (
                      <div key={idx} className="w-12 h-12 rounded-full border-2 border-surface-container-lowest overflow-hidden bg-surface-container-low relative shadow-sm">
                        <img src={item.imageUrl} className="w-full h-full object-cover mix-blend-multiply" />
                      </div>
                    ))}
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-body font-semibold text-sm line-clamp-1">{outfit.title}</h4>
                    <p className="font-label text-[10px] text-on-surface/60 uppercase tracking-widest mt-1">
                      {outfit.occasion} · {outfit.season}
                    </p>
                  </div>
                  <button 
                    onClick={() => toggleFavorite(outfit._id)}
                    className="p-2 -mr-2 text-primary-container"
                  >
                    {outfit.isFavorite ? <FiHeart className="fill-primary-container text-primary-container" /> : <FiHeart />}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Generation Result Swipe Modal (AI Suggestions Style) */}
      {showModal && generatedOutfit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pb-safe">
          <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-md" onClick={handleCloseModal}></div>
          
          <div className="relative w-full max-w-lg max-h-[90vh] bg-surface-container-lowest rounded-2xl shadow-ambient overflow-y-auto hide-scrollbar flex flex-col">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-outline-variant/20 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="font-display font-bold text-lg">{generatedOutfit.title}</h2>
              <button onClick={handleCloseModal} className="p-2 -mr-2 rounded-full hover:bg-surface-container-low transition">
                <FiX />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-8">
              
              <div className="flex justify-center gap-2">
                <span className="px-3 py-1 bg-surface-container-high rounded-full font-label text-[10px] uppercase tracking-wider">{generatedOutfit.occasion}</span>
                <span className="px-3 py-1 bg-surface-container-high rounded-full font-label text-[10px] uppercase tracking-wider">{generatedOutfit.season}</span>
              </div>

              {/* The "Swipe" Canvas Area */}
              <div className="grid grid-cols-2 gap-4">
                {generatedOutfit.items.map((item, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <div className="aspect-[4/5] bg-surface-container-low rounded-lg overflow-hidden flex items-center justify-center shadow-sm">
                      <img src={item.imageUrl} className="w-full h-full object-cover mix-blend-multiply" />
                    </div>
                    <div>
                      <p className="font-body font-semibold text-xs line-clamp-1">{item.name}</p>
                      <p className="font-label text-[9px] uppercase tracking-wider text-on-surface/50 mt-0.5">{item.category}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Description Plate */}
              <div className="bg-secondary-container/30 px-6 py-5 rounded-lg border border-secondary-container/50 text-center">
                <p className="font-display font-semibold text-sm text-primary-container mb-2">Curator Notes</p>
                {aiDescription ? (
                  <p className="font-body text-sm leading-relaxed text-on-surface/80">{aiDescription}</p>
                ) : (
                  <p className="font-body text-sm leading-relaxed text-on-surface/80">
                    A curated {generatedOutfit.occasion} aesthetic tailored for {generatedOutfit.season} weather. 
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-outline-variant/20">
                <button 
                  onClick={() => toggleFavorite(generatedOutfit._id || generatedOutfit.id)}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-low hover:bg-surface-container-high transition"
                >
                  {generatedOutfit.isFavorite ? <FiHeart className="fill-error text-error" /> : <FiHeart className="text-on-surface" />}
                </button>
                
                <button 
                  onClick={regenerateOutfit}
                  className="flex-grow mx-4 items-center justify-center gap-2 bg-primary-container text-on-primary px-4 py-3 rounded-md font-body font-semibold text-sm hover:opacity-90 transition shadow-ambient"
                >
                  Regenerate
                </button>

                <button className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-low hover:bg-surface-container-high transition text-on-surface">
                  <FiShare />
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
      `}} />
    </div>
  );
}
