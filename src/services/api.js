import axios from 'axios';

const API_Base = '/api';

export const fetchPhotos = async (folderId = '') => {
    try {
        const response = await axios.get(`${API_Base}/photos`, {
            params: { folderId }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching photos:', error);
        throw error;
    }
};

export const getImageUrl = (id) => {
    return `${API_Base}/image/${id}`;
};
