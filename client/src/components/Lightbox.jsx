import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Lightbox = ({ image, onClose, onNext, onPrev, hasNext, hasPrev, nextSrc, prevSrc }) => {
    const [showInfo, setShowInfo] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null); // Reset
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && hasNext) {
            onNext();
        }
        if (isRightSwipe && hasPrev) {
            onPrev();
        }
    };

    // Prefetch Next/Prev Images
    useEffect(() => {
        if (nextSrc) {
            const img = new Image();
            img.src = nextSrc;
        }
        if (prevSrc) {
            const img = new Image();
            img.src = prevSrc;
        }
    }, [nextSrc, prevSrc]);

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
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-film-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* Top Right Controls */}
            <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
                {hasMetadata && (
                    <button
                        onClick={() => setShowInfo(!showInfo)}
                        className={`text-white/60 hover:text-white transition-colors p-2 rounded-full ${showInfo ? 'bg-white/10 text-white' : ''}`}
                        aria-label="View Info"
                    >
                        <Info size={24} />
                    </button>
                )}
                <button
                    onClick={onClose}
                    className="text-white/60 hover:text-white transition-colors p-2"
                    aria-label="Close"
                >
                    <X size={28} />
                </button>
            </div>

            {/* Navigation Buttons - Visible on Mobile now */}
            {hasPrev && (
                <button
                    onClick={(e) => { e.stopPropagation(); onPrev(); }}
                    className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-2 sm:p-3 rounded-full hover:bg-white/5 z-50"
                >
                    <ChevronLeft size={32} className="sm:w-10 sm:h-10" />
                </button>
            )}
            {hasNext && (
                <button
                    onClick={(e) => { e.stopPropagation(); onNext(); }}
                    className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-2 sm:p-3 rounded-full hover:bg-white/5 z-50"
                >
                    <ChevronRight size={32} className="sm:w-10 sm:h-10" />
                </button>
            )}

            {/* Image Container */}
            <div className="relative max-w-full max-h-full flex items-center justify-center w-full h-full" onClick={(e) => { e.stopPropagation(); setShowInfo(false); }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={image.src}
                        className="relative max-h-[85vh] max-w-[95vw] w-auto h-auto"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                        {/* Placeholder / Low Res (Optional) - layout specific */}

                        <motion.img
                            src={image.src}
                            alt={image.alt || 'Full screen photo'}
                            className="max-h-[85vh] max-w-[95vw] object-contain shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border-[4px] sm:border-[8px] border-white"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={(e, { offset, velocity }) => {
                                const swipe = offset.x;
                                if (swipe < -minSwipeDistance && hasNext) {
                                    onNext();
                                } else if (swipe > minSwipeDistance && hasPrev) {
                                    onPrev();
                                }
                            }}
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Info Overlay */}
                <AnimatePresence>
                    {showInfo && hasMetadata && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-4 left-4 z-50 w-[calc(100%-2rem)] sm:w-full max-w-xs"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-[#1a1a1a] border border-white/10 p-5 rounded-sm text-gray-300 shadow-2xl font-mono text-xs tracking-wide">
                                <h3 className="text-base font-serif italic text-white mb-2 border-b border-white/10 pb-2 truncate">{image.alt}</h3>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">DATE</span>
                                        <span className="text-white">{formatTime()}</span>
                                    </div>

                                    {(meta.cameraMake || meta.cameraModel) && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">CAMERA</span>
                                            <span className="text-white uppercase truncate ml-2">{[meta.cameraMake, meta.cameraModel].filter(Boolean).join(' ')}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between">
                                        <span className="text-gray-500">EXPOSURE</span>
                                        <div className="text-right text-white">
                                            {meta.focalLength && <span>{meta.focalLength}mm </span>}
                                            {meta.aperture && <span>f/{meta.aperture} </span>}
                                            {meta.exposureTime && <span>{formatShutterSpeed(meta.exposureTime)} </span>}
                                            {meta.isoSpeed && <span>ISO{meta.isoSpeed}</span>}
                                        </div>
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
