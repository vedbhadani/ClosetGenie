import React from 'react'
import './Navbar.css'
import { NavLink, useNavigate } from 'react-router-dom';
import Logo from '@/images/logo.png';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

function Navbar() {
  const navigate = useNavigate();
  return (
    <header className="cg-nav">
      <div className="cg-nav-inner">
        <div className="cg-brand">
          <img src={Logo} alt="ClosetGenie" />
          <span>ClosetGenie</span>
        </div>
        <nav className="cg-links">
          <NavLink className={(e)=> e.isActive?"active": ""} to="/">Home</NavLink>
          <NavLink className={(e)=> e.isActive?"active": ""} to='/wardrobe'>Wardrobe</NavLink>
          <NavLink className={(e)=> e.isActive?"active": ""} to='/outfit-generator'>Outfit Generator</NavLink>
          <NavLink className={(e)=> e.isActive?"active": ""} to='/outfit-history'>Outfit History</NavLink>
          <NavLink className={(e)=> e.isActive?"active": ""} to='/planner'>Planner</NavLink>
        </nav>
        <div className="cg-cta" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <SignedIn>
            <button type="button" onClick={() => navigate('/get-ai')}>
              <i className="bi bi-stars"></i>
              Get AI Suggestion
            </button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button type="button" className="btn-primary" style={{ padding: '0.6rem 1rem' }}>
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  )
}

export default Navbar
