import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Gallery from './components/Gallery';
import Hero from './components/Hero';
import Landing from './components/Landing';

function App() {
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    // Check if we are checking a specific photo (Direct Link)
    const params = new URLSearchParams(window.location.search);
    if (params.get('photo')) {
      setShowLanding(false); // Skip landing if deep linking
    }
  }, []);

  return (
    <div className="min-h-screen bg-film-cream text-film-black font-sans selection:bg-film-red selection:text-white overflow-x-hidden">
      <AnimatePresence mode="wait">
        {showLanding && (
          <Landing key="landing" onEnter={() => setShowLanding(false)} />
        )}
      </AnimatePresence>

      <div className={showLanding ? 'h-screen overflow-hidden' : ''}>
        <Hero />

        <main className="relative">
          <Gallery />
        </main>

        <footer className="py-12 text-center text-gray-500 text-sm border-t border-film-black/5 mt-10">
          <p>&copy; {new Date().getFullYear()} Danisy Ahnaf. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
