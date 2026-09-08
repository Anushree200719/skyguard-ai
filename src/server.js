const path = require('path');
const fs = require('fs');

const targetServerPath = path.resolve(__dirname, '../server/src/server.js');

if (fs.existsSync(targetServerPath)) {
  console.log(`📡 [SkyGuard Root Bridge] Loading server from: ${targetServerPath}`);
  require(targetServerPath);
} else {
  console.log(`🚀 [SkyGuard Root Bridge] Starting standalone Express server...`);
  const express = require('express');
  const http = require('http');
  const cors = require('cors');

  const app = express();
  const server = http.createServer(app);
  const PORT = process.env.PORT || 5000;

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'online',
      service: 'SkyGuard AI Express Backend',
      timestamp: new Date()
    });
  });

  server.listen(PORT, () => {
    console.log(`🚀 SkyGuard AI Server running on port ${PORT}`);
  });
}
