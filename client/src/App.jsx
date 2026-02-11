import React from 'react';
import Gallery from './components/Gallery';
import Hero from './components/Hero';

function App() {
  return (
    <div className="min-h-screen bg-film-cream text-film-black font-sans selection:bg-film-red selection:text-white overflow-x-hidden">
      <Hero />

      <main className="relative">
        <Gallery />
      </main>

      <footer className="py-12 text-center text-gray-500 text-sm border-t border-film-black/5 mt-10">
        <p>&copy; {new Date().getFullYear()} Photo Vault. Powered by Google Drive.</p>
      </footer>
    </div>
  );
}

export default App;
