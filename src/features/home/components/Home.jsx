import React from 'react';
import hero from '@/images/hero1.png';
import { Link } from 'react-router-dom';
import { SignInButton, useUser, SignUpButton, UserButton } from '@clerk/clerk-react';
import { FiArrowRight, FiGrid, FiZap, FiCalendar, FiCamera, FiCloud, FiShield } from 'react-icons/fi';
import { HomeSkeleton } from '@/shared/components/PageSkeleton';

function Home() {
  const { user, isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return <HomeSkeleton />;

  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-secondary-container selection:text-on-surface">
      {/* Editorial Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-surface/80 backdrop-blur-2xl border-b border-outline-variant/20">
        <div className="max-w-[1400px] mx-auto px-6 py-5 flex justify-between items-center">
          <div className="font-display font-bold text-xl tracking-tight text-on-surface uppercase">
            Closet Genie
          </div>
          <div className="w-8 h-[2px] bg-primary-container lg:hidden"></div>
          
          <div className="hidden lg:flex items-center gap-8">
            {!isSignedIn ? (
              <>
                <SignInButton mode="modal">
                  <button className="font-body text-sm font-medium hover:opacity-70 transition-opacity">
                    Log In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-primary-container text-on-primary px-5 py-2.5 rounded-md font-body text-sm font-semibold hover:opacity-90 transition shadow-ambient">
                    Join the Atelier
                  </button>
                </SignUpButton>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="font-body text-sm font-medium text-on-surface/80">{user?.fullName || user?.firstName}</span>
                <UserButton afterSignOutUrl="/" appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 rounded-full shadow-sm border border-outline-variant/30",
                    userButtonBox: "pointer-events-auto"
                  }
                }}/>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 lg:pt-48 lg:pb-32 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          <div className="lg:col-span-5 flex flex-col space-y-8 z-10">
            <div className="inline-flex items-center gap-3">
              <span className="w-12 h-[1px] bg-primary-container"></span>
              <span className="font-label text-xs uppercase tracking-widest text-primary-container font-semibold">
                Digital Atelier
              </span>
            </div>
            
            <h1 className="font-display text-5xl lg:text-7xl font-bold leading-[1.1] tracking-[-0.02em]">
              {isSignedIn ? `Welcome,\n${user.firstName || user.fullName}` : "Curate Your Reality"}
            </h1>
            
            <p className="font-body text-lg lg:text-xl text-on-surface/70 leading-relaxed max-w-md">
              A high-end approach to wardrobe management. Transform your closet into an infinitely scrollable archive with AI-powered outfit curation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {isSignedIn ? (
                <Link to="/wardrobe" className="group w-fit flex items-center gap-3 bg-primary-container text-on-primary px-8 py-4 rounded-md font-body font-semibold text-sm hover:bg-primary transition shadow-ambient">
                  Open Wardrobe
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <SignUpButton mode="modal">
                    <button className="group flex items-center justify-center gap-3 bg-primary-container text-on-primary px-8 py-4 rounded-md font-body font-semibold text-sm hover:bg-primary transition shadow-ambient">
                      Get Started
                      <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <button className="flex items-center justify-center gap-3 border border-outline-variant hover:border-primary-container hover:text-primary-container px-8 py-4 rounded-md font-body font-semibold text-sm transition text-on-surface">
                      Log In
                    </button>
                  </SignInButton>
                </>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 lg:col-start-7 relative">
            <div className="absolute inset-0 bg-secondary-container/30 blur-3xl rounded-full transform -translate-x-12 translate-y-12 shrink-0"></div>
            
            <div className="relative aspect-[4/5] lg:aspect-square bg-surface-container-low rounded-lg overflow-hidden shadow-ambient">
              <img 
                src={hero} 
                alt="Editorial view of a styled outfit" 
                className="w-full h-full object-cover mix-blend-multiply"
              />
              
              <div className="absolute bottom-8 left-8 right-8 bg-surface-container-lowest/80 backdrop-blur-xl p-6 rounded-lg border border-outline-variant/30 flex items-center gap-4 shadow-ambient">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  ✨
                </div>
                <div>
                  <p className="font-display font-semibold text-sm tracking-tight">AI Style Match</p>
                  <p className="font-body text-xs text-on-surface/60 mt-1">Found 4 new looks from your archive today.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ─── What is ClosetGenie? ─── */}
      <section className="py-20 lg:py-32 px-6 lg:px-12 bg-surface-container-low/40">
        <div className="max-w-[1400px] mx-auto text-center">
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary-container font-semibold">About the Project</span>
          <h2 className="font-display text-3xl lg:text-5xl font-bold mt-4 tracking-tight">Your AI-Powered Wardrobe Assistant</h2>
          <p className="font-body text-base lg:text-lg text-on-surface/60 max-w-2xl mx-auto mt-6 leading-relaxed">
            ClosetGenie is a smart wardrobe management app that helps you digitize your closet, 
            generate outfit combinations using AI, and plan what to wear — all in one place. 
            No more standing in front of your closet wondering what to wear.
          </p>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-20 lg:py-32 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary-container font-semibold">Simple Steps</span>
            <h2 className="font-display text-3xl lg:text-5xl font-bold mt-4 tracking-tight">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: '01',
                title: 'Upload Your Clothes',
                desc: 'Take a photo or upload images of your clothing items. Our AI automatically detects the category, color, and style tags for each piece.',
              },
              {
                step: '02',
                title: 'Generate Outfits',
                desc: 'Tell us the occasion, weather, and vibe. Our AI engine mixes and matches items from your closet to create the perfect outfit combination.',
              },
              {
                step: '03',
                title: 'Plan & Wear',
                desc: 'Schedule outfits for upcoming days using the built-in planner. Save your favorites and build a personal style history over time.',
              },
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col gap-4 p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 hover:shadow-ambient transition-shadow group">
                <span className="font-display text-5xl font-bold text-primary-container/20 group-hover:text-primary-container/40 transition-colors">{item.step}</span>
                <h3 className="font-display font-bold text-xl">{item.title}</h3>
                <p className="font-body text-sm text-on-surface/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Key Features ─── */}
      <section className="py-20 lg:py-32 px-6 lg:px-12 bg-surface-container-low/40">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary-container font-semibold">Features</span>
            <h2 className="font-display text-3xl lg:text-5xl font-bold mt-4 tracking-tight">Everything You Need</h2>
            <p className="font-body text-base text-on-surface/60 max-w-xl mx-auto mt-4">
              Built for people who care about what they wear but don't want to spend hours deciding.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <FiCamera className="w-6 h-6" />,
                title: 'AI Image Recognition',
                desc: 'Upload a photo and our AI instantly identifies the clothing type, dominant color, and suggests style tags automatically.',
              },
              {
                icon: <FiGrid className="w-6 h-6" />,
                title: 'Digital Closet',
                desc: 'Organize your entire wardrobe digitally. Filter by category, season, or color. Your closet is always with you.',
              },
              {
                icon: <FiZap className="w-6 h-6" />,
                title: 'AI Style Suggestions',
                desc: 'Upload any piece and get complete outfit suggestions tailored to the occasion, weather, and your personal style vibe.',
              },
              {
                icon: <FiCalendar className="w-6 h-6" />,
                title: 'Outfit Planner',
                desc: 'Plan your outfits ahead of time with a built-in calendar. Never repeat the same look two days in a row.',
              },
              {
                icon: <FiCloud className="w-6 h-6" />,
                title: 'Live Weather Integration',
                desc: 'Automatically detects your local weather and factors it into outfit suggestions so you\'re always dressed right.',
              },
              {
                icon: <FiShield className="w-6 h-6" />,
                title: 'Secure & Private',
                desc: 'Your wardrobe data is stored securely with Convex and protected by Clerk authentication. Your style stays yours.',
              },
            ].map((feature) => (
              <div key={feature.title} className="p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/30 hover:shadow-ambient hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-lg bg-secondary-container/50 flex items-center justify-center text-primary-container mb-4 group-hover:bg-primary-container group-hover:text-on-primary transition-colors">
                  {feature.icon}
                </div>
                <h3 className="font-display font-bold text-base mb-2">{feature.title}</h3>
                <p className="font-body text-sm text-on-surface/60 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Who Is It For? ─── */}
      <section className="py-20 lg:py-32 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary-container font-semibold">Who It's For</span>
            <h2 className="font-display text-3xl lg:text-4xl font-bold mt-4 tracking-tight">Built for Everyday Style</h2>
            <p className="font-body text-base text-on-surface/60 mt-6 leading-relaxed">
              Whether you're a fashion enthusiast with a massive wardrobe or someone who just wants to look put-together 
              without the hassle — ClosetGenie adapts to you.
            </p>
            <ul className="mt-8 flex flex-col gap-4">
              {[
                'Professionals who need to look sharp every day',
                'Students managing a small but versatile wardrobe',
                'Fashion lovers who want to track their style evolution',
                'Anyone tired of the "I have nothing to wear" feeling',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full bg-primary-container text-on-primary text-xs font-bold mt-0.5">✓</span>
                  <span className="font-body text-sm text-on-surface/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-surface-container-low rounded-2xl p-8 lg:p-12 border border-outline-variant/30 shadow-ambient">
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-xl">
                <span className="font-display text-3xl font-bold text-primary-container">∞</span>
                <div>
                  <p className="font-body font-semibold text-sm">Unlimited Items</p>
                  <p className="font-label text-xs text-on-surface/50">Add as many clothes as you want</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-xl">
                <span className="font-display text-3xl font-bold text-primary-container">⚡</span>
                <div>
                  <p className="font-body font-semibold text-sm">AI-Powered</p>
                  <p className="font-label text-xs text-on-surface/50">Smart suggestions in seconds</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-xl">
                <span className="font-display text-3xl font-bold text-primary-container">🌤</span>
                <div>
                  <p className="font-body font-semibold text-sm">Weather-Aware</p>
                  <p className="font-label text-xs text-on-surface/50">Outfits matched to real-time conditions</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-xl">
                <span className="font-display text-3xl font-bold text-primary-container">📱</span>
                <div>
                  <p className="font-body font-semibold text-sm">Mobile-First</p>
                  <p className="font-label text-xs text-on-surface/50">Optimized for on-the-go access</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 bg-primary-container/5">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="font-display text-3xl lg:text-5xl font-bold tracking-tight">Ready to Elevate Your Style?</h2>
          <p className="font-body text-base text-on-surface/60 mt-4 max-w-md mx-auto">
            Join ClosetGenie today and transform the way you get dressed every morning.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
            {isSignedIn ? (
              <Link to="/wardrobe" className="group flex items-center justify-center gap-3 bg-primary-container text-on-primary px-10 py-4 rounded-md font-body font-semibold text-sm hover:bg-primary transition shadow-ambient">
                Open Your Closet
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <SignUpButton mode="modal">
                  <button className="group flex items-center justify-center gap-3 bg-primary-container text-on-primary px-10 py-4 rounded-md font-body font-semibold text-sm hover:bg-primary transition shadow-ambient">
                    Create Free Account
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="flex items-center justify-center gap-3 border border-outline-variant hover:border-primary-container px-10 py-4 rounded-md font-body font-semibold text-sm transition">
                    Sign In
                  </button>
                </SignInButton>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-outline-variant/20 w-full">
        <div className="max-w-[1400px] mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-display font-bold text-lg uppercase tracking-tight">Closet Genie</p>
          <div className="flex gap-6 font-label text-xs text-on-surface/60 uppercase tracking-widest">
            <a href="#" className="hover:text-primary-container transition">Privacy</a>
            <a href="#" className="hover:text-primary-container transition">Terms</a>
            <a href="#" className="hover:text-primary-container transition">About</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
