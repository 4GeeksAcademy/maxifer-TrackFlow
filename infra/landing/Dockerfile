FROM node:22-alpine AS build
WORKDIR /app
COPY uis/website/package.json ./
RUN npm install --package-lock=false
COPY uis/website/app ./app
COPY uis/website/assets ./assets
COPY uis/website/scripts ./scripts
COPY uis/website/next.config.ts uis/website/postcss.config.mjs uis/website/tsconfig.json uis/website/tailwind.config.js ./
RUN npm run build

FROM nginx:alpine
COPY infra/landing/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 80
