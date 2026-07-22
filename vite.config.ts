import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Dev proxy mirrors the production nginx config (and the future K8s ingress):
// the SPA always talks to its own origin, no CORS anywhere.
const services = {
  auth: 'http://localhost:8081',
  orders: 'http://localhost:8082',
  stock: 'http://localhost:8083',
  delivery: 'http://localhost:8084',
  menu: 'http://localhost:8085',
  franchise: 'http://localhost:8089',
  user: 'http://localhost:8087',
  reservation: 'http://localhost:8088',
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api/auth': services.auth,
      '/api/user/': services.auth,   // auth profile (/api/user/me)
      '/api/admin': services.auth,
      '/api/orders': services.orders,
      '/api/menu': services.menu,
      '/api/restaurants': services.franchise,
      '/api/franchise': services.franchise,
      '/api/users': services.user,
      '/api/reservations': services.reservation,
      '/api/stocks': services.stock,
      '/api/replenishment-requests': services.stock,
      '/api/deliveries': services.delivery,
      '/tracking': { target: services.delivery, ws: true },
    },
  },
});
