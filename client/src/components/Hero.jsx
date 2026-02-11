import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <section className="relative h-[60vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden border-b border-film-black/10">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-4xl mx-auto z-10"
            >
                <h1 className="text-6xl md:text-8xl font-serif font-black tracking-tight text-film-black mb-6 selection:bg-film-red selection:text-white">
                    zygrace <span className="italic block md:inline font-light">Collection</span>
                </h1>

                <p className="text-lg md:text-xl font-mono text-film-gray max-w-2xl mx-auto leading-relaxed">
                    A curated archive of visual memories.
                    <br />
                    <span className="text-sm opacity-60">EST. 2026 • DIGITAL ARCHIVE</span>
                </p>
            </motion.div>
        </section>
    );
};

export default Hero;
