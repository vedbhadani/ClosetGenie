import React from 'react'
import hero from '@/images/hero1.png';
import { Link } from 'react-router-dom';
import '@/app/App.css';
import './Home.css';
import { useUser } from '@clerk/clerk-react';

function Home() {
  const { user, isSignedIn } = useUser();
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span>✨ AI-Powered Fashion Assistant</span>
            </div>
            <h1 className="hero-title">
              {isSignedIn ? `Welcome, ${user.firstName || user.fullName}` : "Your Smart Wardrobe &"}<br />
              <span className="gradient-text">Outfit Planner</span>
            </h1>
            <p className="hero-description">
              Transform your closet into a digital wardrobe. Get personalized, AI-powered outfit recommendations that match your style, occasion, and weather.
            </p>
            <div className="hero-buttons">
              <Link to="/wardrobe" className="btn-primary">
                Get Started
                <i className="bi bi-arrow-right"></i>
              </Link>
              <a href="#how-it-works" className="btn-secondary">
                <i className="bi bi-play-circle"></i>
                See How It Works
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Happy Users</span>
              </div>
              <div className="stat">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Outfits Created</span>
              </div>
              <div className="stat">
                <span className="stat-number">4.9★</span>
                <span className="stat-label">User Rating</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-container">
              <img src={hero} alt="ClosetGenie Hero" className="hero-image" />
              <div className="floating-card card-1">
                <i className="bi bi-palette"></i>
                <span>Color Analysis</span>
              </div>
              <div className="floating-card card-2">
                <i className="bi bi-cloud-sun"></i>
                <span>Weather Smart</span>
              </div>
              <div className="floating-card card-3">
                <i className="bi bi-stars"></i>
                <span>AI Recommendations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-header">
          <h2 className="section-title">Why Choose ClosetGenie?</h2>
          <p className="section-subtitle">
            Discover the powerful features that make outfit planning effortless and fun
          </p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon gradient-bg-blue">
              <i className="bi bi-robot"></i>
            </div>
            <h3>AI-Powered Styling</h3>
            <p>Our advanced AI analyzes your wardrobe, style preferences, and current trends to suggest perfect outfit combinations.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon gradient-bg-green">
              <i className="bi bi-cloud-drizzle"></i>
            </div>
            <h3>Weather Integration</h3>
            <p>Get outfit suggestions that match the weather forecast, ensuring you're always dressed appropriately.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon gradient-bg-purple">
              <i className="bi bi-palette"></i>
            </div>
            <h3>Color Coordination</h3>
            <p>Automatic color analysis helps you discover new combinations and ensures your outfits are perfectly coordinated.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon gradient-bg-orange">
              <i className="bi bi-calendar-event"></i>
            </div>
            <h3>Occasion-Based</h3>
            <p>Whether it's work, casual, or special events, get tailored suggestions for every occasion in your life.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon gradient-bg-pink">
              <i className="bi bi-camera"></i>
            </div>
            <h3>Easy Upload</h3>
            <p>Simply snap photos of your clothes. Our AI automatically categorizes and tags everything for easy organization.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon gradient-bg-teal">
              <i className="bi bi-graph-up"></i>
            </div>
            <h3>Style Analytics</h3>
            <p>Track your style evolution, discover patterns, and get insights into your fashion preferences over time.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-header">
          <h2 className="section-title">How ClosetGenie Works</h2>
          <p className="section-subtitle">
            Get personalized outfit recommendations in three simple steps
          </p>
        </div>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <div className="step-icon icon-blue">
                <i className="bi bi-camera-fill"></i>
              </div>
              <h3>Upload Your Wardrobe</h3>
              <p>Take photos of your clothing items. Our AI automatically detects colors, patterns, and categorizes everything for you.</p>
            </div>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <div className="step-icon icon-green">
                <i className="bi bi-sliders"></i>
              </div>
              <h3>Set Your Preferences</h3>
              <p>Tell us about the occasion, weather, your mood, and style preferences. The more we know, the better we can help.</p>
            </div>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <div className="step-icon icon-orange">
                <i className="bi bi-magic"></i>
              </div>
              <h3>Get Perfect Outfits</h3>
              <p>Receive personalized outfit combinations that match your style, occasion, and weather conditions perfectly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2 className="section-title">What Our Users Say</h2>
          <p className="section-subtitle">
            Join thousands of satisfied users who've transformed their style
          </p>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-rating">
              <i className="bi bi-star-fill"></i>
              <i className="bi bi-star-fill"></i>
              <i className="bi bi-star-fill"></i>
              <i className="bi bi-star-fill"></i>
              <i className="bi bi-star-fill"></i>
            </div>
            <p>"ClosetGenie has completely changed how I approach getting dressed. I save so much time and always look put-together!"</p>
            <div className="testimonial-author">
              <div className="author-avatar">S</div>
              <div>
                <span className="author-name">Sarah Johnson</span>
                <span className="author-title">Marketing Manager</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-rating">
              <i className="bi bi-star-fill"></i>
              <i className="bi bi-star-fill"></i>
              <i className="bi bi-star-fill"></i>
              <i className="bi bi-star-fill"></i>
              <i className="bi bi-star-fill"></i>
            </div>
            <p>"The AI recommendations are spot-on! I've discovered so many new combinations from clothes I already owned."</p>
            <div className="testimonial-author">
              <div className="author-avatar">M</div>
              <div>
                <span className="author-name">Mike Chen</span>
                <span className="author-title">Software Engineer</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-rating">
              <i className="bi bi-star-fill"></i>
              <i className="bi bi-star-fill"></i>
              <i className="bi bi-star-fill"></i>
              <i className="bi bi-star-fill"></i>
              <i className="bi bi-star-fill"></i>
            </div>
            <p>"Perfect for busy professionals! Weather-based suggestions mean I'm never caught off guard by the weather."</p>
            <div className="testimonial-author">
              <div className="author-avatar">E</div>
              <div>
                <span className="author-name">Emily Rodriguez</span>
                <span className="author-title">Business Consultant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Transform Your Style?</h2>
          <p className="cta-description">
            Join thousands of users who've revolutionized their wardrobe with AI-powered styling. Start your fashion journey today!
          </p>
          <div className="cta-buttons">
            <Link to="/wardrobe" className="btn-primary large">
              Add items to your wardrobe
              <i className="bi bi-arrow-right"></i>
            </Link>
            <Link to="/get-ai" className="btn-outline">
              Try AI styling now
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home;
