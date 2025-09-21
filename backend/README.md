# Snaptika Backend

NestJS backend API for Snaptika social media platform.

## Features

- Custom monetization logic
- User authentication
- Media uploads
- Admin controls
- GraphQL API

## Tech Stack

- NestJS
- TypeScript
- Prisma ORM
- Redis
- Docker

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
3. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```
4. Start the server:
   ```bash
   npm run start:dev
   ```
