import { createRequire } from 'module';
import path from 'path';
import express from 'express';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

config();

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import app from './backend/app.js';

const distDir = path.join(__dirname, 'dist');
app.use(express.static(distDir));
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/') || req.path.startsWith('/assets/')) {
    return next();
  }
  res.sendFile(path.join(distDir, 'index.html'), (err) => {
    if (err) res.status(500).send('Not built yet. Run: npm run build');
  });
});
app.use((req, res) => res.status(404).json({ error: `Not found: ${req.url}` }));

const PORT = process.env.PORT || 4173;
app.listen(PORT, () => {
  console.log(`Pocket Money running at http://localhost:${PORT}`);
  if (process.env.OPEN_BROWSER !== '0') {
    setTimeout(() => {
      require('child_process').exec(
        `start "" "http://localhost:${PORT}"`,
        () => {}
      );
    }, 700);
  }
});