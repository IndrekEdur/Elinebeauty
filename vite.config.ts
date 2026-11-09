import { defineConfig, type Plugin, type Connect } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
// Match static hosting's directory redirect in both local preview and development.
const invitationDirectory = (): Plugin => {
  const redirect: Connect.NextHandleFunction = (req, res, next) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (url.pathname !== '/kutse') return next();
    res.writeHead(308, { Location: `/kutse/${url.search}` });
    res.end();
  };
  return { name: 'invitation-directory',
    configureServer(server) { server.middlewares.use(redirect); },
    configurePreviewServer(server) { server.middlewares.use(redirect); },
  };
};
export default defineConfig({ plugins: [react(), tailwindcss(), invitationDirectory()], build: {
  sourcemap: false,
  rollupOptions: { input: { home: 'index.html', invitation: 'kutse/index.html' } },
} });
