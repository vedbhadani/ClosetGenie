import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiGrid, FiList, FiCompass, FiZap } from 'react-icons/fi';
import { UserButton, useUser } from '@clerk/clerk-react';

function BottomNav() {
  const { user } = useUser();
  
  const navItems = [
    { name: 'Home', path: '/', icon: <FiHome className="w-5 h-5" /> },
    { name: 'Closet', path: '/wardrobe', icon: <FiGrid className="w-5 h-5" /> },
    { name: 'Generate', path: '/outfit-generator', icon: <FiCompass className="w-5 h-5" /> },
    { name: 'History', path: '/outfit-history', icon: <FiList className="w-5 h-5" /> },
    { name: 'AI Suggest', path: '/get-ai', icon: <FiZap className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-40 bg-surface/80 backdrop-blur-2xl border-t border-outline-variant/20 pb-safe">
      <div className="max-w-[800px] mx-auto px-6 py-3 flex justify-between items-center gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                isActive 
                  ? 'text-primary-container font-semibold' 
                  : 'text-on-surface/60 hover:text-on-surface'
              }`
            }
          >
            {item.icon}
            <span className="font-label text-[10px] uppercase tracking-wider">{item.name}</span>
          </NavLink>
        ))}
        
        {/* Profile Item (Clerk UI override) */}
        <div className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-on-surface/60 hover:text-on-surface">
          <UserButton afterSignOutUrl="/" appearance={{
            elements: {
              avatarBox: "w-5 h-5 rounded-full"
            }
          }}/>
          <span className="font-label text-[10px] uppercase tracking-wider">Profile</span>
        </div>
      </div>
    </nav>
  );
}

export default BottomNav;
