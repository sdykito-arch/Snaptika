# Backend Dockerfile for Snaptika
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
CMD ["node", "dist/main.js"]
EXPOSE 3001
