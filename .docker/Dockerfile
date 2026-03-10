# --- Stage 1: Build ---
FROM node:22-alpine AS builder

# Активируем pnpm через corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /var/www/app

# Копируем только файлы зависимостей для эффективного кэширования слоев
COPY src/package*.json ./
COPY src/pnpm-lock.yaml* ./

ENV NODE_OPTIONS="--max_old_space_size=2000"

# Установка зависимостей
RUN pnpm install --no-frozen-lockfile

# Копируем остальные исходники из папки src
COPY src/ .

# Сборка Nuxt проекта
RUN pnpm build

# --- Stage 2: Run (PM2) ---
FROM node:22-alpine AS prod

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /var/www/app

RUN npm i -g pm2@latest

COPY --from=builder /var/www/app/.output ./.output

EXPOSE 3000

CMD ["pm2-runtime", "start", ".output/server/index.mjs", "--name", "todo-luna", "-i", "2"]