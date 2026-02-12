import React from 'react';
import { motion } from 'framer-motion';

const Landing = ({ onEnter }) => {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-film-cream text-film-black p-4"
        >
            <div className="text-center space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif italic tracking-tight mb-2">
                        Danisy Ahnaf
                    </h1>
                    <div className="h-px w-24 bg-film-black/20 mx-auto my-4"></div>
                    <p className="text-sm md:text-base font-mono uppercase tracking-widest text-film-black/60">
                        Photography & Visual Stories
                    </p>
                </motion.div>

                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    onClick={onEnter}
                    className="mt-8 px-8 py-3 border border-film-black/20 hover:border-film-black hover:bg-film-black hover:text-white transition-all duration-300 rounded-sm font-mono text-xs uppercase tracking-widest"
                >
                    Enter Collection
                </motion.button>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.2 }}
                className="absolute bottom-8 text-[10px] font-mono text-film-black/40"
            >
                EST. {new Date().getFullYear()}
            </motion.div>
        </motion.div>
    );
};

export default Landing;
