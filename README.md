# ClosetGenie 🧞‍♂️

**ClosetGenie** is a state-of-the-art AI-powered wardrobe assistant designed to help you organize your clothing, generate perfectly styled outfits, and plan your looks based on real-time weather and seasonal trends.

---

## 🚀 Key Features

### 👕 Smart Wardrobe Management
- **AI Auto-Tagging**: Powered by **DeepSeek-R1 (Vision)**. Simply upload a photo, and the AI automatically detects the category (Tops, Bottoms, etc.), dominant color, and style tags (casual, formal, etc.).
- **Cloud Storage**: Secure image hosting via **Convex Storage**.

### 🪄 Intelligent Outfit Generator
- **Dual-Model Routing**: 
  - **DeepSeek** handles logic-heavy tasks and structured data.
  - **Qwen-2.5** provides creative, stylish outfit descriptions and fashion advice.
- **Context-Aware**: Generates combinations based on occasion, weather, and your personal "style vibe."

### 📅 Outfit Planner & Calendar
- **Weather Integration**: Syncs with local weather APIs to suggest appropriate attire.
- **Visual Calendar**: Schedule and track your outfits for upcoming events directly on an interactive calendar.

### 🔒 Secure Authentication
- **Clerk Integration**: Enterprise-grade authentication ensures your wardrobe data and personal style preferences remain private and secure.

---

## 🏗️ Architecture

ClosetGenie follows a **Feature-Based Modular Architecture**, ensuring scalability and maintainability.

```text
src/
├── app/          # Root entry, routing, and global providers
├── features/     # Encapsulated domain logic
│   ├── ai/       # AI Service Layer & Model Routing
│   ├── auth/     # Clerk Authentication wrappers
│   ├── home/     # Landing page & overview
│   ├── outfit/   # Generator, History, and Planner logic
│   ├── wardrobe/ # Item management & Vision AI integration
│   └── weather/  # Real-time weather hooks
├── shared/       # Reusable UI components & utilities
└── styles/       # Global CSS & design tokens

convex/           # Cloud functions, Storage logic, and DB Schema
```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS, Bootstrap Icons.
- **Backend/DB**: Convex (Real-time database & Cloud Actions).
- **Auth**: Clerk (Secure User Identity).
- **AI Models**: DeepSeek-R1 (Structured/Vision), Qwen-2.5 (Creative/Conversational) via **OpenRouter**.
- **APIs**: OpenWeatherMap (Location-based forecasting).

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- A Convex account
- A Clerk account
- An OpenRouter API Key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/ClosetGenie.git
   cd ClosetGenie
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   VITE_CONVEX_URL=your_convex_url
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
   VITE_WEATHER_API_KEY=your_weather_key
   ```

4. **Start the Development Server**:
   ```bash
   # Terminal 1: Frontend
   npm run dev

   # Terminal 2: Convex Backend
   npx convex dev
   ```

---

## 🛡️ Model Routing Logic
ClosetGenie utilizes a custom `safeAICall` wrapper in the Convex backend to manage free-tier model constraints effectively:
- **Primary**: Attempts the designated model (DeepSeek/Qwen).
- **Retry**: Automatic single retry on failure.
- **Fallback**: Graceful fallback to `openrouter/free` to ensure a consistent user experience.

---
