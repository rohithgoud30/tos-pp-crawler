# tos-pp-crawler

A Next.js 13 (App Router) application that allows users to submit website URLs for analysis of Terms of Service (ToS) and Privacy Policy (PP) documents. It features user authentication, duplicate detection, pagination, filtering, admin panel, and integration with a backend API.

## Features

- User authentication with Clerk.
- Submit URLs for analysis of ToS and PP documents.
- Duplicate detection to avoid reprocessing the same domain.
- View analysis results and detailed error messages.
- Retry failed submissions with custom document URLs.
- Admin panel for searching and filtering all users' submissions.
- Pagination, sorting (asc/desc), and filters (document type, status, date).
- Responsive UI built with Tailwind CSS and Lucide icons.
- Toast notifications and dialogs for smooth UX.

## Tech Stack

- Next.js 13 (App Router)
- React & TypeScript
- Tailwind CSS
- Clerk for authentication
- Lucide React icons
- SWR/React Query for data fetching via custom hooks (`useSubmissionsList`, `useSubmissionSearch`)
- Vercel for deployment

## Prerequisites

- Node.js 16 or later
- npm or Yarn package manager

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/tos-pp-crawler.git
   cd tos-pp-crawler
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Create `.env.local` in the project root and add:

   ```bash
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
   NEXT_PUBLIC_API_KEY=your_api_key_here
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   ```

4. Start development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Build & Production

- Build the application:

  ```bash
  npm run build
  # or
  yarn build
  ```

- Start in production mode:

  ```bash
  npm start
  # or
  yarn start
  ```

## Deploy

This app is ready for deployment on [Vercel](https://vercel.com). You can also deploy to other platforms that support Node.js:

1. Push your code to GitHub.
2. Import the repo into Vercel.
3. Configure environment variables on the Vercel dashboard.
4. Trigger a deployment via Vercel.

## File Structure

```
.
├── src
│   ├── app           # Next.js App Router pages (submissions, analysis, auth, etc.)
│   ├── components    # Reusable UI components (buttons, inputs, dialogs)
│   ├── context       # React context providers (e.g. auth, toasts)
│   ├── hooks         # Custom React hooks for data fetching and caching
│   └── lib           # API client functions for submissions and admin endpoints
├── public            # Static assets and images
├── scripts           # Utility scripts (e.g. code generation)
├── .env.local        # Environment variables (not checked into VCS)
├── next.config.js    # Next.js configuration
├── tailwind.config.js# Tailwind CSS configuration
├── tsconfig.json     # TypeScript configuration
└── README.md         # Project overview and setup instructions
```

## Contributing

Contributions are welcome! Please open issues or pull requests to improve the project.

## License

This project is MIT licensed.
