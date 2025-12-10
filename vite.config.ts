import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: "window",
  },
  server: {
    proxy: {
      "/socket": {
        target: "https://mps-api.vmarketing.vn",
        changeOrigin: true,
        secure: false,
        ws: true, // Enable WebSocket support
        configure: (proxy, _options) => {
          // Fix for HTTP Handshake (SockJS)
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            proxyReq.setHeader("Origin", "https://mps-api.vmarketing.vn");
          });

          // Fix for WebSocket Upgrade (Native Stomp)
          proxy.on("proxyReqWs", (proxyReq, req, socket, options, head) => {
            console.log("⚡ Proxying WebSocket Upgrade for:", req.url);
            proxyReq.setHeader("Origin", "https://mps-api.vmarketing.vn");
          });
        },
      },
      // We create a fake path called '/api-gateway' (or whatever you want)
      // "/api-gateway": {
      //   target: "https://mps-api.vmarketing.vn", // 👈 Put the REAL domain here
      //   changeOrigin: true, // This tricks the server into accepting the request
      //   secure: false,
      //   rewrite: (path) => path.replace(/^\/api-gateway/, ""), // Removes '/api-gateway' before sending
      // },
    },
  },
});
