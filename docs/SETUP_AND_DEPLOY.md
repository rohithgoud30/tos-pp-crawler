# Project Setup and Deployment Guide

This document provides a step-by-step walkthrough of how to prepare, install, build, run, and deploy the **tos-pp-crawler** project both locally and on Vercel. It also explains how automatic deployments work when integrating with GitHub.

## 1. Prerequisites

Before you begin, make sure you have the following:

- **Git**: to clone and manage the repository.
- **Node.js & npm (or Yarn)**: to install dependencies, run, and build the project.
- **A GitHub account**: to host your repository and enable continuous deployment.
- **A Vercel account**: to deploy your Next.js application.

## 2. Clone the Repository

1. Open your terminal or command prompt.
2. Run the git clone command using your repository URL.
3. Navigate into the project directory.

## 3. Environment Variables

The project relies on a set of environment variables to connect to APIs and handle authentication. You must create a file named `.env.local` in the project root and populate it with the following values:

- `NEXT_PUBLIC_BACKEND_URL`: The base URL of the backend API.
- `NEXT_PUBLIC_API_KEY`: The public API key for accessing protected endpoints.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key for front-end authentication.
- `CLERK_SECRET_KEY`: Your Clerk secret key, kept on the server side only.
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: The client-side path for the sign-in page.
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`: The client-side path for the sign-up page.
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`: Where to redirect after successful sign-in.
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`: Where to redirect after successful sign-up.

> **Note**: `.env.local` is git-ignored by default. Do **not** commit your secrets to source control.

## 4. Local Development

1. Install project dependencies by running the package manager install command.
2. Once installed, start the development server to launch the app locally.
3. Open your browser and go to http://localhost:3000 to interact with the application.
4. Sign up or log in via Clerk; the application will then allow you to submit URLs, view statuses, and test all features.

## 5. Production Build

When you're ready to prepare a production build—for example, before deploying to a server or generating static assets—run the build command. This compiles and optimizes all JavaScript, CSS, and image assets for production usage.

## 6. Vercel Deployment

1. In the Vercel dashboard, click **Import Project** and select your GitHub repository.
2. During import, Vercel will detect it's a Next.js app. Proceed to the **Environment Variables** section.
3. Copy the **exact same** variables from your local `.env.local` into Vercel (for Production, Preview, and Development environments).
4. Finish the setup; Vercel will automatically install dependencies, build the project, and deploy it.

## 7. Automatic Deployments & Preview URLs

- **Every push** to any branch in GitHub triggers a **Preview Deployment** in Vercel. You receive a unique URL to test changes in an isolated environment.
- **Merging** or **pushing** to the `main` (or your production branch) triggers a **Production Deployment** that replaces your live site.
- Vercel's dashboard shows build logs, environment info, and domain settings for both Preview and Production.

## 8. Verifying and Testing

- After deployment, visit your production domain to ensure environment variables are loaded and the app functions correctly.
- Use the Vercel Preview URL to validate feature branches and bugfixes before merging.
- Monitor build status and logs directly from the Vercel dashboard.

---

With these steps, you can clone the repo, install dependencies, set up your `.env.local`, run locally, and deploy automatically via Vercel. You'll have both Preview and Production deployments wired up to your GitHub workflow.
