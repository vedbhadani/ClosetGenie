import React from 'react'
import hero from "../images/hero1.png";
import { Link } from 'react-router-dom';
import '../App.css';
import './home.css';

function Home() {
  return (
    <div>
      <div className="home-body">
        <div className="home-head">
          <p className="main-heading">Your Smart Wardrobe &<br /> Outfit Planner</p>
          <p className="sub-heading">Digitally organize your closet. Get AI-powered outfit ideas. Dress with confidence every day.</p>
          <div className="buttons">
            <Link to="/wardrobe" className="link-no-style">
              <button className="get-started-btn">Get Started</button>
            </Link>
          </div>
        </div>
        <div className="hero-box">
          <img src={hero} alt="ClosetGenie Hero" className="hero-image" />
        </div>
      </div>

      <div className="instruction-section">
        <p className="instruction-title">How ClosetGenie Works</p>
        <p className="instruction-subtitle">Organize your wardrobe and get personalized outfit recommendations in just a few steps.</p>

        <div className="instruction-cards">
          <div className="card">
            <div className="card-icon icon-blue">
              <i className="bi bi-image icon-color-blue"></i>
            </div>
            <p className="card-title">Upload Your Wardrobe</p>
            <p className="card-text">Add your clothing items with simple photos. We'll automatically detect colors and let you tag each piece.</p>
          </div>

          <div className="card">
            <div className="card-icon icon-green">
              <i className="bi bi-clipboard icon-color-green"></i>
            </div>
            <p className="card-title">Choose Your Occasion</p>
            <p className="card-text">Tell us where you're going and what vibe you're going for. Consider the season and weather too.</p>
          </div>

          <div className="card">
            <div className="card-icon icon-orange">
              <i className="bi bi-lightning-charge icon-color-orange"></i>
            </div>
            <p className="card-title">Get Outfit Suggestions</p>
            <p className="card-text">Our AI will generate personalized outfit combinations from your wardrobe that match your preferences.</p>
          </div>
        </div>
      </div>

      <div className="start-section">
        <p className="start-heading">Ready to Upgrade Your Style with AI?</p>
        <p className="start-subheading">Let ClosetGenie reimagine and help you discover outfit combinations that match your<br/> vibe, the weather, and your occasion </p>
        <Link to="/get-ai" className="link-no-style">
          <button className="start-btn">Try It!!</button>
        </Link>
      </div>
    </div>
  )
}

export default Home;
