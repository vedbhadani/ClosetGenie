import React, { useState, useEffect } from 'react'
import AddItemModal from '../Components/Clothing/AddItemModal';
import './wardrobe.css';

function Wardrobe() {
  const [activeFilter, setActiveFilter] = useState('All Items');
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [items, setItems] = useState(() => {
    try {
      const savedItems = localStorage.getItem('wardrobeItems');
      return savedItems ? JSON.parse(savedItems) : [];
    } catch (error) {
      console.error('Error loading items from localStorage:', error);
      return [];
    }
  });

  const compressImage = (base64String) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64String;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };


  useEffect(() => {
    const saveItems = async () => {
      try {
        const compressedItems = await Promise.all(
          items.map(async (item) => ({
            ...item,
            imageUrl: await compressImage(item.imageUrl)
          }))
        );

        const dataString = JSON.stringify(compressedItems);
        if (dataString.length > 4 * 1024 * 1024) {
          console.warn('Data size exceeds localStorage limit. Some items may not be saved.');
          const reducedItems = compressedItems.slice(-10);
          localStorage.setItem('wardrobeItems', JSON.stringify(reducedItems));
        } else {
          localStorage.setItem('wardrobeItems', dataString);
        }
      } catch (error) {
        console.error('Error saving items to localStorage:', error);
      }
    };

    saveItems();
  }, [items]);

  const handleAddItem = async (newItem) => {
    try {
      const compressedImage = await compressImage(newItem.imageUrl);
      const compressedItem = {
        ...newItem,
        imageUrl: compressedImage
      };
      setItems(prev => [...prev, compressedItem]);
    } catch (error) {
      console.error('Error adding new item:', error);
    }
  };

  const handleDeleteItem = (itemId) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
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
          return b.id - a.id;
        case 'oldest':
          return a.id - b.id;
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
      const itemDate = new Date(item.id);
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
            <i className="bi bi-plus-lg"></i>
            Add New Item
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
                <div key={item.id} className="item-card">
                  <div className="item-image-container">
                    <img src={item.imageUrl} alt={item.name} className="item-image" />
                    <div className="item-overlay">
                      <div className="item-actions">
                        <button 
                          className="action-btn edit-btn"
                          aria-label="Edit item"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteItem(item.id)}
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
                        {item.seasons.slice(0, 2).map(season => (
                          <span key={season} className="season-tag">{season}</span>
                        ))}
                        {item.seasons.length > 2 && (
                          <span className="season-tag more">+{item.seasons.length - 2}</span>
                        )}
                      </div>
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
          onClose={() => setShowModal(false)} 
          onAdd={handleAddItem}
        />
      )}
    </div>
  )
}

export default Wardrobe



