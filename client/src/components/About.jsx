import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Instagram } from 'lucide-react';

// Custom TikTok Icon since Lucide doesn't have it yet
const TikTokIcon = ({ size = 24, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
);

const About = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-film-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="relative w-full max-w-md bg-film-paper p-8 rounded-sm shadow-2xl border border-film-black/10 text-center"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-film-black/50 hover:text-film-black transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="mb-6">
                    <h2 className="text-3xl font-serif font-bold text-film-black mb-1">Danisy Ahnaf</h2>
                    <p className="text-film-gray font-mono text-xs uppercase tracking-widest">Photographer</p>
                </div>

                <div className="space-y-4 mb-8 text-film-black/80 font-serif leading-relaxed">
                    <p>
                        A beginner photographer who enjoys capturing quiet moments, everyday scenes, and emotions that often go unnoticed.
                    </p>
                    <p>
                        This website is a collection of photographs taken with my camera—small pieces of time, light, and feeling, preserved as I see them.
                    </p>
                </div>

                <div className="flex items-center justify-center gap-6 border-t border-film-black/10 pt-6">
                    <a
                        href="https://www.instagram.com/danisyahnaf1/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-film-black/60 hover:text-film-red transition-colors group"
                    >
                        <Instagram size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="font-mono text-xs">Instagram</span>
                    </a>
                    <a
                        href="https://www.tiktok.com/@danisyahnaf1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-film-black/60 hover:text-film-red transition-colors group"
                    >
                        <TikTokIcon size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="font-mono text-xs">TikTok</span>
                    </a>
                </div>
            </motion.div>
        </div>
    );
};

export default About;
