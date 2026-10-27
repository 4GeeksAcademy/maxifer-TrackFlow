FROM node:22-alpine AS development
WORKDIR /app/uis
RUN apk add --no-cache tini
COPY backoffice/package.json backoffice/package-lock.json ./backoffice/
RUN npm ci --prefix backoffice
COPY backoffice/talent-pipeline-tracker/package.json backoffice/talent-pipeline-tracker/package-lock.json ./backoffice/talent-pipeline-tracker/
RUN npm ci --prefix backoffice/talent-pipeline-tracker
COPY . .
EXPOSE 3001 3002
ENTRYPOINT ["/sbin/tini", "-g", "--"]
CMD ["sh", "/app/uis/start.sh"]

FROM development AS build
ARG BACKEND_INTERNAL_URL
ARG NEXT_PUBLIC_API_URL
RUN npm run build --prefix backoffice && npm run build --prefix backoffice/talent-pipeline-tracker
RUN npm prune --omit=dev --prefix backoffice && npm prune --omit=dev --prefix backoffice/talent-pipeline-tracker

FROM node:22-alpine AS production
WORKDIR /app/uis
RUN apk add --no-cache tini
COPY --from=build --chown=node:node /app/uis /app/uis
EXPOSE 3001 3002
ENTRYPOINT ["/sbin/tini", "-g", "--"]
USER node
CMD ["sh", "/app/uis/start.sh", "production"]
