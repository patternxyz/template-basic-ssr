# syntax=docker/dockerfile:1

FROM node:22.22.0-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN npm ci

COPY apps ./apps
COPY packages ./packages

RUN npm run build
RUN npm prune --omit=dev

FROM node:22.22.0-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/web/build ./apps/web/build
COPY --from=build /app/packages/shared/dist ./packages/shared/dist

USER node

EXPOSE 8080

CMD ["node", "apps/api/dist/main.js"]
