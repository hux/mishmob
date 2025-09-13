# MishMob Frontend

This directory contains the React-based frontend application for MishMob.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **TanStack Query** for server state management
- **React Router** for navigation

## Development

### Local Development

```bash
cd frontend
npm install
npm run dev
```

The app will be available at http://localhost:8080

### Docker Development

From the root directory:

```bash
just up
```

## Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts (Auth, etc.)
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── services/       # API service layer
│   └── lib/            # Utilities
├── public/            # Static assets
├── index.html         # HTML entry point
├── vite.config.ts     # Vite configuration
├── tsconfig.json      # TypeScript configuration
└── package.json       # Dependencies
```

## Environment Variables

Create a `.env.development` file:

```env
VITE_API_URL=http://localhost:9000/api
```

## Building for Production

```bash
npm run build
```

The built files will be in `dist/`.