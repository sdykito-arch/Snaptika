# Snaptika Frontend

React frontend application for Snaptika social media platform.

## Features

- User authentication and registration
- Photo and video sharing
- Stories and Reels
- Personalized feed
- User profiles and following
- Monetization dashboard
- Real-time notifications
- Responsive design

## Tech Stack

- React 18 + TypeScript
- Apollo Client (GraphQL)
- Material-UI
- Redux Toolkit
- React Router
- Framer Motion

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env.local
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run lint` - Runs ESLint

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page components
├── hooks/           # Custom React hooks
├── store/           # Redux store configuration
├── graphql/         # GraphQL queries and mutations
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
└── theme/           # Material-UI theme configuration
```
