import { google } from 'googleapis';

const DRIVE_ID_PATTERN = /^[A-Za-z0-9_-]{10,200}$/;
const IMAGE_MIME_PATTERN = /^image\/(?!svg\+xml$)[a-z0-9.+-]+$/i;

const getConfiguredFolderId = () =>
    process.env.DRIVE_FOLDER_ID || process.env.GOOGLE_DRIVE_FOLDER_ID || '';

const assertValidDriveId = (id, name = 'Drive ID') => {
    if (!id || !DRIVE_ID_PATTERN.test(id)) {
        throw new Error(`Invalid ${name}`);
    }
};

const escapeDriveQueryValue = (value) => value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

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
    const rootFolderId = getConfiguredFolderId();
    assertValidDriveId(rootFolderId, 'configured folder ID');
    const requestedFolderId = folderId || rootFolderId;
    assertValidDriveId(requestedFolderId, 'folder ID');

    try {
        if (requestedFolderId !== rootFolderId) {
            const folder = await drive.files.get({
                fileId: requestedFolderId,
                fields: 'id,mimeType,parents,trashed',
            });
            const isApprovedFolder = folder.data.mimeType === 'application/vnd.google-apps.folder' &&
                !folder.data.trashed &&
                folder.data.parents?.includes(rootFolderId);

            if (!isApprovedFolder) {
                throw new Error('Requested folder is outside the public gallery');
            }
        }

        const res = await drive.files.list({
            q: `'${escapeDriveQueryValue(requestedFolderId)}' in parents and (mimeType contains 'image/' or mimeType = 'application/vnd.google-apps.folder') and trashed = false`,
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
    const rootFolderId = getConfiguredFolderId();
    assertValidDriveId(rootFolderId, 'configured folder ID');
    assertValidDriveId(fileId, 'file ID');

    try {
        const metadata = await drive.files.get({
            fileId,
            fields: 'id,mimeType,parents,trashed',
        });
        const parents = metadata.data.parents || [];
        const isDirectGalleryFile = parents.includes(rootFolderId);
        let isApprovedChildFile = false;

        if (!isDirectGalleryFile) {
            const parentFolders = await Promise.all(parents.map((parentId) => drive.files.get({
                fileId: parentId,
                fields: 'mimeType,parents,trashed',
            })));
            isApprovedChildFile = parentFolders.some(({ data }) =>
                data.mimeType === 'application/vnd.google-apps.folder' &&
                !data.trashed &&
                data.parents?.includes(rootFolderId)
            );
        }

        if (metadata.data.trashed || !IMAGE_MIME_PATTERN.test(metadata.data.mimeType || '') ||
            (!isDirectGalleryFile && !isApprovedChildFile)) {
            throw new Error('Requested file is outside the public image gallery');
        }

        const res = await drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'stream' }
        );
        return { stream: res.data, mimeType: metadata.data.mimeType };
    } catch (error) {
        console.error(`Error getting file stream for ${fileId}:`, error);
        throw error;
    }
};
