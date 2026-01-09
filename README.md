# Rheply Web Frontend

Modern recruitment platform frontend built with Next.js 14, TypeScript, and shadcn/ui.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
web/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── globals.css      # Global styles and CSS variables
│   │   └── layout.tsx       # Root layout
│   ├── components/          # React components
│   │   └── ui/              # shadcn/ui components
│   ├── lib/                 # Utility functions and helpers
│   │   ├── api.ts           # API client configuration
│   │   └── utils.ts         # Common utilities
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts         # Shared types
│   ├── hooks/               # Custom React hooks
│   └── stores/              # Zustand stores
├── public/                  # Static assets
├── components.json          # shadcn/ui configuration
├── tailwind.config.ts       # TailwindCSS configuration
├── tsconfig.json            # TypeScript configuration
└── next.config.mjs          # Next.js configuration
```

## Adding shadcn/ui Components

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
```

## API Integration

The application proxies API requests to the backend through Next.js rewrites. In production, requests to `/api/*` are forwarded to the backend service.

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=/api
```

## Features (Planned)

- User authentication and authorization
- Candidate management
- Job posting and management
- Application tracking
- Interview scheduling
- Analytics dashboard
- Email notifications

## License

Private - All rights reserved
