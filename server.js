import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
// import infoRoutes from './api/routes/info.routes.js';
import authRoutes from './api/routes/auth/login.routes.js';
import trackingRoutes from './api/routes/tracking/tracking.routes.js';

// Resolve directory paths in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// API Routes
// app.use('/api/info', infoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tracking', trackingRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  const distDir = path.join(__dirname, 'dist');

  app.use(express.static(distDir, {
    setHeaders(res, filePath) {
      const base = path.basename(filePath);
      if (
        base === 'index.html' ||
        base === 'sw.js' ||
        base === 'registerSW.js' ||
        base.endsWith('.webmanifest')
      ) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return;
      }
      if (filePath.includes(`${path.sep}assets${path.sep}`)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return;
      }
      res.setHeader('Cache-Control', 'public, max-age=900');
    },
  }));

  // Wildcard handler for client side routing
  app.get('*', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.resolve(distDir, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('My Waschen API server is running. Frontend dev server aktif di port 8000.');
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  My Waschen API Server                  `);
  console.log(`  Status: Running                        `);
  console.log(`  Port:   http://localhost:${PORT}        `);
  console.log(`=========================================`);
});
