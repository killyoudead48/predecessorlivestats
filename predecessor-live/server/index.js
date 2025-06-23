import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Resolve player name to player ID
app.get('/api/player-id/:name', async (req, res) => {
  const playerName = req.params.name;
  try {
    const response = await fetch(`https://omeda.city/players.json?filter[name]=${playerName}`);
    const data = await response.json();
    if (data.length === 0) return res.status(404).json({ error: 'Player not found' });

    res.json({ id: data[0].id });
  } catch (err) {
    console.error('Error resolving player ID:', err);
    res.status(500).json({ error: 'Failed to resolve player ID' });
  }
});

// Fetch match history
app.get('/api/player/:id/history', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await fetch(`https://omeda.city/players/${id}/matches.json?per_page=10`);
    if (!response.ok) throw new Error(`Failed to fetch matches: ${response.status}`);
    const matches = await response.json();

    res.json(matches);
  } catch (err) {
    console.error('Error in /api/player/:id/history:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
