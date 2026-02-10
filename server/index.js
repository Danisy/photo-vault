const express = require('express');
const cors = require('cors');
const NodeCache = require('node-cache');
require('dotenv').config();
const { listImages, getFileStream } = require('./driveClient');

const app = express();
const PORT = process.env.PORT || 3001;

// Allow requests from specific origins in production, or all for now
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());

// API Routes

// Get list of photos/folders from the configured folder
app.get('/api/photos', async (req, res) => {
    try {
        // Use the folderId from query params OR the default one from env
        const folderId = req.query.folderId || process.env.DRIVE_FOLDER_ID;

        if (!folderId) {
            return res.status(500).json({ error: 'DRIVE_FOLDER_ID not configured' });
        }
        const files = await listImages(folderId);
        res.json(files);
    } catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({ error: 'Failed to fetch photos', details: error.message });
    }
});

// Stream image content by ID
app.get('/api/image/:id', async (req, res) => {
    try {
        const fileId = req.params.id;
        const stream = await getFileStream(fileId);
        stream.pipe(res);
    } catch (error) {
        console.error('Error fetching image:', error);
        res.status(500).send('Failed to fetch image');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
