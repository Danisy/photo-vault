import React, { useState, useEffect } from 'react';
import { fetchPhotos, getImageUrl } from '../services/api';
import Lightbox from './Lightbox';
import { Loader2, Image as ImageIcon, ArrowUpDown, GripHorizontal, LayoutGrid, Grid3x3 } from 'lucide-react';
import { motion } from 'framer-motion';

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

const LazyImage = ({ src, alt, className, style, onClick }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className={`relative overflow-hidden bg-film-paper ${className}`} style={style} onClick={onClick}>
            {/* Small placeholder or just background color is handled by parent/bg-film-paper */}
            <img
                src={src}
                alt={alt}
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
                className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${isLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xl scale-105'
                    }`}
            />
        </div>
    );
};

const Gallery = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [currentFolderId, setCurrentFolderId] = useState('');
    const [currentFolderName, setCurrentFolderName] = useState('Collection');
    const [folderHistory, setFolderHistory] = useState([]);
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = Newest first, 'asc' = Oldest first
    const [gridDensity, setGridDensity] = useState('medium'); // 'low', 'medium', 'high'

    useEffect(() => {
        const loadPhotos = async () => {
            setLoading(true);
            try {
                const data = await fetchPhotos(currentFolderId);
                setPhotos(data);
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
                        alt: photo.name,
                        metadata: photo.imageMediaMetadata,
                        createdTime: photo.createdTime,
                        date: getPhotoDate(photo),
                        id: photo.id // Ensure ID is passed
                    });
                }
            }
            setDeepLinkChecked(true); // Mark check as done
        }
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

    const handleFolderClick = (folderId, folderName) => {
        // Push the CURRENT state to history
        setFolderHistory((prev) => [...prev, { id: currentFolderId, name: currentFolderName }]);
        // Set the NEW state
        setCurrentFolderId(folderId);
        setCurrentFolderName(folderName);
    };

    const handleBack = () => {
        if (folderHistory.length === 0) return;
        const newHistory = [...folderHistory];
        const lastHelper = newHistory.pop(); // This is the state we want to restore
        setFolderHistory(newHistory);
        setCurrentFolderId(lastHelper.id);
        setCurrentFolderName(lastHelper.name);
    };

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
                {folderHistory.length > 0 && (
                    <button onClick={handleBack} className="mt-4 px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 text-white">
                        Go Back
                    </button>
                )}
            </div>
        );
    }

    const folders = photos.filter(item => item.mimeType === 'application/vnd.google-apps.folder');
    const rawImages = photos.filter(item => item.mimeType !== 'application/vnd.google-apps.folder');

    const images = React.useMemo(() => {
        return [...rawImages].sort((a, b) => {
            const dateA = getPhotoDate(a);
            const dateB = getPhotoDate(b);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
    }, [rawImages, sortOrder]);

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
                alt: nextPhoto.name,
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
                alt: prevPhoto.name,
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

    return (
        <>
            {/* Sticky Header with Breadcrumbs and Filters */}
            <div className="sticky top-0 z-30 bg-film-cream/95 backdrop-blur-md border-b border-film-black/5 transition-all duration-300">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex flex-col gap-4">
                        {/* Top Row: Back Button & Folder Pills */}
                        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
                            {folderHistory.length > 0 && (
                                <button
                                    onClick={handleBack}
                                    className="flex-shrink-0 flex items-center gap-1 pr-4 border-r border-film-black/10 text-film-gray hover:text-film-black transition-colors font-mono uppercase tracking-widest text-xs"
                                >
                                    &larr; Back
                                </button>
                            )}

                            {/* Make "All Photos" appear as an active root state if needed, or just list subfolders */}
                            {folders.length > 0 ? (
                                <div className="flex items-center gap-2">
                                    {folders.map((folder) => (
                                        <button
                                            key={folder.id}
                                            onClick={() => handleFolderClick(folder.id, folder.name)}
                                            className="whitespace-nowrap px-4 py-1.5 rounded-full border border-film-black/10 text-film-black/60 hover:text-film-black hover:border-film-black hover:bg-white text-xs font-mono tracking-wide transition-all"
                                        >
                                            {folder.name}
                                        </button>
                                    ))}
                                    <span className="text-xs font-mono text-film-black/30 tracking-widest uppercase">
                                        {loading ? 'Loading...' : currentFolderName}
                                    </span>
                            )}
                                </div>
                    </div>
                    </div>
                </div>


                {loading ? <SkeletonGrid /> : (
                <div className="p-4 space-y-8 container mx-auto pb-20 mt-4">

                                    <ArrowUpDown size={12} />
                                    {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
                                </button>

                                <div className="h-4 w-px bg-film-black/20 hidden sm:block"></div>

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
        </div >
                    )}


{/* Photos Section - Masonry Layout */ }
{
    images.length > 0 && (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            {/* ... (Previous header removed as it's moved up) ... */}

            {/* Responsive Layout: Masonry Columns based on Density */
                (() => {
                    const columnClasses = {
                        low: 'columns-1 sm:columns-2 lg:columns-2 gap-8',
                        medium: 'columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-4 sm:gap-6',
                        high: 'columns-3 sm:columns-4 md:columns-5 lg:columns-6 gap-2'
                    };

                    const itemSpacing = {
                        low: 'mb-8',
                        medium: 'mb-4 sm:mb-6',
                        high: 'mb-2'
                    };

                    return (
                        <div className={columnClasses[gridDensity]}>
                            {images.map((photo, index) => {
                                const imageUrl = getImageUrl(photo.id);
                                // Use thumbnail for grid if available, requesting larger size (s500)
                                const thumbnailUrl = photo.thumbnailLink
                                    ? photo.thumbnailLink.replace(/=s\d+$/, '=s500')
                                    : imageUrl;

                                // Determine aspect ratio from metadata
                                const width = photo.imageMediaMetadata?.width;
                                const height = photo.imageMediaMetadata?.height;
                                const isPortrait = height && width ? height > width : false;

                                // Format simple EXIF string
                                const exifString = `${photo.imageMediaMetadata?.cameraMake || ''} ${photo.imageMediaMetadata?.cameraModel || ''} • ISO ${photo.imageMediaMetadata?.isoSpeed || '-'} • f/${photo.imageMediaMetadata?.aperture || '-'}`;

                                return (
                                    <motion.div
                                        key={photo.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.05 }}
                                        className={`break-inside-avoid inline-block w-full align-top bg-white p-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15)] transition-shadow duration-300 ease-in-out cursor-zoom-in group relative ${itemSpacing[gridDensity]}`}
                                        style={{
                                            breakInside: 'avoid',
                                            WebkitBreakInside: 'avoid'
                                        }}
                                        onClick={() => setSelectedPhoto({
                                            src: photo.thumbnailLink ? photo.thumbnailLink.replace(/=s\d+$/, '=s3000') : imageUrl, // Use 3000px preview
                                            alt: photo.name,
                                            metadata: photo.imageMediaMetadata,
                                            createdTime: photo.createdTime,
                                            date: getPhotoDate(photo),
                                            id: photo.id
                                        })}
                                    >
                                        {/* Use LazyImage for Blur-up Effect */}
                                        <LazyImage
                                            src={thumbnailUrl}
                                            alt={photo.name}
                                            className="aspect-auto w-full"
                                        />

                                        {/* Film Strip EXIF Overlay */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 pointer-events-none">
                                            <div className="text-white/90 font-mono text-[10px] tracking-widest uppercase border-l-2 border-film-red pl-2">
                                                <p>{exifString}</p>
                                                <p className="opacity-70">{getPhotoDate(photo).toISOString().split('T')[0]}</p>
                                            </div>
                                        </div>

                                        {/* Filename Overlay (Optional, keeping consistent with previous design) */}
                                        {/* Removed filename text to cleaner look per "premium" request, EXIF is enough */}
                                    </motion.div>
                                );
                            })}
                        </div>
                    );
                })()}
        </motion.section>
    )
}

{
    photos.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-32 text-gray-500">
            <div className="bg-gray-800/50 p-6 rounded-full mb-4">
                <ImageIcon size={48} className="opacity-50" />
            </div>
            <p className="text-lg">No content found in this folder.</p>
        </div>
    )
}
                </div >
            )}

{
    selectedPhoto && (
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
    )
}
        </>
    );
};

export default Gallery;
