import React, { useState, useEffect } from 'react'
import AddItemModal from '../Components/Clothing/AddItemModal';
import './wardrobe.css';

function Wardrobe() {
  const [activeFilter, setActiveFilter] = useState('All Items');
  const [showModal, setShowModal] = useState(false);
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
    if (activeFilter === 'All Items') return items;
    return items.filter(item => item.category === activeFilter);
  };

  return (
    <div style={{backgroundColor:'#f5f5f5', minHeight: '100vh', padding: '20px 0'}}>
      <div style={{padding:'20px 145.5px',display:'flex',justifyContent:'space-between', alignItems: 'center'}}>
        <div className="wardrobe">
          <p style={{fontSize:'30px',fontWeight:'bold',color:'#0c4a6e',lineHeight:'15px'}}>My Wardrobe</p>
          <p style={{color: "#525252"}}> Manage your clothing items and accessories</p>
        </div>
        <button 
          type="button" 
          onClick={() => setShowModal(true)}
          style={{
            backgroundColor: '#0ea5e9',
            color: 'white',
            borderRadius: '8px',
            padding: '10px 20px',
            border: 'none',
            fontSize: '15px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background-color 0.2s ease-in-out',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0ea5e9'}>
          <span style={{ fontSize: '20px', marginTop: '-2px' }}>+</span>
          Add Item
        </button>
      </div>

      <div style={{
        padding: '0 145.5px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <div style={{
          width: '530px'
        }}>
          <input 
            type="text" 
            placeholder='Search your wardrobe...' 
            style={{
              width: '100%',
              height: '40px',
              borderRadius: '10px',
              border: '1px solid #0ea5e9',
              padding: '0 15px',
              fontSize: '14px',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: 1,
          justifyContent: 'flex-end'
        }}>
          {['All Items', 'Tops', 'Bottoms', 'Footwear', 'Outerwear', 'Accessories'].map((text) => (
            <button
              key={text}
              onClick={() => setActiveFilter(text)}
              style={{
                padding: '8px 10px',
                borderRadius: '20px',
                border: '1px solid #0ea5e9',
                backgroundColor: activeFilter === text ? '#0ea5e9' : 'white',
                color: activeFilter === text ? 'white' : '#333',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                minWidth: 'max-content',
                width: '110px'
              }}
              onMouseOver={(e) => {
                if (activeFilter !== text) {
                  e.currentTarget.style.backgroundColor = '#0ea5e9';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseOut={(e) => {
                if (activeFilter !== text) {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#333';
                }
              }}
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      <div className="items-grid">
        {getFilteredItems().map(item => (
          <div key={item.id} className="item-card">
            <div className="item-image-container">
              <img src={item.imageUrl} alt={item.name} className="item-image" />
              <div className="item-actions">
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteItem(item.id)}
                  aria-label="Delete item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="item-info">
              <h3>{item.name}</h3>
              <div className="item-category">
                <span className={`category-dot ${item.category.toLowerCase()}`}></span>
                {item.category}
              </div>
              <div className="item-seasons">
                {item.seasons.map(season => (
                  <span key={season} className="season-tag">{season}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
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



