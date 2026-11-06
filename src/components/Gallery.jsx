"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchPhotos, getImageUrl } from '../services/api';
import Lightbox from './Lightbox';
import { Loader2, Image as ImageIcon, ArrowUpDown, GripHorizontal, LayoutGrid, Grid3x3, Pin } from 'lucide-react';
import { motion } from 'framer-motion';

const PINNED_NAME_PATTERN = /^_PIN_\s*/i;

const isPinnedPhoto = (photo) => PINNED_NAME_PATTERN.test(photo.name || '');

const getDisplayName = (photo) => (photo.name || '').replace(PINNED_NAME_PATTERN, '');

const getPhotoDate = (photo) => {
    try {
        // Try to get EXIF date first (format often: "YYYY:MM:DD HH:MM:SS")
        if (photo.imageMediaMetadata?.time) {
            // Convert colon separated date to standard format for parsing
            // "2023:01:01 12:00:00" -> "2023/01/01 12:00:00"
            const exifDate = photo.imageMediaMetadata.time.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1/$2/$3');
            const parsed = new Date(exifDate);
            if (!isNaN(parsed.getTime())) return parsed;
        }
        // Fallback to createdTime (ISO string)
        const created = new Date(photo.createdTime);
        return isNaN(created.getTime()) ? new Date() : created;
    } catch (e) {
        console.warn('Error parsing date for photo:', photo.id, e);
        return new Date();
    }
};

const LazyImage = ({ src, alt, width, height, className, style, onClick }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className={`relative overflow-hidden bg-film-paper ${className}`} style={style} onClick={onClick}>
            {/* Small placeholder or just background color is handled by parent/bg-film-paper */}
            <Image
                src={src}
                alt={alt}
                width={width || 1200}
                height={height || 800}
                onLoad={() => setIsLoaded(true)}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                className={`w-full h-auto object-cover transition-all duration-700 ease-in-out ${isLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xl scale-105'
                    }`}
            />
        </div>
    );
};

const Gallery = () => {
    const [photos, setPhotos] = useState([]);
    const [availableFolders, setAvailableFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [currentFolderId, setCurrentFolderId] = useState('');
    const [currentFolderName, setCurrentFolderName] = useState('Canon 60D');
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = Newest first, 'asc' = Oldest first
    const [gridDensity, setGridDensity] = useState('medium'); // 'low', 'medium', 'high'
    const [columnCount, setColumnCount] = useState(4);

    // Responsive column count calculation
    useEffect(() => {
        const updateColumns = () => {
            const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
            if (gridDensity === 'low') {
                setColumnCount(width >= 640 ? 2 : 1);
            } else if (gridDensity === 'high') {
                if (width >= 1280) setColumnCount(6);
                else if (width >= 1024) setColumnCount(5);
                else if (width >= 768) setColumnCount(4);
                else setColumnCount(3);
            } else {
                // medium
                if (width >= 1024) setColumnCount(4);
                else if (width >= 768) setColumnCount(3);
                else setColumnCount(2);
            }
        };

        updateColumns();
        window.addEventListener('resize', updateColumns);
        return () => window.removeEventListener('resize', updateColumns);
    }, [gridDensity]);

    useEffect(() => {
        const loadPhotos = async () => {
            setLoading(true);
            try {
                const data = await fetchPhotos(currentFolderId);
                setPhotos(data);

                // If we are at root, store the folders so pills stay available across all sections
                if (!currentFolderId) {
                    const rootFolders = data.filter(item => item.mimeType === 'application/vnd.google-apps.folder');
                    setAvailableFolders(rootFolders);
                }

                setError(null);
            } catch (err) {
                setError('Failed to load content. Please check your connection.');
            } finally {
                setLoading(false);
            }
        };
        loadPhotos();
    }, [currentFolderId]);

    const [deepLinkChecked, setDeepLinkChecked] = useState(false);

    // Handle URL Deep Linking
    useEffect(() => {
        if (photos.length > 0) {
            const params = new URLSearchParams(window.location.search);
            const photoId = params.get('photo');

            if (photoId && !selectedPhoto) {
                const photo = photos.find(p => p.id === photoId);

                if (photo) {
                    const imageUrl = getImageUrl(photo.id);
                    setSelectedPhoto({
                        src: photo.thumbnailLink ? photo.thumbnailLink.replace(/=s\d+$/, '=s3000') : imageUrl,
                        alt: getDisplayName(photo),
                        metadata: photo.imageMediaMetadata,
                        createdTime: photo.createdTime,
                        date: getPhotoDate(photo),
                        id: photo.id // Ensure ID is passed
                    });
                }
            }
            setDeepLinkChecked(true); // Mark check as done
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [photos]);

    // Update URL when selectedPhoto changes
    useEffect(() => {
        if (!deepLinkChecked) return; // Only update URL after initial deep link check

        const url = new URL(window.location);
        if (selectedPhoto?.id) {
            url.searchParams.set('photo', selectedPhoto.id);
            window.history.pushState({ photoId: selectedPhoto.id }, '', url.toString());
        } else {
            // Only clear if the URL actually has a photo param
            if (url.searchParams.has('photo')) {
                url.searchParams.delete('photo');
                window.history.pushState({}, '', url.toString());
            }
        }
    }, [selectedPhoto, deepLinkChecked]);

    // Handle Browser Back Button
    useEffect(() => {
        const handlePopState = (event) => {
            if (!event.state?.photoId) {
                setSelectedPhoto(null);
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const handleFolderSelect = (folderId, folderName) => {
        if (folderId === currentFolderId && !loading) return;
        setCurrentFolderId(folderId);
        setCurrentFolderName(folderName);
    };

    const rawImages = photos.filter(item => item.mimeType !== 'application/vnd.google-apps.folder');

    const images = React.useMemo(() => {
        return [...rawImages].sort((a, b) => {
            const pinnedDifference = Number(isPinnedPhoto(b)) - Number(isPinnedPhoto(a));
            if (pinnedDifference !== 0) return pinnedDifference;

            const dateA = getPhotoDate(a);
            const dateB = getPhotoDate(b);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
    }, [rawImages, sortOrder]);

    // Distribute sorted images round-robin into columns so the layout reads Left-to-Right
    const effectiveColumnCount = Math.max(1, Math.min(columnCount, images.length || 1));
    const columns = React.useMemo(() => {
        const cols = Array.from({ length: effectiveColumnCount }, () => []);
        images.forEach((photo, index) => {
            cols[index % effectiveColumnCount].push({ photo, originalIndex: index });
        });
        return cols;
    }, [images, effectiveColumnCount]);

    // Navigation handlers
    const handleNext = () => {
        if (!selectedPhoto) return;
        // Compare against high-res URL or original URL to find index
        const currentIndex = images.findIndex(img => {
            const highRes = img.thumbnailLink ? img.thumbnailLink.replace(/=s\d+$/, '=s3000') : getImageUrl(img.id);
            return highRes === selectedPhoto.src || getImageUrl(img.id) === selectedPhoto.src;
        });

        if (currentIndex < images.length - 1) {
            const nextPhoto = images[currentIndex + 1];
            setSelectedPhoto({
                src: nextPhoto.thumbnailLink ? nextPhoto.thumbnailLink.replace(/=s\d+$/, '=s3000') : getImageUrl(nextPhoto.id),
                alt: getDisplayName(nextPhoto),
                metadata: nextPhoto.imageMediaMetadata,
                createdTime: nextPhoto.createdTime,
                date: getPhotoDate(nextPhoto),
                id: nextPhoto.id // Ensure ID is passed
            });
        }
    };

    const handlePrev = () => {
        if (!selectedPhoto) return;
        const currentIndex = images.findIndex(img => {
            const highRes = img.thumbnailLink ? img.thumbnailLink.replace(/=s\d+$/, '=s3000') : getImageUrl(img.id);
            // Fallback match by ID if src match fails (more robust)
            if (selectedPhoto.id && img.id === selectedPhoto.id) return true;
            return highRes === selectedPhoto.src || getImageUrl(img.id) === selectedPhoto.src;
        });

        if (currentIndex > 0) {
            const prevPhoto = images[currentIndex - 1];
            setSelectedPhoto({
                src: prevPhoto.thumbnailLink ? prevPhoto.thumbnailLink.replace(/=s\d+$/, '=s3000') : getImageUrl(prevPhoto.id),
                alt: getDisplayName(prevPhoto),
                metadata: prevPhoto.imageMediaMetadata,
                createdTime: prevPhoto.createdTime,
                date: getPhotoDate(prevPhoto),
                id: prevPhoto.id // Ensure ID is passed
            });
        }
    };

    const currentImageIndex = selectedPhoto
        ? images.findIndex(img => {
            const highRes = img.thumbnailLink ? img.thumbnailLink.replace(/=s\d+$/, '=s3000') : getImageUrl(img.id);
            return highRes === selectedPhoto.src || getImageUrl(img.id) === selectedPhoto.src;
        })
        : -1;

    // Skeleton Loader Component
    const SkeletonGrid = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-square bg-film-paper rounded-sm animate-pulse" />
            ))}
        </div>
    );

    if (error) {
        return (
            <div className="text-center text-red-400 py-10">
                <p>{error}</p>
                {currentFolderId && (
                    <button
                        onClick={() => handleFolderSelect('', 'Canon 60D')}
                        className="mt-4 px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 text-white"
                    >
                        Return to Canon 60D
                    </button>
                )}
            </div>
        );
    }

    return (
        <>
            {/* Sticky Header with Breadcrumbs and Filters */}
            <div className="sticky top-0 z-30 bg-film-cream/95 backdrop-blur-md border-b border-film-black/5 transition-all duration-300">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Left Side: Folder Pills (Always visible with active state) */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 flex-1">
                            {availableFolders.length > 0 ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleFolderSelect('', 'Canon 60D')}
                                        className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-xs font-mono tracking-wide transition-all ${
                                            !currentFolderId
                                                ? 'bg-film-red text-film-cream border-film-red shadow-sm font-medium'
                                                : 'border-film-red/30 text-film-red hover:border-film-red hover:bg-film-paper/60'
                                        }`}
                                    >
                                        Canon 60D
                                    </button>
                                    {availableFolders.map((folder) => {
                                        const isActive = currentFolderId === folder.id;
                                        return (
                                            <button
                                                key={folder.id}
                                                onClick={() => handleFolderSelect(folder.id, folder.name)}
                                                className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-xs font-mono tracking-wide transition-all ${
                                                    isActive
                                                        ? 'bg-film-red text-film-cream border-film-red shadow-sm font-medium'
                                                        : 'border-film-red/30 text-film-red hover:border-film-red hover:bg-film-paper/60'
                                                }`}
                                            >
                                                {folder.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <span className={`text-xs font-mono tracking-widest uppercase flex items-center gap-2 ${loading ? '' : 'text-film-red/50 truncate'}`}>
                                    {loading ? (
                                        <span className="text-film-red/70 flex items-center gap-1.5">
                                            <Loader2 size={12} className="animate-spin" />
                                            Loading...
                                        </span>
                                    ) : (
                                        currentFolderName
                                    )}
                                </span>
                            )}
                        </div>

                        {/* Right Side: View Controls (Only show if we have images) */}
                        {images.length > 0 && (
                            <div className="flex items-center gap-4 flex-shrink-0 border-t md:border-t-0 border-film-black/5 pt-2 md:pt-0">
                                <button
                                    onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                                    className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-film-black/60 hover:text-film-black transition-colors"
                                >
                                    <ArrowUpDown size={12} />
                                    <span>{sortOrder === 'desc' ? 'New to Old' : 'Old to New'}</span>
                                </button>

                                <div className="h-4 w-px bg-film-black/20"></div>

                                <div className="flex items-center gap-1 bg-film-paper border border-film-black/10 rounded-sm p-0.5">
                                    <button
                                        onClick={() => setGridDensity('low')}
                                        className={`p-1.5 rounded-sm transition-colors ${gridDensity === 'low' ? 'bg-film-black text-film-cream' : 'text-film-black/40 hover:text-film-black'}`}
                                        title="Cozy"
                                    >
                                        <GripHorizontal size={14} />
                                    </button>
                                    <button
                                        onClick={() => setGridDensity('medium')}
                                        className={`p-1.5 rounded-sm transition-colors ${gridDensity === 'medium' ? 'bg-film-black text-film-cream' : 'text-film-black/40 hover:text-film-black'}`}
                                        title="Standard"
                                    >
                                        <LayoutGrid size={14} />
                                    </button>
                                    <button
                                        onClick={() => setGridDensity('high')}
                                        className={`p-1.5 rounded-sm transition-colors ${gridDensity === 'high' ? 'bg-film-black text-film-cream' : 'text-film-black/40 hover:text-film-black'}`}
                                        title="Compact"
                                    >
                                        <Grid3x3 size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {loading ? <SkeletonGrid /> : (
                <div className="p-4 space-y-8 container mx-auto pb-20 mt-4">

                    {/* Photos Section */}
                    {images.length > 0 && (
                        <motion.section
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-film-black/10 pb-4 gap-4">
                                <div>
                                    {/* Current Folder Title */}
                                    <motion.h2
                                        key={currentFolderName}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-4xl md:text-5xl font-serif italic text-film-black mb-2"
                                    >
                                        {currentFolderName}
                                    </motion.h2>

                                    <h3 className="text-sm font-mono text-film-gray flex items-center gap-2">
                                        <span className="text-film-red bg-film-paper px-1.5 py-0.5 rounded-sm">
                                            {images.length < 10 ? `0${images.length}` : images.length}
                                        </span>
                                        <span className="uppercase tracking-widest text-[10px]">Items</span>
                                    </h3>
                                </div>
                            </div>

                            {/* Masonry Layout: Left-to-Right Ordering */}
                            {(() => {
                                const gapClass = {
                                    low: 'gap-8',
                                    medium: 'gap-4 sm:gap-6',
                                    high: 'gap-2'
                                }[gridDensity];

                                return (
                                    <div
                                        className={`grid ${gapClass}`}
                                        style={{
                                            gridTemplateColumns: `repeat(${effectiveColumnCount}, minmax(0, 1fr))`
                                        }}
                                    >
                                        {columns.map((col, colIdx) => (
                                            <div key={colIdx} className={`flex flex-col ${gapClass}`}>
                                                {col.map(({ photo, originalIndex }) => {
                                                    const imageUrl = getImageUrl(photo.id);
                                                    const thumbnailUrl = photo.thumbnailLink
                                                        ? photo.thumbnailLink.replace(/=s\d+$/, '=s500')
                                                        : imageUrl;

                                                    const exifString = `${photo.imageMediaMetadata?.cameraMake || ''} ${photo.imageMediaMetadata?.cameraModel || ''} • ISO ${photo.imageMediaMetadata?.isoSpeed || '-'} • f/${photo.imageMediaMetadata?.aperture || '-'}`;

                                                    return (
                                                        <motion.div
                                                            key={photo.id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ duration: 0.4, delay: Math.min(originalIndex * 0.03, 0.4) }}
                                                            className="w-full bg-white p-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15)] transition-shadow duration-300 ease-in-out cursor-zoom-in group relative"
                                                            onClick={() => setSelectedPhoto({
                                                                src: photo.thumbnailLink ? photo.thumbnailLink.replace(/=s\d+$/, '=s3000') : imageUrl,
                                                                alt: getDisplayName(photo),
                                                                metadata: photo.imageMediaMetadata,
                                                                createdTime: photo.createdTime,
                                                                date: getPhotoDate(photo),
                                                                id: photo.id
                                                            })}
                                                        >
                                                            {isPinnedPhoto(photo) && (
                                                                <div
                                                                    className="absolute top-5 right-5 z-10 rounded-full bg-film-red p-2 text-film-cream shadow-md"
                                                                    title="Pinned photo"
                                                                    aria-label="Pinned photo"
                                                                >
                                                                    <Pin size={14} fill="currentColor" />
                                                                </div>
                                                            )}

                                                            <LazyImage
                                                                src={thumbnailUrl}
                                                                alt={getDisplayName(photo)}
                                                                width={photo.imageMediaMetadata?.width}
                                                                height={photo.imageMediaMetadata?.height}
                                                                className="aspect-auto w-full"
                                                            />

                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 pointer-events-none">
                                                                <div className="text-white/90 font-mono text-[10px] tracking-widest uppercase border-l-2 border-film-red pl-2">
                                                                    <p>{exifString}</p>
                                                                    <p className="opacity-70">{getPhotoDate(photo).toISOString().split('T')[0]}</p>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </motion.section>
                    )}

                    {images.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-32 text-film-gray">
                            <div className="bg-film-paper p-6 rounded-full mb-4">
                                <ImageIcon size={48} className="opacity-50 text-film-black" />
                            </div>
                            <p className="text-lg font-serif italic text-film-black">No photos in this section.</p>
                            {availableFolders.length > 0 && !currentFolderId && (
                                <p className="text-xs font-mono text-film-red mt-2 uppercase tracking-widest">
                                    Select a collection pill above to view photos
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {selectedPhoto && (
                <Lightbox
                    image={selectedPhoto}
                    onClose={() => setSelectedPhoto(null)}
                    onNext={handleNext}
                    onPrev={handlePrev}
                    hasNext={currentImageIndex < images.length - 1}
                    hasPrev={currentImageIndex > 0}
                    nextSrc={currentImageIndex < images.length - 1 ? (images[currentImageIndex + 1].thumbnailLink ? images[currentImageIndex + 1].thumbnailLink.replace(/=s\d+$/, '=s3000') : getImageUrl(images[currentImageIndex + 1].id)) : null}
                    prevSrc={currentImageIndex > 0 ? (images[currentImageIndex - 1].thumbnailLink ? images[currentImageIndex - 1].thumbnailLink.replace(/=s\d+$/, '=s3000') : getImageUrl(images[currentImageIndex - 1].id)) : null}
                />
            )}
        </>
    );
};

export default Gallery;
