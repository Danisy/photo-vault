import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Lightbox = ({ image, onClose, onNext, onPrev, hasNext, hasPrev }) => {
    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight' && hasNext) onNext();
            if (e.key === 'ArrowLeft' && hasPrev) onPrev();
            if (e.key === 'i') setShowInfo(prev => !prev); // Toggle info with 'i'
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, onNext, onPrev, hasNext, hasPrev]);

    if (!image) return null;

    // Helper to format metadata safely
    const meta = image.metadata || {};
    const hasMetadata = Object.keys(meta).length > 0;

    const formatTime = (timeString) => {
        // Prefer the passed createdTime if available, otherwise check metadata
        const t = image.createdTime || (image.metadata && image.metadata.time);
        if (!t) return 'Unknown Date';
        return new Date(t).toLocaleDateString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const formatShutterSpeed = (exposureTime) => {
        if (!exposureTime) return '';
        if (exposureTime >= 1) return `${exposureTime}s`;
        const denominator = Math.round(1 / exposureTime);
        return `1/${denominator}s`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
            {/* Top Right Controls */}
            <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
                {hasMetadata && (
                    <button
                        onClick={() => setShowInfo(!showInfo)}
                        className={`text-white/70 hover:text-white transition-colors p-2 rounded-full ${showInfo ? 'bg-white/20 text-white' : ''}`}
                        aria-label="View Info"
                    >
                        <Info size={28} />
                    </button>
                )}
                <button
                    onClick={onClose}
                    className="text-white/70 hover:text-white transition-colors p-2"
                    aria-label="Close"
                >
                    <X size={32} />
                </button>
            </div>

            {/* Navigation Buttons */}
            {hasPrev && (
                <button
                    onClick={(e) => { e.stopPropagation(); onPrev(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-4 rounded-full hover:bg-white/10 z-50 hidden sm:block"
                >
                    <ChevronLeft size={48} />
                </button>
            )}
            {hasNext && (
                <button
                    onClick={(e) => { e.stopPropagation(); onNext(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-4 rounded-full hover:bg-white/10 z-50 hidden sm:block"
                >
                    <ChevronRight size={48} />
                </button>
            )}

            {/* Image Container */}
            <div className="relative max-w-full max-h-full flex items-center justify-center w-full h-full" onClick={(e) => { e.stopPropagation(); setShowInfo(false); }}>
                <AnimatePresence mode="wait">
                    <motion.img
                        key={image.src}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        src={image.src}
                        alt={image.alt || 'Full screen photo'}
                        className="max-h-[85vh] max-w-[95vw] object-contain shadow-2xl rounded-sm"
                    />
                </AnimatePresence>

                {/* Info Overlay */}
                <AnimatePresence>
                    {showInfo && hasMetadata && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute bottom-4 left-4 z-50 w-full max-w-sm"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl text-white shadow-2xl">
                                <h3 className="text-xl font-semibold mb-1">{image.alt}</h3>
                                <p className="text-gray-400 text-sm mb-4">{formatTime()}</p>

                                <div className="space-y-3 text-sm">
                                    {/* Camera Model */}
                                    {(meta.cameraMake || meta.cameraModel) && (
                                        <div className="flex justify-between border-b border-white/10 pb-2">
                                            <span className="text-gray-400">Camera</span>
                                            <span className="font-medium">{[meta.cameraMake, meta.cameraModel].filter(Boolean).join(' ')}</span>
                                        </div>
                                    )}

                                    {/* Lens & Settings */}
                                    <div className="flex justify-between border-b border-white/10 pb-2">
                                        <span className="text-gray-400">Settings</span>
                                        <div className="text-right font-medium">
                                            {meta.focalLength && <span>{meta.focalLength}mm </span>}
                                            {meta.aperture && <span>f/{meta.aperture} </span>}
                                            {meta.exposureTime && <span>{formatShutterSpeed(meta.exposureTime)} </span>}
                                            {meta.isoSpeed && <span>ISO{meta.isoSpeed}</span>}
                                        </div>
                                    </div>

                                    {/* Dimensions */}
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Dimensions</span>
                                        <span className="font-medium">{meta.width} x {meta.height} px</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Lightbox;
