import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import { getPlayerMatchHistory } from './playerHistory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/player/:id/history', async (req, res) => {
  try {
    const playerId = req.params.id;
    const matchHistory = await getPlayerMatchHistory(playerId);
    res.json(matchHistory);
  } catch (err) {
    console.error('Error in /api/player/:id/history:', err);
    res.status(500).json({ error: 'Failed to fetch match history' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

