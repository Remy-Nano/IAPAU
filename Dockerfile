# Étape 1 : Installation des dépendances
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Étape 2 : Build de Next.js en production
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 👉 On fournit les variables d'env au build Next.js
# On copie .env.docker en .env.local à l'intérieur de l'image
RUN cp .env.docker .env.local

RUN npm run build

# Étape 3 : Image finale légère pour exécuter l'app
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]