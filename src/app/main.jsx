import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';

// Import publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      afterSignOutUrl="/"
      appearance={{
        variables: {
          colorPrimary: '#1B4938',
          colorBackground: '#F8F9F7',
          colorText: '#1A1C1C',
          colorInputBackground: '#FFFFFF',
          colorInputText: '#1A1C1C',
          borderRadius: '0.75rem',
        },
        elements: {
          card: 'shadow-ambient border border-outline-variant/30 bg-surface-container-lowest',
          headerTitle: 'font-display font-bold text-2xl tracking-tight text-on-surface',
          headerSubtitle: 'font-body text-sm text-on-surface/60',
          socialButtonsBlockButton: 'border-outline-variant/50 border shadow-sm',
          formButtonPrimary: 'bg-primary-container text-on-primary hover:opacity-90 shadow-sm border border-primary-container/20 rounded-lg transition-transform hover:-translate-y-0.5',
        }
      }}
    >
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    </ClerkProvider>
  </StrictMode>,
)
