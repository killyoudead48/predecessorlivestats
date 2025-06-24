// server/index.js
import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../public')));

// ✅ 1. Resolve player name to ID
app.get('/api/player/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const response = await fetch(`https://backend.prod.omeda.city/api/public/get-player?player_name=${name}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    if (!data?.player_id) return res.status(404).json({ error: 'Player ID not found' });

    res.json({ playerId: data.player_id });
  } catch (err) {
    console.error('Error resolving player name:', err);
    res.status(500).json({ error: 'Failed to resolve player name' });
  }
});

// ✅ 2. Get match history for a player
app.get('/api/player/:id/matches', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await fetch(`https://backend.prod.omeda.city/api/public/get-matches-by-player?player_id=${id}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    res.json(data.matches || []);
  } catch (err) {
    console.error('Error fetching match history:', err);
    res.status(500).json({ error: 'Failed to fetch match history' });
  }
});

// ✅ 3. Get detailed match info
app.get('/api/match/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await fetch(`https://backend.prod.omeda.city/api/public/get-match?match_id=${id}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error fetching match details:', err);
    res.status(500).json({ error: 'Failed to fetch match details' });
  }
});

app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
