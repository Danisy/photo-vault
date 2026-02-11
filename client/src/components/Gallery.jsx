import React, { useState, useEffect } from 'react';
import { fetchPhotos, getImageUrl } from '../services/api';
import Lightbox from './Lightbox';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const Gallery = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [currentFolderId, setCurrentFolderId] = useState('');
    const [folderHistory, setFolderHistory] = useState([]);

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

    const handleFolderClick = (folderId, folderName) => {
        setFolderHistory((prev) => [...prev, { id: currentFolderId, name: folderName }]);
        setCurrentFolderId(folderId);
    };

    const handleBack = () => {
        if (folderHistory.length === 0) return;
        const newHistory = [...folderHistory];
        const lastFolder = newHistory.pop();
        setFolderHistory(newHistory);
        setCurrentFolderId(lastFolder.id);
    };

    // Skeleton Loader Component
    const SkeletonGrid = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-800/50 rounded-lg animate-pulse" />
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
    const images = photos.filter(item => item.mimeType !== 'application/vnd.google-apps.folder');

    // Navigation handlers
    const handleNext = () => {
        if (!selectedPhoto) return;
        const currentIndex = images.findIndex(img => getImageUrl(img.id) === selectedPhoto.src);
        if (currentIndex < images.length - 1) {
            const nextPhoto = images[currentIndex + 1];
            setSelectedPhoto({
                src: getImageUrl(nextPhoto.id),
                alt: nextPhoto.name,
                metadata: nextPhoto.imageMediaMetadata
            });
        }
    };

    const handlePrev = () => {
        if (!selectedPhoto) return;
        const currentIndex = images.findIndex(img => getImageUrl(img.id) === selectedPhoto.src);
        if (currentIndex > 0) {
            const prevPhoto = images[currentIndex - 1];
            setSelectedPhoto({
                src: getImageUrl(prevPhoto.id),
                alt: prevPhoto.name,
                metadata: prevPhoto.imageMediaMetadata
            });
        }
    };

    const currentImageIndex = selectedPhoto
        ? images.findIndex(img => getImageUrl(img.id) === selectedPhoto.src)
        : -1;

    return (
        <>
            {folderHistory.length > 0 && (
                <div className="p-4 mb-2 container mx-auto">
                    <button
                        onClick={handleBack}
                        className="flex items-center text-gray-400 hover:text-white transition-colors"
                    >
                        &larr; Back
                    </button>
                </div>
            )}

            {loading ? <SkeletonGrid /> : (
                <div className="p-4 space-y-12 container mx-auto pb-20">
                    {/* Folders Section */}
                    {folders.length > 0 && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2 border-b border-gray-800 pb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                </svg>
                                Folders
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {folders.map((folder) => (
                                    <motion.div
                                        key={folder.id}
                                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(55, 65, 81, 1)' }}
                                        whileTap={{ scale: 0.95 }}
                                        className="aspect-[4/3] bg-gray-800/50 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center cursor-pointer border border-white/5 hover:border-blue-500/30 transition-colors group"
                                        onClick={() => handleFolderClick(folder.id, folder.name)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400/80 group-hover:text-blue-400 mb-3 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                        </svg>
                                        <p className="text-gray-300 group-hover:text-white text-sm font-medium px-2 text-center truncate w-full">{folder.name}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {/* Photos Section - Masonry Layout */}
                    {images.length > 0 && (
                        <motion.section
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2 border-b border-gray-800 pb-2">
                                <ImageIcon className="h-5 w-5 text-purple-400" />
                                Photos
                            </h2>

                            {/* Responsive Layout: Grid for Mobile, Masonry Columns for Desktop */}
                            <div className="grid grid-cols-2 gap-4 sm:block sm:columns-2 md:columns-3 lg:columns-4 sm:space-y-4">
                                {images.map((photo, index) => {
                                    const imageUrl = getImageUrl(photo.id);
                                    // Determine aspect ratio from metadata
                                    const width = photo.imageMediaMetadata?.width;
                                    const height = photo.imageMediaMetadata?.height;
                                    const isPortrait = height && width ? height > width : false;

                                    return (
                                        <motion.div
                                            key={photo.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: index * 0.05 }}
                                            className={`break-inside-avoid bg-gray-800 rounded-lg overflow-hidden cursor-zoom-in group relative shadow-lg mb-4 sm:mb-0
                                                ${isPortrait ? 'col-span-2' : 'col-span-1'}
                                                sm:col-span-auto
                                            `}
                                            onClick={() => setSelectedPhoto({
                                                src: imageUrl,
                                                alt: photo.name,
                                                metadata: photo.imageMediaMetadata,
                                                createdTime: photo.createdTime // Use if available, or rely on EXIF time
                                            })}
                                        >
                                            <img
                                                src={imageUrl}
                                                alt={photo.name}
                                                loading="lazy"
                                                className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105 display-block"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://placehold.co/400x400/1a1a1a/FFF?text=Error';
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                                <p className="text-white text-xs font-medium truncate w-full bg-black/50 backdrop-blur-md p-2 rounded">
                                                    {photo.name}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.section>
                    )}

                    {photos.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-32 text-gray-500">
                            <div className="bg-gray-800/50 p-6 rounded-full mb-4">
                                <ImageIcon size={48} className="opacity-50" />
                            </div>
                            <p className="text-lg">No content found in this folder.</p>
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
                />
            )}
        </>
    );
};

export default Gallery;
