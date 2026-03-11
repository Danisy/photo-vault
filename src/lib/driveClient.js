import { google } from 'googleapis';

export const getDriveClient = () => {
    const scopes = ['https://www.googleapis.com/auth/drive.readonly'];

    const client_email = process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

    // Handle private key - strip surrounding quotes if present, then convert escaped \n to real newlines
    let private_key = process.env.GOOGLE_PRIVATE_KEY || '';
    // Remove surrounding double quotes that Vercel may include
    if (private_key.startsWith('"') && private_key.endsWith('"')) {
        private_key = private_key.slice(1, -1);
    }
    // Replace literal \n with actual newlines
    private_key = private_key.replace(/\\n/g, '\n');

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

export const listImages = async (folderId) => {
    const drive = getDriveClient();
    try {
        const res = await drive.files.list({
            q: `'${folderId}' in parents and (mimeType contains 'image/' or mimeType = 'application/vnd.google-apps.folder') and trashed = false`,
            fields: 'files(id, name, mimeType, thumbnailLink, webContentLink, imageMediaMetadata, createdTime)',
            pageSize: 100,
            orderBy: 'folder, name',
        });

        return res.data.files;
    } catch (error) {
        console.error('Error listing files from Google Drive:', error);
        throw error;
    }
};

export const getFileStream = async (fileId) => {
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
