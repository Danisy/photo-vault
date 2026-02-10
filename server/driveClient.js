const { google } = require('googleapis');

// Initialize the Google Drive API client
const getDriveClient = () => {
    const scopes = ['https://www.googleapis.com/auth/drive.readonly'];

    // Authenticate using service account
    const client_email = process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const private_key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    // DEBUG LOGGING
    console.log('--- GOOGLE AUTH DEBUG ---');
    console.log('Client Email:', client_email ? `Set (${client_email.substring(0, 5)}...)` : 'MISSING');
    console.log('Private Key:', private_key ? `Set (Length: ${private_key.length})` : 'MISSING');
    if (private_key) {
        console.log('Private Key starts with:', private_key.substring(0, 20));
        console.log('Private Key includes BEGIN:', private_key.includes('BEGIN PRIVATE KEY'));
    }
    console.log('-------------------------');

    if (!client_email || !private_key) {
        console.error('Missing Google Credentials:', {
            hasEmail: !!client_email,
            hasKey: !!private_key
        });
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email,
            private_key,
        },
        scopes,
    });

    return google.drive({ version: 'v3', auth });
};

/**
 * Lists images and folders in a specific Google Drive folder.
 * @param {string} folderId The ID of the folder to list content from.
 * @returns {Promise<Array>} List of file metadata objects.
 */
const listImages = async (folderId) => {
    const drive = getDriveClient();
    try {
        const res = await drive.files.list({
            q: `'${folderId}' in parents and (mimeType contains 'image/' or mimeType = 'application/vnd.google-apps.folder') and trashed = false`,
            fields: 'files(id, name, mimeType, thumbnailLink, webContentLink)',
            pageSize: 100, // Adjust as needed
            orderBy: 'folder, name', // Folders first, then by name
        });
        return res.data.files;
    } catch (error) {
        console.error('Error listing files from Google Drive:', error);
        throw error;
    }
};

/**
 * Gets a readable stream for a file content.
 * @param {string} fileId The ID of the file to retrieve.
 * @returns {Promise<Stream>} Readable stream of the file content.
 */
const getFileStream = async (fileId) => {
    const drive = getDriveClient();
    try {
        const res = await drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'stream' }
        );
        return res.data;
    } catch (error) {
        console.error(`Error getting file stream for ${fileId}:`, error);
        throw error;
    }
};

module.exports = { listImages, getFileStream };
