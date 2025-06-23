import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns/promises';

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DNS test on startup
(async () => {
  try {
    const res = await dns.lookup('api.prod.omeda.city');
    console.log('✅ DNS working:', res.address);
  } catch (err) {
    console.error('❌ DNS lookup failed:', err);
  }
})();

// Serve static frontend files from /public
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// API endpoint to fetch match history for a player ID
app.get('/api/player/:id/history', async (req, res) => {
  const playerId = req.params.id;

  try {
    const apiUrl = `https://api.prod.omeda.city/v1/matches/get-matches-by-player?player_id=${playerId}&limit=10`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API response not OK: ${response.status}`);
    }

    const data = await response.json();
    res.json(data.matches || []);
  } catch (error) {
    console.error(`Error in /api/player/:id/history:`, error);
    res.status(500).json({ error: 'Failed to fetch match history' });
  }
});

// Optional: fallback route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
