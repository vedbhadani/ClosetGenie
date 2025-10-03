## ClosetGenie

A lightweight wardrobe manager and AI outfit helper built with React + Vite. Add your clothes, generate outfits, and keep a history of what you’ve tried and loved.

### Features
- Modern UI with a consistent purple theme
- Wardrobe management with images, tags, and seasons
- AI suggestions for outfits (OpenRouter)
- Outfit generator with quick presets and favorites
- Outfit history with details and small, glanceable cards

### Quick start
```bash
npm install
npm run dev
```
App runs at `http://localhost:5173`.

### Pages
- Home: Overview and feature highlights
- Wardrobe: Add and browse items with filters and stats
- Outfit Generator: Combine items into a styled look; save favorites
- Outfit History: View, favorite, and inspect previous outfits
- Get AI Suggestion: Upload an item and get a friendly outfit plan

### AI setup (optional)
The app can call OpenRouter directly from the client. If you prefer this quick setup, add your key in the code where the Authorization header is used. For production, consider using a proxy or serverless function to keep keys private.

### Tech
- React (functional components + hooks)
- React Router
- Vite
- Local Storage for persistence
- Bootstrap icons

### Scripts
- `npm run dev` – start Vite dev server
- `npm run build` – production build
- `npm run preview` – preview the build locally
- `npm run lint` – run ESLint

### Contributing
PRs welcome. Keep the tone friendly, keep UI copy conversational, and prefer small, focused commits.

### License
MIT
