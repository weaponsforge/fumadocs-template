FROM node:24.11.0-alpine AS base
RUN apk add --no-cache libc6-compat
RUN mkdir -p /opt/client
WORKDIR /opt/client
RUN chown -R node:node /opt/client
ENV NEXT_TELEMETRY_DISABLED=1
COPY package*.json source.config.ts next.config.mjs ./

# BUILD TARGET
FROM base AS build
RUN --mount=type=cache,target=/root/.npm \
    npm ci && npm cache clean --force
COPY . ./
RUN npm run docker:build

# DEVELOPMENT app PROFILE
FROM base AS development
ENV NODE_ENV=development
RUN --mount=type=cache,target=/root/.npm \
    npm ci && \
    npm cache clean --force && \
    mkdir -p /opt/client/.source && \
    mkdir -p /opt/client/.next && \
    chown -R node:node /opt/client/.source && \
    chown -R node:node /opt/client/.next
COPY --chown=node:node . ./
USER node
EXPOSE 3000
CMD ["npm", "run", "docker:dev"]

# PRODUCTION CLIENT PROFILE (Standalone mode build)
# https://hmos.dev/en/nextjs-docker-standalone-and-custom-server#2-standalone-mode-build
FROM base AS production
ENV NODE_ENV=production
COPY --chown=node:node --from=build /opt/client/package*.json /opt/client/.next/standalone ./
COPY --chown=node:node --from=build /opt/client/.next/static ./.next/static
COPY --chown=node:node --from=build /opt/client/public ./public
USER node
EXPOSE 3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
