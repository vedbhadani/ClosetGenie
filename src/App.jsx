import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css'
import Footer from './Components/Layout/Footer'
import Navbar from './Components/Layout/Navbar'
import Home from './Pages/Home'
import OutfitGenerator from './Pages/OutfitGenerator';
import Wardrobe from './Pages/Wardrobe'
import OutfitHistory from './Pages/OutfitHistory';
import GetAI from './Pages/GetAI';

function App() {
  const router = createBrowserRouter([
    {
      path:"/",
      element:<><Navbar/><Home/></>
    },
    {
      path:"/outfit-generator",
      element:<><Navbar/><OutfitGenerator/></>
    },
    {
      path:"/wardrobe",
      element:<><Navbar/><Wardrobe/></>
    },
    {
      path:"/outfit-history",
      element:<><Navbar/><OutfitHistory/></>
    },
    {
      path:"/get-ai",
      element:<><Navbar/><GetAI/></>
    }
    
  ])


  return (
    <>
    <RouterProvider router={router}/>
    <Footer/>
    </>
  )
}

export default App
