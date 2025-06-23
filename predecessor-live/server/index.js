import express from 'express';
import path from 'path';
import fetch from 'node-fetch';
import getPlayerMatchHistory from './playerHistory.js';

const app = express();
const PORT = process.env.PORT || 3000;

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/player/:id/history', async (req, res) => {
  const playerId = req.params.id;
  try {
    const matchData = await getPlayerMatchHistory(playerId);
    res.json(matchData);
  } catch (err) {
    console.error('Error in /api/player/:id/history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
