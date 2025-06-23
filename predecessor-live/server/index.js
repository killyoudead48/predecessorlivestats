// server/index.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import getPlayerMatchHistory from './playerHistory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../public')));

// API route to get match history
app.get('/api/player/:id/history', async (req, res) => {
  const playerId = req.params.id;

  try {
    const matchHistory = await getPlayerMatchHistory(playerId);
    res.json(matchHistory);
  } catch (err) {
    console.error('Error in /api/player/:id/history:', err);
    res.status(500).json({ error: 'Failed to fetch player history' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
