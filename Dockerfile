FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
# Optional: API base baked into the bundle (docker-compose sets it for local use).
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
# Stripe publishable key (pk_test_/pk_live_, public by design). Empty = demo mode.
ARG VITE_STRIPE_PUBLISHABLE_KEY
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY
# true shows the seeded test accounts on the login page (local / demo only).
ARG VITE_SHOW_DEMO_ACCOUNTS
ENV VITE_SHOW_DEMO_ACCOUNTS=$VITE_SHOW_DEMO_ACCOUNTS
RUN npm run build

FROM nginx:alpine

# A template: the entrypoint injects the container's DNS resolver into it
# (opt-in through NGINX_ENTRYPOINT_LOCAL_RESOLVERS).
ENV NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080
