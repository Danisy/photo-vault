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
                    <div className="h-px w-24 mx-auto my-4" style={{ background: 'linear-gradient(90deg, transparent, #B8956A, transparent)' }}></div>
                    <p className="text-sm md:text-base font-mono uppercase tracking-widest" style={{ color: '#B8956A' }}>
                        Where Art Meets Code
                    </p>
                    <p className="text-xs font-mono text-film-black/40 mt-2 tracking-wide">
                        A curated collection of my digital creations
                    </p>
                </motion.div>

                {/* Featured Project Card */}
                <motion.a
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    href="https://symphonyofsouls.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-10 block w-full max-w-sm mx-auto border border-film-black/15 rounded-sm p-6 hover:border-film-black/40 hover:shadow-lg transition-all duration-500 group cursor-pointer"
                >
                    <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-film-black/40 mb-3">
                        ★ Featured Project
                    </p>
                    <h2 className="text-xl md:text-2xl font-serif italic text-film-black group-hover:text-film-red transition-colors duration-300">
                        Symphony of Souls
                    </h2>
                    <p className="text-xs font-mono text-film-black/50 mt-2 leading-relaxed">
                        A tribute to the world&apos;s greatest composers
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-film-black/40 group-hover:text-film-black transition-colors duration-300">
                        <span>Explore</span>
                        <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </div>
                </motion.a>

                {/* Other Projects */}
                <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 1.1 }}
                        onClick={onEnter}
                        className="min-w-[200px] text-center px-8 py-3 border border-film-black/20 hover:border-film-black hover:bg-film-black hover:text-white transition-all duration-300 rounded-sm font-mono text-xs uppercase tracking-widest"
                    >
                        Photo Collection
                    </motion.button>

                    <motion.a
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 1.3 }}
                        href="https://wsmalaysia.vercel.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-w-[200px] text-center px-8 py-3 border border-film-black/20 hover:border-film-black hover:bg-film-black hover:text-white transition-all duration-300 rounded-sm font-mono text-xs uppercase tracking-widest"
                    >
                        Waktu Solat
                    </motion.a>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.5 }}
                className="absolute bottom-8 flex flex-col items-center gap-3"
            >
                <div className="flex items-center gap-4">
                    <a
                        href="https://www.instagram.com/danisyahnaf/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-film-black/30 hover:text-film-black transition-colors duration-300"
                        aria-label="Instagram"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                    </a>
                    <a
                        href="https://www.tiktok.com/@danisyahnaf1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-film-black/30 hover:text-film-black transition-colors duration-300"
                        aria-label="TikTok"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                    </a>
                </div>
                <span className="text-[10px] font-mono text-film-black/30">
                    © {new Date().getFullYear()} Danisy Ahnaf
                </span>
            </motion.div>
        </motion.div>
    );
};

export default Landing;
