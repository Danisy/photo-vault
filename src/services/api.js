import axios from 'axios';

const API_Base = '/api';

export const fetchPhotos = async (folderId = '', includeSubfolders = false) => {
    try {
        const params = {
            ...(folderId ? { folderId } : {}),
            ...(includeSubfolders ? { includeSubfolders: 'true' } : {}),
        };
        const response = await axios.get(`${API_Base}/photos`, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching photos:', error);
        throw error;
    }
};

export const getImageUrl = (id) => {
    return `${API_Base}/image/${id}`;
};
