# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app/frontend

ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . ./
RUN yarn build

# ---- Runtime stage: plain nginx that serves the static build ----
FROM nginx:1.27-alpine
COPY --from=build /app/frontend/build /usr/share/nginx/html

# default.conf below just serves /; the outer nginx proxies /api → backend
RUN printf 'server { listen 3000; root /usr/share/nginx/html; index index.html; location / { try_files $uri /index.html; } }\n' \
 > /etc/nginx/conf.d/default.conf

EXPOSE 3000
