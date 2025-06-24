import express from 'express';
import path from 'path';
import fetch from 'node-fetch';
import getPlayerMatchHistory from './playerHistory.js';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// API route to get player ID from name
app.get('/api/player/:name', async (req, res) => {
  const playerName = req.params.name;

  try {
    const response = await fetch(`https://backend.production.omeda-aws.com/api/public/get-player?player_name=${playerName}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch player ID: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.player || !data.player.player_id) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json({ playerId: data.player.player_id });
  } catch (err) {
    console.error('Error in /api/player/:name:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API route to get match history by player ID
app.get('/api/player/:id/history', async (req, res) => {
  const playerId = req.params.id;

  try {
    const matchHistory = await getPlayerMatchHistory(playerId);
    res.json(matchHistory);
  } catch (err) {
    console.error('Error in /api/player/:id/history:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fallback route to serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
