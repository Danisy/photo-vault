# Photo Vault

A responsive, dark-mode personal photo portfolio that fetches images dynamically from a Google Drive folder. Built with React (Vite) and Node.js (Express).

## Features
- **Google Drive Integration**: Fetches photos directly from a specified Drive folder.
- **Responsive Gallery**: Masonry-like grid layout using Tailwind CSS.
- **Lightbox**: Full-screen image viewer with smooth transitions.
- **Dark Mode**: Sleek, modern dark UI.

## Prerequisites
- Node.js (v14+)
- A Google Cloud Project with Drive API enabled.
- A Service Account with access to the Drive folder.

## Setup Guide

### 1. Google Cloud Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., "photo-vault").
3. Enable the **Google Drive API**:
   - Navigate to "APIs & Services" > "Library".
   - Search for "Google Drive API" and click "Enable".
4. Create Credentials:
   - Go to "APIs & Services" > "Credentials".
   - Click "Create Credentials" > "Service Account".
   - Name it (e.g., "photo-vault-sa") and click "Done".
   - Click on the newly created Service Account email.
   - Go to the **Keys** tab > "Add Key" > "Create new key" > **JSON**.
   - A `.json` file will download. **Keep this safe!**
5. Share the Folder:
   - Go to your Google Drive and create a folder for your photos.
   - Right-click the folder > "Share".
   - Paste the **Service Account Email** (found in the JSON file or Cloud Console) and give it "Viewer" access.
   - Copy the **Folder ID** from the URL (the string after `folders/`).

### 2. Project Configuration
1. Clone the repository.
2. In the `server` directory, create a `.env` file (copy from `.env.example`):
   ```env
   PORT=3001
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account-email@...
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
   DRIVE_FOLDER_ID=your_folder_id
   ```
   **Note**: For `GOOGLE_PRIVATE_KEY`, copy the `private_key` value from your downloaded JSON file. Ensure newlines are preserved or escaped as `\n`.

### 3. Installation & Running

#### Backend
```bash
cd server
npm install
node index.js
```
The server will start on port 3001.

#### Frontend
```bash
cd client
npm install
npm run dev
```
The client will start at http://localhost:5173.

## Usage
1. Upload photos to your shared Google Drive folder.
2. Open the app.
3. Your photos will appear in the gallery automatically!
