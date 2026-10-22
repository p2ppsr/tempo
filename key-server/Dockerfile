FROM node:22.23.4-alpine@sha256:fe4f6d74e20370acb04ad889077d14d0f64a9c8ea6a42bc60cddf1e844699914
RUN test "$(node --version)" = "v22.23.4"

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* ./
RUN npm ci
RUN npm install -g knex

COPY . .
RUN npm run build

EXPOSE 8081

# In production, NODE_ENV is "production" (set externally or via Docker Compose)
CMD ["sh", "scripts/start.sh"]
