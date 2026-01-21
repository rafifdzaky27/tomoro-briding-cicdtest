# =========
# 1) Base image
# =========
FROM node:20-alpine AS base

WORKDIR /app

# =========
# 2) Install dependencies
# =========
FROM base AS deps

# copy file yang dibutuhkan untuk install deps
COPY package.json package-lock.json* ./

# pakai npm (karena kamu punya package-lock.json)
RUN npm ci

# =========
# 3) Build stage
# =========
FROM base AS builder

ENV NODE_ENV=production

# copy node_modules dari stage deps
COPY --from=deps /app/node_modules ./node_modules

# copy seluruh source code
COPY . .

# build next.js
RUN npm run build

# =========
# 4) Production runtime
# =========
FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000

# user non-root
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
USER nextjs

WORKDIR /app

# hanya file yang perlu untuk jalanin app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/tsconfig.* ./

EXPOSE 3000

# pastikan di package.json ada "start": "next start"
CMD ["npm", "start"]