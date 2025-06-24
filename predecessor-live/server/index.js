import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

const OMEDA_API_BASE = 'https://api.thepredecessor.com/v1';

// Resolve player name to player ID
app.get('/api/player/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const response = await fetch(`${OMEDA_API_BASE}/players/find-by-name?player_name=${encodeURIComponent(name)}`);
    if (!response.ok) throw new Error(`Failed to resolve player name: ${response.status}`);
    const { player_id } = await response.json();
    res.json({ playerId: player_id });
  } catch (err) {
    console.error('Error resolving player name:', err);
    res.status(500).json({ error: 'Failed to resolve player name' });
  }
});

app.get('/api/player/:id/matches', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await fetch(`${OMEDA_API_BASE}/players/${id}/matches?limit=10`);
    if (!response.ok) throw new Error(`Failed to fetch matches: ${response.status}`);
    const matchList = await response.json();
    res.json(matchList);
  } catch (err) {
    console.error('Error fetching matches:', err);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

app.get('/api/match/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await fetch(`${OMEDA_API_BASE}/matches/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch match: ${response.status}`);
    const matchDetails = await response.json();
    res.json(matchDetails);
  } catch (err) {
    console.error('Error fetching match detail:', err);
    res.status(500).json({ error: 'Failed to fetch match detail' });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
