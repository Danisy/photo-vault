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

const getFolderDepth = async (drive, folderId, rootFolderId) => {
    assertValidDriveId(folderId, 'folder ID');
    if (folderId === rootFolderId) return 0;

    const folder = await drive.files.get({
        fileId: folderId,
        fields: 'id,mimeType,parents,trashed',
    });
    const data = folder.data;

    if (data.mimeType !== 'application/vnd.google-apps.folder' || data.trashed) {
        throw new Error('Requested folder is outside the public gallery');
    }

    const parents = data.parents || [];
    if (parents.includes(rootFolderId)) return 1;

    const parentFolders = await Promise.all(parents.map((parentId) => drive.files.get({
        fileId: parentId,
        fields: 'mimeType,parents,trashed',
    })));
    const isApprovedSubfolder = parentFolders.some(({ data: parent }) =>
        parent.mimeType === 'application/vnd.google-apps.folder' &&
        !parent.trashed &&
        parent.parents?.includes(rootFolderId)
    );

    if (isApprovedSubfolder) return 2;
    throw new Error('Requested folder is outside the public gallery');
};

const listFolderFiles = async (drive, folderId, depth) => {
    const folderQuery = depth < 2 ? " or mimeType = 'application/vnd.google-apps.folder'" : '';
    const result = await drive.files.list({
        q: `'${escapeDriveQueryValue(folderId)}' in parents and (mimeType contains 'image/'${folderQuery}) and trashed = false`,
        fields: 'files(id, name, mimeType, thumbnailLink, webContentLink, imageMediaMetadata, createdTime)',
        pageSize: 100,
        orderBy: 'folder, name',
    });
    return result.data.files || [];
};

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

    try {
        const depth = await getFolderDepth(drive, requestedFolderId, rootFolderId);
        return await listFolderFiles(drive, requestedFolderId, depth);
    } catch (error) {
        console.error('Error listing files from Google Drive:', error);
        throw error;
    }
};

export const listImagesWithSubfolders = async (folderId) => {
    const drive = getDriveClient();
    const rootFolderId = getConfiguredFolderId();
    assertValidDriveId(rootFolderId, 'configured folder ID');
    assertValidDriveId(folderId, 'folder ID');

    try {
        const depth = await getFolderDepth(drive, folderId, rootFolderId);
        if (depth !== 1) {
            throw new Error('Subfolder aggregation is only available for top-level gallery folders');
        }

        const files = await listFolderFiles(drive, folderId, depth);
        const folders = files.filter((file) => file.mimeType === 'application/vnd.google-apps.folder');
        const photos = files.filter((file) => file.mimeType !== 'application/vnd.google-apps.folder');
        const subfolders = await Promise.all(folders.map(async (folder) => ({
            ...folder,
            photos: (await listFolderFiles(drive, folder.id, 2))
                .filter((file) => file.mimeType !== 'application/vnd.google-apps.folder'),
        })));

        return { photos, subfolders };
    } catch (error) {
        console.error('Error listing gallery folder contents from Google Drive:', error);
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
        const parentDepths = isDirectGalleryFile
            ? []
            : await Promise.all(parents.map((parentId) =>
                getFolderDepth(drive, parentId, rootFolderId)
            ));
        const isApprovedGalleryFile = isDirectGalleryFile ||
            parentDepths.some((depth) => depth === 1 || depth === 2);

        if (metadata.data.trashed || !IMAGE_MIME_PATTERN.test(metadata.data.mimeType || '') ||
            !isApprovedGalleryFile) {
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
