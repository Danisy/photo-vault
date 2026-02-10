import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Lightbox = ({ image, onClose, onNext, onPrev, hasNext, hasPrev }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight' && hasNext) onNext();
            if (e.key === 'ArrowLeft' && hasPrev) onPrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, onNext, onPrev, hasNext, hasPrev]);

    if (!image) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2 z-50"
                aria-label="Close"
            >
                <X size={32} />
            </button>

            {/* Navigation Buttons */}
            {hasPrev && (
                <button
                    onClick={(e) => { e.stopPropagation(); onPrev(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-4 rounded-full hover:bg-white/10 z-50"
                >
                    <ChevronLeft size={48} />
                </button>
            )}
            {hasNext && (
                <button
                    onClick={(e) => { e.stopPropagation(); onNext(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-4 rounded-full hover:bg-white/10 z-50"
                >
                    <ChevronRight size={48} />
                </button>
            )}

            <div className="relative max-w-full max-h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <AnimatePresence mode="wait">
                    <motion.img
                        key={image.src}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        src={image.src}
                        alt={image.alt || 'Full screen photo'}
                        className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl rounded-sm"
                    />
                </AnimatePresence>

                <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-white/80 text-sm font-medium bg-black/50 inline-block px-4 py-1 rounded-full backdrop-blur-sm">
                        {image.alt}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Lightbox;
