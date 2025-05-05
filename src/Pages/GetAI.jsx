import React, { useState } from 'react'
import ImageUploader from '../Components/Utils/ImageUploader'
import { useNavigate } from 'react-router-dom';
import ColorThief from 'colorthief';
import './GetAI.css';

const GetAI = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [clothingType, setClothingType] = useState("");
  const [occasion, setOccasion] = useState("Casual");
  const [vibe, setVibe] = useState("Chill");
  const [weather, setWeather] = useState("Sunny");
  const [season, setSeason] = useState("Summer");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [dominantColor, setDominantColor] = useState("");

  const getColorName = (rgbString) => {
    const rgb = rgbString.match(/\d+/g).map(Number);
    const [r, g, b] = rgb;

    const colors = {
      'black': [0, 0, 0],
      'white': [255, 255, 255],
      'red': [255, 0, 0],
      'green': [0, 255, 0],
      'blue': [0, 0, 255],
      'yellow': [255, 255, 0],
      'purple': [128, 0, 128],
      'pink': [255, 192, 203],
      'orange': [255, 165, 0],
      'brown': [165, 42, 42],
      'gray': [128, 128, 128],
      'navy': [0, 0, 128],
      'maroon': [128, 0, 0],
      'teal': [0, 128, 128],
      'olive': [128, 128, 0],
      'dark blue': [0, 0, 139],
      'dark gray': [64, 64, 64],
      'light gray': [211, 211, 211],
      'beige': [245, 245, 220],
      'cream': [255, 253, 208],
      'burgundy': [128, 0, 32],
      'mustard': [255, 219, 88],
      'mint': [152, 255, 152],
      'lavender': [230, 230, 250],
      'coral': [255, 127, 80],
      'turquoise': [64, 224, 208],
      'gold': [255, 215, 0],
      'silver': [192, 192, 192],
      'charcoal': [54, 69, 79],
      'ivory': [255, 255, 240],
      'khaki': [240, 230, 140],
      'indigo': [75, 0, 130],
      'magenta': [255, 0, 255],
      'cyan': [0, 255, 255],
      'lime': [0, 255, 0],
      'violet': [238, 130, 238],
      'wine': [114, 47, 55],
      'peach': [255, 218, 185],
      'tan': [210, 180, 140],
      'sage': [188, 184, 138],
      'mauve': [224, 176, 255],
      'crimson': [220, 20, 60],
      'emerald': [80, 200, 120],
      'ruby': [224, 17, 95],
      'sapphire': [15, 82, 186],
      'amber': [255, 191, 0],
      'aqua': [0, 255, 255],
      'azure': [0, 127, 255],
      'bisque': [255, 228, 196],
      'chocolate': [210, 105, 30],
      'cobalt': [0, 71, 171],
      'copper': [184, 115, 51],
      'denim': [21, 96, 189],
      'fuchsia': [255, 0, 255],
      'honey': [255, 191, 0],
      'jade': [0, 168, 107],
      'jet': [52, 52, 52],
      'lemon': [255, 247, 0],
      'lilac': [200, 162, 200],
      'mahogany': [192, 64, 0],
      'moss': [138, 154, 91],
      'ochre': [204, 119, 34],
      'plum': [142, 69, 133],
      'rust': [183, 65, 14],
      'scarlet': [255, 36, 0],
      'sepia': [112, 66, 20],
      'slate': [112, 128, 144],
      'taupe': [72, 60, 50],
      'umber': [99, 81, 71],
      'vermillion': [227, 66, 52],
      'viridian': [64, 130, 109],
      'wheat': [245, 222, 179],
      'zinc': [132, 132, 130]
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

  const isButtonDisabled = !file || !clothingType.trim() || isLoading;

  const extractColor = (imageSrc) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const colorThief = new ColorThief()
      const color = colorThief.getColor(img)
      const rgbColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      setDominantColor(rgbColor);
    }
    img.src = imageSrc
  }

  const handleImageUpload = (imageData) => {
    setFile(imageData);
    extractColor(imageData);
  };

  const saveToHistory = () => {
    const outfitHistory = JSON.parse(localStorage.getItem('outfitHistory') || '[]');
    const suggestionPoints = suggestion
      .split(/\d+\./)
      .filter(point => point.trim())
      .map(point => point.trim());

    const newOutfit = {
      id: Date.now(),
      date: new Date().toISOString(),
      baseItem: {
        type: clothingType,
        color: dominantColor,
        colorName: getColorName(dominantColor)
      },
      preferences: {
        occasion,
        vibe,
        weather,
        season
      },
      suggestion: suggestionPoints
    };
    
    outfitHistory.push(newOutfit);
    localStorage.setItem('outfitHistory', JSON.stringify(outfitHistory));
    navigate('/outfit-history');
  };

  const getOutfitSuggestion = async () => {
    setIsLoading(true);
    const colorName = getColorName(dominantColor);
    const prompt = `Suggest a complete outfit to pair with a ${colorName} ${clothingType} for a ${occasion} occasion. The overall vibe should be ${vibe}, suitable for ${weather} weather during the ${season} season. Recommend matching clothing items, including tops, bottoms, shoes, and accessories that complement the main piece. and give the sugessiont in points`;

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "anthropic/claude-3-haiku",
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await response.json();
      setSuggestion(data.choices?.[0]?.message?.content || "No suggestion received.");
    } catch (error) {
      console.error("Error:", error);
      setSuggestion("Failed to get suggestion. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="get-ai-container">
      <div className="get-ai-header">
        <h1>Get AI Outfit Suggestions</h1>
        <p>Upload a clothing item and let our AI create the perfect outfit for you</p>
      </div>

      <div className="get-ai-content">
        <div className="upload-section">
          <div className="upload-box">
            <ImageUploader onImageUpload={handleImageUpload} />
            {file && dominantColor && (
              <div className="color-preview">
                <div className="color-circle" style={{ backgroundColor: dominantColor }}></div>
                <span>{clothingType ? `${clothingType}: ${getColorName(dominantColor)}` : `Detected color: ${getColorName(dominantColor)}`}</span>
              </div>
            )}
          </div>
        </div>

        <div className="preferences-section">
          <div className="preferences-grid">
            <div className="preference-group">
              <label>Clothing Type</label>
              <input
                type="text"
                value={clothingType}
                onChange={(e) => setClothingType(e.target.value)}
                placeholder="e.g., T-shirt, Jeans, Dress"
                className="preference-input"
              />
            </div>

            <div className="preference-group">
              <label>Occasion</label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="preference-select"
              >
                <option value="Casual">Casual</option>
                <option value="Formal">Formal</option>
                <option value="Business">Business</option>
                <option value="Party">Party</option>
                <option value="Date">Date</option>
                <option value="Sport">Sport</option>
              </select>
            </div>

            <div className="preference-group">
              <label>Vibe</label>
              <select
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                className="preference-select"
              >
                <option value="Chill">Chill</option>
                <option value="Elegant">Elegant</option>
                <option value="Trendy">Trendy</option>
                <option value="Classic">Classic</option>
                <option value="Bold">Bold</option>
                <option value="Minimalist">Minimalist</option>
              </select>
            </div>

            <div className="preference-group">
              <label>Weather</label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                className="preference-select"
              >
                <option value="Sunny">Sunny</option>
                <option value="Rainy">Rainy</option>
                <option value="Cloudy">Cloudy</option>
                <option value="Snowy">Snowy</option>
                <option value="Windy">Windy</option>
              </select>
            </div>

            <div className="preference-group">
              <label>Season</label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="preference-select"
              >
                <option value="Summer">Summer</option>
                <option value="Winter">Winter</option>
                <option value="Spring">Spring</option>
                <option value="Fall">Fall</option>
              </select>
            </div>
          </div>

          <button
            className={`get-suggestion-btn ${isButtonDisabled ? 'disabled' : ''}`}
            onClick={getOutfitSuggestion}
            disabled={isButtonDisabled}
          >
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>Getting Suggestions...</span>
              </div>
            ) : (
              'Get Outfit Suggestions'
            )}
          </button>
        </div>
      </div>

      {suggestion && (
        <div className="suggestion-section">
          <div className="suggestion-card">
            <h2>Your Personalized Outfit Suggestion</h2>
            <div className="suggestion-content">
              {suggestion.split(/\d+\./).filter(point => point.trim()).map((point, index) => (
                <div key={index} className="suggestion-point">
                  <span className="point-number">{index + 1}</span>
                  <p>{point.trim()}</p>
                </div>
              ))}
            </div>
            <button className="save-btn" onClick={saveToHistory}>
              Save to History
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetAI;
