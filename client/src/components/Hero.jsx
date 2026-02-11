import React, { useState } from 'react';
import { motion } from 'framer-motion';
import About from './About';

const Hero = () => {
    const [isAboutOpen, setIsAboutOpen] = useState(false);

    return (
        <section className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20 border-b border-film-black/10 bg-film-cream z-20">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-4xl mx-auto"
            >
                <h1 className="text-6xl md:text-8xl font-serif font-black tracking-tight text-film-black mb-6 selection:bg-film-red selection:text-white">
                    zygrace <span className="italic block md:inline font-light">Collection</span>
                </h1>

                <p className="text-lg md:text-xl font-mono text-film-gray max-w-2xl mx-auto leading-relaxed mb-8">
                    A curated archive of visual memories.
                    <br />
                    <span className="text-sm opacity-60">EST. 2026 • DIGITAL ARCHIVE</span>
                </p>

                <button
                    onClick={() => setIsAboutOpen(true)}
                    className="inline-block border border-film-black/20 px-6 py-2 rounded-full text-film-black/60 hover:text-film-black hover:border-film-black hover:bg-white/50 transition-all font-mono text-sm uppercase tracking-widest"
                >
                    About The Photographer
                </button>
            </motion.div>

            <About isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
        </section>
    );
};

export default Hero;
