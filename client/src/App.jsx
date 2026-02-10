import React from 'react';
import Gallery from './components/Gallery';
import Hero from './components/Hero';

function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-blue-500/30">

      <Hero />

      <main className="relative z-10 -mt-20">
        <Gallery />
      </main>

      <footer className="py-12 text-center text-gray-500 text-sm border-t border-white/5 mt-10">
        <p>&copy; {new Date().getFullYear()} Photo Vault. Powered by Google Drive.</p>
      </footer>
    </div>
  );
}

export default App;
