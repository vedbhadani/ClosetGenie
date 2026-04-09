# ClosetGenie 🧞‍♂️

**ClosetGenie** is a state-of-the-art AI-powered wardrobe assistant designed to help you organize your clothing, generate perfectly styled outfits, and plan your looks based on real-time weather and seasonal trends.

---

## 🚀 Key Features

### 👕 Smart Wardrobe Management
- **AI Auto-Tagging**: Powered by **DeepSeek-R1 (Vision)**. Simply upload a photo, and the AI automatically detects the category (Tops, Bottoms, etc.), dominant color, and style tags (casual, formal, etc.).
- **Responsive Grid**: A dynamic, fluid wardrobe interface that seamlessly scales from mobile cards to high-density desktop grids.
- **Cloud Storage**: Secure image hosting via **Convex Storage**.

### 🪄 Intelligent AI Stylist
- **Dual-Model Routing**: 
  - **DeepSeek** handles logic-heavy tasks, image vision, and structured data extracting.
  - **Qwen-2.5** provides creative, editorial-style outfit descriptions and fashion advice.
- **Context-Aware Engine**: Generates combinations based on occasion, weather, and your personal "style vibe."
- **Verdict Persistence**: A proprietary `---GENIE---` separator ensures the AI's final "Genie Verdict" is correctly parsed and persisted into your personal outfit history.

### 📅 Outfit Planner & Calendar
- **Weather Integration**: Syncs with local weather APIs to suggest appropriate attire.
- **Visual Calendar**: Schedule and track your outfits for upcoming events directly on an interactive calendar.

### 🔒 Secure Authentication
- **Clerk Integration**: Enterprise-grade authentication ensures your wardrobe data and personal style preferences remain private and secure.

---

## 🎨 UI & UX Design

ClosetGenie features a **premium, editorial aesthetic** built with modern web design best practices:
- **Mobile-First Navigation**: Utilizes a frosted, sticky `BottomNav` on mobile interfaces, keeping core actions at the user's fingertips.
- **Tailwind Global Styling**: A utility-first CSS approach powered by a centralized Tailwind configuration, ensuring high performance and visual consistency without legacy CSS files.
- **Micro-interactions**: Incorporates smooth layout transitions, GPU-accelerated backdrop blurs (`will-change: transform`), and strict scroll-locking for modals.

---

## 🏗️ Architecture

ClosetGenie follows a **Feature-Based Modular Architecture**, ensuring scalability and maintainability.

```text
src/
├── app/          # Root entry, routing, and global providers
├── features/     # Encapsulated domain logic
│   ├── ai/       # AI Service Layer & Prompt Generation
│   ├── auth/     # Clerk Authentication wrappers & Landing UI
│   ├── home/     # Landing page & overview components
│   ├── outfit/   # Generator, History, and Planner logic
│   ├── wardrobe/ # Item management & Vision AI modals
│   └── weather/  # Real-time weather hooks
├── shared/       # Reusable UI components (Buttons, Navbars)
└── styles/       # Global Tailwind entries & CSS variables

convex/           # Cloud functions, Storage logic, and DB Schema
```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, React Router, React Icons.
- **Backend/DB**: Convex (Real-time database & Serverless standard functions).
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
   ```

4. **Start the Development Server**:
   ```bash
   # Terminal 1: Frontend
   npm run dev

   # Terminal 2: Convex Backend
   npx convex dev
   ```

---

## 🛡️ Backend Data Flow
ClosetGenie utilizes custom logic within Convex to manage third-party APIs and large data operations:
- **`safeAICall`**: A robust wrapper for OpenRouter inference that manages free-tier rate limits, automatic retries, and graceful fallbacks.
- **Cache Bypassing**: Client-side controls to force fresh generations if AI output quality drops.
- **Transactional Consistency**: AI outfit suggestions and the individual wardrobe items they reference are strictly tied to the Clerk generic Object ID.

---
