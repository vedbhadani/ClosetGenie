import React, { useState } from 'react'
import AddItemModal from '@/features/wardrobe/components/AddItemModal';
import { useQuery, useMutation } from "convex/react";
import { api } from '@convex/_generated/api';
import { useUser } from "@clerk/clerk-react";
import { WardrobeSkeleton } from '@/shared/components/PageSkeleton';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiGrid, FiList, FiClock, FiTag, FiHash, FiGrid as FiCollection } from 'react-icons/fi';

function Wardrobe() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const userId = user?.id;

  const [activeFilter, setActiveFilter] = useState('All Items');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [isUploading, setIsUploading] = useState(false);

  const getClothes = useQuery(api.wardrobe.getUserClothes, userId ? { userId } : "skip");
  const isLoading = !isUserLoaded || (userId && getClothes === undefined);
  const items = getClothes || [];

  const generateUploadUrl = useMutation(api.wardrobe.generateUploadUrl);
  const addClothingItem = useMutation(api.wardrobe.addClothingItem);
  const deleteItemMutation = useMutation(api.wardrobe.deleteClothingItem);
  const updateItemMutation = useMutation(api.wardrobe.updateClothingItem);

  if (isLoading) return <WardrobeSkeleton />;

  const handleAddItem = async (newItem) => {
    try {
      if (!userId) return;
      setIsUploading(true);

      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": newItem.imageFile.type },
        body: newItem.imageFile,
      });
      const { storageId } = await result.json();

      await addClothingItem({
        userId,
        name: newItem.name,
        category: newItem.category,
        imageId: storageId,
        seasons: newItem.seasons,
        ...(newItem.color && { color: newItem.color }),
        ...(newItem.tags && { tags: newItem.tags }),
      });
    } catch (error) {
      console.error('Error adding new item:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteItemMutation({ itemId });
    } catch(err) {
      console.error(err);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleUpdateItem = async (updatedData) => {
    try {
      if (!editingItem) return;
      setIsUploading(true);

      const updatePayload = {
        itemId: editingItem._id,
        name: updatedData.name,
        category: updatedData.category,
        seasons: updatedData.seasons,
        ...(updatedData.color && { color: updatedData.color }),
        ...(updatedData.tags && { tags: updatedData.tags }),
      };

      if (updatedData.imageFile) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": updatedData.imageFile.type },
          body: updatedData.imageFile,
        });
        const { storageId } = await result.json();
        updatePayload.imageId = storageId;
      }

      await updateItemMutation(updatePayload);
    } catch (error) {
      console.error('Error updating item:', error);
    } finally {
      setIsUploading(false);
      setEditingItem(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const getFilteredItems = () => {
    let filtered = items;
    
    if (activeFilter !== 'All Items') {
      filtered = filtered.filter(item => item.category === activeFilter);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest': return b.createdAt - a.createdAt;
        case 'oldest': return a.createdAt - b.createdAt;
        case 'name': return a.name.localeCompare(b.name);
        case 'category': return a.category.localeCompare(b.category);
        default: return 0;
      }
    });
    return filtered;
  };

  const getWardrobeStats = () => {
    const totalItems = items.length;
    const categories = [...new Set(items.map(item => item.category))];
    const recentItems = items.filter(item => {
      const itemDate = new Date(item.createdAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return itemDate > weekAgo;
    }).length;
    
    return {
      total: totalItems,
      categories: categories.length,
      recent: recentItems,
      mostUsedCategory: items.length > 0 ? 
        items.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        }, {}) : {}
    };
  };

  const stats = getWardrobeStats();
  const filteredItems = getFilteredItems();

  return (
    <div className="w-full bg-surface pb-[100px]" style={{ minHeight: "calc(100vh - 76px)" }}>
      {/* Header Section */}
      <section className="px-6 lg:px-12 pt-8 pb-6 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-on-surface tracking-tight">Wardrobe</h1>
            <p className="font-body text-sm text-on-surface/60 mt-1">Manage and curate your digital closet.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            disabled={isUploading}
            className="group flex items-center justify-center gap-2 bg-primary-container text-on-primary px-6 py-3 rounded-md font-body font-semibold text-sm hover:opacity-90 transition shadow-ambient disabled:opacity-50"
          >
            {isUploading ? (
              <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin flex-shrink-0" />
            ) : (
              <FiPlus className="group-hover:scale-110 transition-transform" />
            )}
            {isUploading ? 'Uploading...' : 'Add More Items'}
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 lg:px-12 pb-8 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Items', value: stats.total, icon: <FiCollection /> },
            { label: 'Categories', value: stats.categories, icon: <FiHash /> },
            { label: 'Added This Week', value: stats.recent, icon: <FiClock /> },
            { label: 'Top Category', value: Object.keys(stats.mostUsedCategory).length > 0 ? Math.max(...Object.values(stats.mostUsedCategory)) : 0, icon: <FiTag /> },
          ].map((stat, idx) => (
            <div key={idx} className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/30 flex items-center gap-4 shadow-[0_2px_12px_rgba(26,28,28,0.02)]">
              <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary-container">
                {stat.icon}
              </div>
              <div>
                <p className="font-display font-semibold text-xl text-on-surface leading-none">{stat.value}</p>
                <p className="font-label text-[10px] text-on-surface/60 uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Controls & Filters */}
      <section className="sticky top-0 z-30 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/20 mb-8">
        <div className="px-6 lg:px-12 py-4 max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Filter Pill Chips */}
            <div className="w-full md:w-auto flex overflow-x-auto hide-scrollbar gap-2 pb-2 md:pb-0" role="group" aria-label="Filter categories">
              {['All Items', 'Tops', 'Bottoms', 'Footwear', 'Outerwear', 'Accessories'].map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category)}
                  aria-pressed={activeFilter === category}
                  className={`flex-shrink-0 px-4 py-2 rounded-full font-label text-xs uppercase tracking-wider transition-colors ${
                    activeFilter === category 
                      ? 'bg-secondary-container text-on-secondary-container font-semibold' 
                      : 'bg-surface-container-high text-on-surface/60 hover:text-on-surface'
                  }`}
                >
                  {category} <span className="ml-1 opacity-60">
                    ({category === 'All Items' ? items.length : items.filter(i => i.category === category).length})
                  </span>
                </button>
              ))}
            </div>

            {/* View Config */}
            <div className="w-full md:w-auto flex items-center gap-4 justify-between md:justify-end">
              <div className="relative flex-grow md:flex-grow-0">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/40" />
                <input
                  type="text"
                  placeholder="Search closet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-48 pl-9 pr-4 py-2 bg-transparent border-b border-outline-variant/40 outline-none focus:border-primary-container font-body text-sm transition-colors"
                />
              </div>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-b border-outline-variant/40 font-body text-sm py-2 outline-none focus:border-primary-container"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name">Name A-Z</option>
                <option value="category">Category</option>
              </select>
            </div>

          </div>
        </div>
      </section>

      {/* Grid Iteration */}
      <section className="px-6 lg:px-12 max-w-[1400px] mx-auto">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface/40 mb-4">
              <FiGrid size={24} />
            </div>
            <h3 className="font-display font-semibold text-xl mb-1">Archive is empty</h3>
            <p className="font-body text-sm text-on-surface/50 max-w-sm mb-6">
              {searchQuery ? `No items match "${searchQuery}".` : `No items in ${activeFilter}. Add your first piece to begin.`}
            </p>
            {items.length === 0 && (
              <button 
                onClick={() => setShowModal(true)}
                className="text-sm font-semibold border-b-2 border-primary-container pb-1 text-primary-container"
              >
                Add Your First Item
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {filteredItems.map(item => (
              <div key={item._id} className="group flex flex-col bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm hover:border-outline-variant/60 transition-colors">
                <div className="relative aspect-[4/5] bg-surface-container-low flex items-center justify-center border-b border-outline-variant/10">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                  
                  {/* Subtle actions overlay */}
                  <div className="absolute inset-0 bg-surface/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm flex items-center justify-center gap-3">
                    <button 
                      onClick={() => handleEditItem(item)}
                      className="w-10 h-10 rounded-full bg-surface-container-lowest text-on-surface flex items-center justify-center hover:scale-105 transition-transform shadow-ambient"
                      aria-label="Edit item"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteItem(item._id)}
                      className="w-10 h-10 rounded-full bg-error text-on-error flex items-center justify-center hover:scale-105 transition-transform shadow-ambient"
                      aria-label="Delete item"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1 p-3">
                  <h3 className="font-body font-semibold text-sm line-clamp-1">{item.name}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-label text-[10px] text-on-surface/60 uppercase tracking-widest">{item.category}</span>
                    {item.color && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-outline-variant/50" />
                        <span className="font-label text-[10px] text-on-surface/60 uppercase tracking-widest">{item.color}</span>
                      </>
                    )}
                  </div>
                  {(item.seasons || item.tags) && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.seasons?.slice(0, 2).map((season) => (
                        <span key={season} className="px-2 py-0.5 bg-surface-container-high rounded-full font-label text-[9px] uppercase tracking-wider text-on-surface/70">
                          {season}
                        </span>
                      ))}
                      {item.tags?.slice(0, 1).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-secondary-container/50 rounded-full font-label text-[9px] uppercase tracking-wider text-on-secondary-container">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Floating Action Button (Mobile) */}
      <button 
        onClick={() => setShowModal(true)}
        className="md:hidden fixed bottom-[90px] right-6 w-14 h-14 bg-primary-container text-on-primary rounded-full shadow-ambient flex items-center justify-center z-40 active:scale-95 transition-transform"
        aria-label="Add item"
      >
        <FiPlus size={24} />
      </button>

      {showModal && (
        <AddItemModal 
          onClose={handleCloseModal} 
          onAdd={editingItem ? handleUpdateItem : handleAddItem}
          editItem={editingItem}
        />
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}

export default Wardrobe
