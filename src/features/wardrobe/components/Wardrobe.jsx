import React, { useState } from 'react'
import AddItemModal from '@/features/wardrobe/components/AddItemModal';
import './wardrobe.css';
import { useQuery, useMutation } from "convex/react";
import { api } from '@convex/_generated/api';
import { useUser } from "@clerk/clerk-react";
import { WardrobeSkeleton } from '@/shared/components/PageSkeleton';

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

  if (isLoading) return <WardrobeSkeleton />;

  const generateUploadUrl = useMutation(api.wardrobe.generateUploadUrl);
  const addClothingItem = useMutation(api.wardrobe.addClothingItem);
  const deleteItemMutation = useMutation(api.wardrobe.deleteClothingItem);
  const updateItemMutation = useMutation(api.wardrobe.updateClothingItem);

  const handleAddItem = async (newItem) => {
    try {
      if (!userId) return;
      setIsUploading(true);

      // Step 1: Get short-lived upload URL
      const postUrl = await generateUploadUrl();

      // Step 2: POST the file to the URL
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": newItem.imageFile.type },
        body: newItem.imageFile,
      });
      const { storageId } = await result.json();

      // Step 3: Save to database
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

      // If a new image was uploaded, store it first
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
    
    // Filter by category
    if (activeFilter !== 'All Items') {
      filtered = filtered.filter(item => item.category === activeFilter);
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
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
    <div className="wardrobe-container">
      {/* Header Section */}
      <section className="wardrobe-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="wardrobe-title">My Wardrobe</h1>
            <p className="wardrobe-subtitle">Organize and manage your clothing collection</p>
          </div>
          <button className="add-item-btn" onClick={() => setShowModal(true)}>
            {isUploading ? (
              <>
                <div className="spinner" style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', display: 'inline-block', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                Uploading...
              </>
            ) : (
              <>
                <i className="bi bi-plus-lg"></i>
                Add New Item
              </>
            )}
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon gradient-bg-blue">
              <i className="bi bi-collection"></i>
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total Items</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon gradient-bg-green">
              <i className="bi bi-tags"></i>
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.categories}</span>
              <span className="stat-label">Categories</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon gradient-bg-purple">
              <i className="bi bi-clock-history"></i>
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.recent}</span>
              <span className="stat-label">Added This Week</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon gradient-bg-orange">
              <i className="bi bi-star"></i>
            </div>
            <div className="stat-content">
              <span className="stat-number">{Object.keys(stats.mostUsedCategory).length > 0 ? Math.max(...Object.values(stats.mostUsedCategory)) : 0}</span>
              <span className="stat-label">Most in Category</span>
            </div>
          </div>
        </div>
      </section>

      {/* Controls Section */}
      <section className="controls-section">
        <div className="controls-container">
          <div className="search-controls">
            <div className="search-box">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Search your wardrobe..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="sort-controls">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
                <option value="category">Category</option>
              </select>
            </div>
            <div className="view-controls">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <i className="bi bi-grid-3x3-gap"></i>
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <i className="bi bi-list"></i>
              </button>
            </div>
          </div>
          
          <div className="filter-controls">
            <div className="filter-tabs">
              {['All Items', 'Tops', 'Bottoms', 'Footwear', 'Outerwear', 'Accessories'].map((category) => (
                <button
                  key={category}
                  className={`filter-tab ${activeFilter === category ? 'active' : ''}`}
                  onClick={() => setActiveFilter(category)}
                >
                  <span className="tab-text">{category}</span>
                  <span className="tab-count">
                    {category === 'All Items' 
                      ? items.length 
                      : items.filter(item => item.category === category).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Items Section */}
      <section className="items-section">
        <div className="items-container">
          <div className="items-header">
            <h2 className="items-title">
              {activeFilter === 'All Items' ? 'All Items' : activeFilter}
              <span className="items-count">({filteredItems.length})</span>
            </h2>
          </div>

          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="bi bi-inbox"></i>
              </div>
              <h3>No items found</h3>
              <p>
                {items.length === 0 
                  ? "Start building your digital wardrobe by adding your first clothing item!"
                  : searchQuery 
                    ? `No items match "${searchQuery}". Try a different search term.`
                    : `No items in ${activeFilter}. Try a different category or add some items.`
                }
              </p>
              {items.length === 0 && (
                <button className="empty-cta-btn" onClick={() => setShowModal(true)}>
                  <i className="bi bi-plus-lg"></i>
                  Add Your First Item
                </button>
              )}
            </div>
          ) : (
            <div className={`items-grid ${viewMode}`}>
              {filteredItems.map(item => (
                <div key={item._id} className="item-card">
                  <div className="item-image-container">
                    <img src={item.imageUrl} alt={item.name} className="item-image" />
                    <div className="item-overlay">
                      <div className="item-actions">
                        <button 
                          className="action-btn edit-btn"
                          onClick={() => handleEditItem(item)}
                          aria-label="Edit item"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteItem(item._id)}
                          aria-label="Delete item"

                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="item-content">
                    <h3 className="item-name">{item.name}</h3>
                    <div className="item-meta">
                      <div className="item-category">
                        <span className={`category-dot ${item.category.toLowerCase()}`}></span>
                        <span>{item.category}</span>
                      </div>
                      <div className="item-seasons">
                        {item.color && (
                          <span className="season-tag color-tag" style={{ textTransform: 'capitalize' }}>
                            {item.color}
                          </span>
                        )}
                        {item.seasons.slice(0, 2).map(season => (
                          <span key={season} className="season-tag">{season}</span>
                        ))}
                        {item.seasons.length > 2 && (
                          <span className="season-tag more">+{item.seasons.length - 2}</span>
                        )}
                      </div>
                      {item.tags && item.tags.length > 0 && (
                        <div className="item-seasons" style={{ marginTop: '0.25rem' }}>
                          {item.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="season-tag" style={{ background: 'rgba(139,92,246,0.1)', color: '#7c3aed', border: '1px solid rgba(139,92,246,0.15)' }}>{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions Floating Button */}
      <div className="floating-actions">
        <button className="fab-main" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus"></i>
        </button>
      </div>

      {showModal && (
        <AddItemModal 
          onClose={handleCloseModal} 
          onAdd={editingItem ? handleUpdateItem : handleAddItem}
          editItem={editingItem}
        />
      )}
    </div>
  )
}

export default Wardrobe



