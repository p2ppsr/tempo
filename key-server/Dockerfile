FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci
RUN npm install -g knex

COPY . .
RUN npm run build

EXPOSE 8081

# In production, NODE_ENV is "production" (set externally or via Docker Compose)
CMD ["sh", "scripts/start.sh"]
