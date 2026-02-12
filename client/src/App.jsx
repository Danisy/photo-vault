import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Home } from 'lucide-react';
import Gallery from './components/Gallery';
import Hero from './components/Hero';
import About from './components/About';
import Landing from './components/Landing';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  useEffect(() => {
    // Check if we are checking a specific photo (Direct Link)
    const params = new URLSearchParams(window.location.search);
    if (params.get('photo')) {
      setShowLanding(false); // Skip landing if deep linking
    }
  }, []);

  return (
    <div className="min-h-screen bg-film-cream text-film-black font-sans selection:bg-film-red selection:text-white">
      <AnimatePresence mode="wait">
        {showLanding && (
          <Landing key="landing" onEnter={() => setShowLanding(false)} />
        )}
      </AnimatePresence>

      <About isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      <AnimatePresence>
        {!showLanding && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: 1, duration: 0.5 }}
            onClick={() => setShowLanding(true)}
            className="fixed top-6 left-6 z-40 p-3 bg-film-cream/80 backdrop-blur-sm border border-film-black/10 rounded-full shadow-sm hover:bg-film-black hover:text-white transition-all duration-300 group"
            title="Return to Cover"
          >
            <Home size={20} className="opacity-60 group-hover:opacity-100" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className={showLanding ? 'h-screen overflow-hidden' : ''}>
        <Hero onOpenAbout={() => setIsAboutOpen(true)} />

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
