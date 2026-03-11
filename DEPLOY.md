# Deployment Guide for Photo Vault (Next.js Version)

This guide will help you deploy your unified Photo Vault application for **FREE** using Vercel. With the migration to Next.js, you no longer need Render, and your site will wake up instantly without a 60-second cold start!

## Prerequisites
1.  **GitHub Account**: You need to push your code to a GitHub repository.
2.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
3.  **Google Service Account**: Ensure you have your Google Drive service account credentials handy.

---

## Part 1: Push to GitHub
1.  Create a new repository on GitHub (e.g., `photo-vault-next`).
2.  Push your code:
    ```bash
    git init
    git add .
    git commit -m "Initial commit - Next.js Migration"
    git branch -M main
    git remote add origin <YOUR_GITHUB_REPO_URL>
    git push -u origin main
    ```

---

## Part 2: Deploy to Vercel
1.  **New Project**:
    -   Go to Vercel Dashboard -> Add New -> Project.
    -   Import your GitHub repository.
2.  **Configure Settings**:
    -   **Framework Preset**: Next.js (should detect automatically).
    -   **Root Directory**: Leave as `./` (default).
3.  **Environment Variables**:
    -   Expand "Environment Variables" and add these exactly as they appear in your `.env.local` file:
        -   `GOOGLE_CLIENT_EMAIL`: (Your service account email)
        -   `GOOGLE_PRIVATE_KEY`: (Your private key - copy the WHOLE thing including `-----BEGIN...`)
        -   `GOOGLE_DRIVE_FOLDER_ID`: (Your Google Drive folder ID)
4.  **Deploy**: Click "Deploy".

---

## Part 3: Final Polish
1.  Once Vercel finishes, you will get a live domain (e.g., `photo-vault-next.vercel.app`).
2.  Open it on your phone!
3.  Because Next.js uses serverless functions instead of a persistent background server like Render, there is essentially zero cold-start delay. Enjoy the speed!
