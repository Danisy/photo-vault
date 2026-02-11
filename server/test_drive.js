require('dotenv').config();
const { listImages } = require('./driveClient');

async function test() {
    try {
        const folderId = process.env.DRIVE_FOLDER_ID;
        console.log('Listing files from:', folderId);
        const files = await listImages(folderId);
        if (files.length > 0) {
            console.log('Thumbnail Link:', files[0].thumbnailLink);
        } else {
            console.log('No files found.');
        }
    } catch (error) {
        console.error(error);
    }
}

test();
