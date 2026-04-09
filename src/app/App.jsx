import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css'
import Home from '@/features/home/components/Home'
import OutfitGenerator from '@/features/outfit/components/OutfitGenerator';
import Wardrobe from '@/features/wardrobe/components/Wardrobe'
import OutfitHistory from '@/features/outfit/components/OutfitHistory';
import GetAI from '@/features/ai/components/GetAI';
import OutfitPlanner from '@/features/outfit/components/OutfitPlanner';
import RootLayout from '@/shared/components/RootLayout';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        {
          index: true,
          element: <Home />
        },
        {
          path: "outfit-generator",
          element: <ProtectedRoute><OutfitGenerator /></ProtectedRoute>
        },
        {
          path: "wardrobe",
          element: <ProtectedRoute><Wardrobe /></ProtectedRoute>
        },
        {
          path: "outfit-history",
          element: <ProtectedRoute><OutfitHistory /></ProtectedRoute>
        },
        {
          path: "get-ai",
          element: <ProtectedRoute><GetAI /></ProtectedRoute>
        },
        {
          path: "planner",
          element: <ProtectedRoute><OutfitPlanner /></ProtectedRoute>
        }
      ]
    }
  ])

  return (
    <RouterProvider router={router} />
  )
}

export default App
