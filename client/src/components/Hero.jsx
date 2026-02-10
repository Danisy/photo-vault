import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <div className="relative h-[60vh] w-full flex items-center justify-center overflow-hidden">
            {/* Background with animated gradient mesh */}
            <div className="absolute inset-0 bg-[#0a0a0a]">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/30 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/30 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 text-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                        zygrace <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Collection</span>
                    </h1>
                    <p className="text-2xl text-gray-400 max-w-2xl mx-auto mb-8 font-serif italic tracking-wide">
                        A curated collection of memories and visual stories, stored securely in the cloud.
                    </p>
                </motion.div>
            </div>

            {/* Fade to content */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#121212] to-transparent pointer-events-none" />
        </div>
    );
};

export default Hero;
