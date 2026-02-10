# Deployment Guide for Photo Vault

This guide will help you deploy your Photo Vault application for **FREE** using Render (Backend) and Vercel (Frontend).

## Prerequisites
1.  **GitHub Account**: You need to push your code to a GitHub repository.
2.  **Render Account**: Sign up at [render.com](https://render.com).
3.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).

---

## Part 1: Push to GitHub
1.  Create a new repository on GitHub (e.g., `photo-vault`).
2.  Push your code:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin <YOUR_GITHUB_REPO_URL>
    git push -u origin main
    ```

---

## Part 2: Deploy Backend (Render)
1.  **New Web Service**:
    -   Go to Render Dashboard -> New + -> Web Service.
    -   Connect your GitHub repository.
2.  **Configure Settings**:
    -   **Name**: `photo-vault-backend` (or similar)
    -   **Root Directory**: `server`
    -   **Runtime**: Node
    -   **Build Command**: `npm install`
    -   **Start Command**: `node index.js`
    -   **Free Tier**: Select "Free".
3.  **Environment Variables**:
    -   Scroll down to **Environment Variables**.
    -   Add the following keys from your `server/.env` file:
        -   `GOOGLE_CLIENT_EMAIL`: (Your service account email)
        -   `GOOGLE_PRIVATE_KEY`: (Your private key - copy the WHOLE thing including `-----BEGIN...`)
        -   `GOOGLE_DRIVE_FOLDER_ID`: (The folder ID you want to show)
        -   `CLIENT_URL`: `*` (For now, allows any connection. You can change this to your Vercel URL later).
4.  **Deploy**: Click "Create Web Service".
5.  **Copy URL**: Once deployed, copy the URL (e.g., `https://photo-vault-backend.onrender.com`).

---

## Part 3: Deploy Frontend (Vercel)
1.  **New Project**:
    -   Go to Vercel Dashboard -> Add New -> Project.
    -   Import your GitHub repository.
2.  **Configure Settings**:
    -   **Framework Preset**: Vite (should detect automatically).
    -   **Root Directory**: Edit this and select `client`.
3.  **Environment Variables**:
    -   Expand "Environment Variables".
    -   Key: `VITE_API_URL`
    -   Value: `https://photo-vault-backend.onrender.com/api` (The Render URL + `/api`)
        -   *Note: Do not forget the `/api` at the end!*
4.  **Deploy**: Click "Deploy".

---

## Part 4: Final Polish
1.  Once Vercel finishes, you will get a domain (e.g., `photo-vault.vercel.app`).
2.  Open it on your phone!
3.  **Optional**: Go back to Render -> Environment Variables and change `CLIENT_URL` to your specific Vercel domain for better security.

## Troubleshooting
-   **Render Sleep**: The free tier sleeps after 15 mins. The first load might take 60 seconds.
-   **CORS Errors**: Check if your `CLIENT_URL` in Render matches your Vercel domain.
