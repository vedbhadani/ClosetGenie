import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from '@convex/_generated/api';
import { useUser } from "@clerk/clerk-react";
import { HistorySkeleton } from '@/shared/components/PageSkeleton';
import { FiClock, FiHeart, FiTrash2, FiSearch, FiEye, FiX, FiCheck, FiStar } from 'react-icons/fi';

function OutfitHistory() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const userId = user?.id;

  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'ai-suggest'
  const [selectedOutfit, setSelectedOutfit] = useState(null);

  React.useEffect(() => {
    if (selectedOutfit) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedOutfit]);

  const rawOutfits = useQuery(api.wardrobe.getOutfitHistory, userId ? { userId } : "skip");
  const isLoading = !isUserLoaded || (userId && rawOutfits === undefined);
  const outfits = rawOutfits || [];
  
  const toggleFavoriteMutation = useMutation(api.wardrobe.toggleFavoriteOutfit);
  const deleteOutfitMutation = useMutation(api.wardrobe.deleteOutfit);
  const clearHistoryMutation = useMutation(api.wardrobe.clearHistory);

  if (isLoading) return <HistorySkeleton />;

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

  const tabFilterOutfits = outfits.filter(o => {
    if (activeTab === 'generator') return o.items && o.items.length > 0;
    if (activeTab === 'ai-suggest') return !o.items || o.items.length === 0;
    return true;
  });
  const visibleOutfits = favoritesOnly ? tabFilterOutfits.filter(o => o.isFavorite) : tabFilterOutfits;

  return (
    <div className="w-full bg-surface pb-[90px] lg:pb-12 min-h-screen">
      
      {/* Header */}
      <section className="px-6 lg:px-12 pt-10 pb-6 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold text-on-surface tracking-tight leading-[1.1]">Outfits</h1>
            <p className="font-body text-sm text-on-surface/60 mt-2 max-w-sm">Review your previously generated looks and curated favorites.</p>
          </div>
          
          <div className="flex gap-4 md:gap-6 w-full md:w-auto overflow-x-auto hide-scrollbar pb-2 md:pb-0 shrink-0">
            <div className="flex bg-surface-container border border-outline-variant/30 rounded-full p-1">
              <button 
                onClick={() => setActiveTab('generator')}
                className={`px-4 py-1.5 rounded-full font-label text-xs uppercase tracking-wider transition ${
                  activeTab === 'generator' ? 'bg-surface-container-lowest text-on-surface shadow-sm font-bold' : 'text-on-surface/60 hover:text-on-surface'
                }`}
              >
                Generated
              </button>
              <button 
                onClick={() => setActiveTab('ai-suggest')}
                className={`px-4 py-1.5 rounded-full font-label text-xs uppercase tracking-wider transition ${
                  activeTab === 'ai-suggest' ? 'bg-surface-container-lowest text-on-surface shadow-sm font-bold' : 'text-on-surface/60 hover:text-on-surface'
                }`}
              >
                AI Suggest
              </button>
            </div>
            
            <button
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-full font-label text-xs uppercase tracking-wider transition ${
                favoritesOnly 
                  ? 'bg-primary-container text-on-primary border-primary-container font-semibold' 
                  : 'bg-transparent text-on-surface border-outline-variant/50 hover:bg-surface-container-low'
              }`}
            >
              <FiHeart className={favoritesOnly ? "fill-on-primary" : ""} />
              Favorites Mode
            </button>
            {outfits.length > 0 && (
              <button 
                onClick={clearAll}
                className="flex items-center gap-2 px-4 py-2 bg-error/10 text-error rounded-full font-label text-xs uppercase tracking-wider hover:bg-error/20 transition"
              >
                <FiTrash2 /> Clear All
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="px-6 lg:px-12 max-w-[1400px] mx-auto mt-4">
        {visibleOutfits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface/40 mb-4">
              <FiClock size={24} />
            </div>
            <h3 className="font-display font-semibold text-xl mb-1">No History Yet</h3>
            <p className="font-body text-sm text-on-surface/50 max-w-sm mb-6">
              {favoritesOnly ? "You haven't favorited any outfits yet." : "Head over to the AI Outfit Generator to start curating looks."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleOutfits.map(outfit => (
              <div 
                key={outfit._id} 
                className="group relative bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden hover:shadow-ambient transition-all duration-300"
              >
                
                {/* Images Preview Stack */}
                <div 
                  className="aspect-video bg-surface-container-low p-4 flex gap-2 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedOutfit(outfit)}
                >
                  {(outfit.items && outfit.items.length > 0) ? (
                    outfit.items.slice(0,3).map((item, idx) => (
                      <div key={idx} className="flex-1 rounded-lg overflow-hidden border border-outline-variant/10 shadow-sm relative bg-surface-container-lowest">
                        <img src={item.imageUrl} className="w-full h-full object-cover mix-blend-multiply" />
                      </div>
                    ))
                  ) : outfit.baseItem ? (
                     <div className="w-full h-full flex-1 rounded-lg border border-outline-variant/10 shadow-sm" style={{ backgroundColor: outfit.baseItem.color }}></div>
                  ) : (
                     <div className="w-full h-full flex-1 rounded-lg bg-primary-container/5 border border-outline-variant/30 shadow-sm flex items-center justify-center text-primary-container">
                       <span className="font-label text-xs uppercase tracking-widest font-semibold flex items-center gap-1"><FiStar size={12}/> AI Scratch</span>
                     </div>
                  )}
                </div>

                {/* Card Info */}
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <h3 
                      className="font-body font-semibold text-base line-clamp-1 cursor-pointer hover:text-primary-container"
                      onClick={() => setSelectedOutfit(outfit)}
                    >
                      {outfit.title || 'Generated Outfit'}
                    </h3>
                    <div className="flex gap-1 shrink-0">
                      <button 
                        onClick={() => toggleFavorite(outfit._id)}
                        className={`p-1.5 rounded-full transition ${outfit.isFavorite ? 'text-primary-container bg-primary-container/10' : 'text-on-surface/40 hover:bg-surface-container-high'}`}
                      >
                        <FiHeart size={16} className={outfit.isFavorite ? "fill-primary-container" : ""} />
                      </button>
                      <button 
                        onClick={() => deleteOutfit(outfit._id)}
                        className="p-1.5 rounded-full text-on-surface/40 hover:bg-error/10 hover:text-error transition"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {outfit.occasion && <span className="px-2.5 py-1 bg-surface-container-high rounded-full font-label text-[9px] uppercase tracking-wider text-on-surface/70">{outfit.occasion}</span>}
                    {outfit.season && <span className="px-2.5 py-1 bg-surface-container-high rounded-full font-label text-[9px] uppercase tracking-wider text-on-surface/70">{outfit.season}</span>}
                    {outfit.weather && <span className="px-2.5 py-1 bg-secondary-container/50 rounded-full font-label text-[9px] uppercase tracking-wider text-on-secondary-container">{outfit.weather}</span>}
                  </div>
                  
                  <p className="font-label text-[10px] text-on-surface/40 tracking-wider">
                    {formatDate(outfit.createdAt)}
                  </p>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* Outfit Modal (Matches Generator UI) */}
      {selectedOutfit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pb-safe">
          <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-md" onClick={() => setSelectedOutfit(null)}></div>
          
          <div className="relative w-full max-w-lg max-h-[90vh] bg-surface-container-lowest rounded-2xl shadow-ambient overflow-y-auto hide-scrollbar flex flex-col">
            
            <div className="sticky top-0 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-outline-variant/20 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="font-display font-bold text-lg line-clamp-1">{selectedOutfit.title || 'Outfit Details'}</h2>
              <button onClick={() => setSelectedOutfit(null)} className="p-2 -mr-2 rounded-full hover:bg-surface-container-low transition">
                <FiX />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-8">
              
              <div className="flex flex-wrap justify-center gap-2">
                {selectedOutfit.occasion && <span className="px-3 py-1 bg-surface-container-high rounded-full font-label text-[10px] uppercase tracking-wider">{selectedOutfit.occasion}</span>}
                {selectedOutfit.season && <span className="px-3 py-1 bg-surface-container-high rounded-full font-label text-[10px] uppercase tracking-wider">{selectedOutfit.season}</span>}
                {selectedOutfit.weather && <span className="px-3 py-1 bg-secondary-container/50 rounded-full font-label text-[10px] uppercase tracking-wider text-on-secondary-container">{selectedOutfit.weather}</span>}
              </div>

              {(selectedOutfit.items && selectedOutfit.items.length > 0) ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {selectedOutfit.items.map((item, index) => (
                    <div key={index} className="flex flex-col gap-2">
                      <div className="aspect-[4/5] bg-surface-container-low rounded-lg overflow-hidden flex items-center justify-center shadow-sm">
                        <img src={item.imageUrl} className="w-full h-full object-cover mix-blend-multiply" />
                      </div>
                      <div className="text-center">
                        <p className="font-body font-semibold text-xs line-clamp-1">{item.name}</p>
                        <p className="font-label text-[9px] uppercase tracking-wider text-on-surface/50 mt-0.5">{item.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {selectedOutfit.baseItem && (
                     <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-surface-container-low rounded-xl">
                       <div className="w-12 h-12 shrink-0 rounded-full border-2 border-outline-variant shadow-sm" style={{ backgroundColor: selectedOutfit.baseItem.color }}></div>
                       <div>
                         <p className="font-body font-semibold text-sm">Base Item: {selectedOutfit.baseItem.type}</p>
                         <p className="font-label text-[10px] text-on-surface/60 uppercase tracking-widest mt-0.5">{selectedOutfit.baseItem.colorName}</p>
                       </div>
                     </div>
                  )}
                  {selectedOutfit.suggestion && selectedOutfit.suggestion.map((point, index) => {
                    if (point.includes('---GENIE---')) {
                      const [content, genie] = point.split('---GENIE---');
                      return (
                        <div key={index} className="flex flex-col gap-4">
                          <div className="flex gap-4 items-start p-4 bg-surface-container-lowest border border-outline-variant/30 shadow-sm rounded-xl">
                            <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-primary-container/10 text-primary-container rounded-full font-display font-bold text-sm">
                               {String(index + 1).padStart(2, '0')}
                            </span>
                            <div className="font-body text-sm leading-relaxed text-on-surface/80 pt-1 prose prose-p:my-1 prose-strong:text-on-surface prose-strong:font-semibold" dangerouslySetInnerHTML={{__html: content.replace(/\*(.*?)\*/g, '<strong>$1</strong>').trim() }}></div>
                          </div>
                          <div className="mt-2 p-6 bg-gradient-to-br from-primary-container/20 to-primary-container/5 border border-primary-container/30 rounded-2xl text-center shadow-ambient">
                            <h3 className="font-display font-bold flex items-center justify-center gap-2 text-primary-container mb-3 text-lg">
                               <FiStar /> Genie Suggested
                            </h3>
                            <div className="font-body text-base text-on-surface/90 italic leading-relaxed" dangerouslySetInnerHTML={{__html: genie.trim().replace(/\*(.*?)\*/g, '<strong>$1</strong>')}}></div>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div key={index} className="flex gap-4 items-start p-4 bg-surface-container-lowest border border-outline-variant/30 shadow-sm rounded-xl">
                        <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-primary-container/10 text-primary-container rounded-full font-display font-bold text-sm">
                           {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="font-body text-sm leading-relaxed text-on-surface/80 pt-1 prose prose-p:my-1 prose-strong:text-on-surface prose-strong:font-semibold" dangerouslySetInnerHTML={{__html: point.replace(/\*(.*?)\*/g, '<strong>$1</strong>').trim() }}></div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="text-center pt-4 border-t border-outline-variant/20">
                <p className="font-label text-xs uppercase tracking-widest text-on-surface/40">Archived on {formatDate(selectedOutfit.createdAt)}</p>
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

export default OutfitHistory;
