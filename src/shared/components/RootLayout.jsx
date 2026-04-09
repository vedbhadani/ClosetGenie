import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';

const RootLayout = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="bg-surface min-h-screen text-on-surface pb-[80px]">
      <main className="w-full">
        <Outlet />
      </main>
      
      {/* Show Bottom Nav only on internal app pages */}
      {!isLandingPage && <BottomNav />}
    </div>
  );
};

export default RootLayout;
