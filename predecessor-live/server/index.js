// server/index.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPlayerMatchHistory } from './playerHistory.js';

const app = express();
const port = process.env.PORT || 3000;

// Setup for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend from public folder
app.use(express.static(path.join(__dirname, '../public')));

// Root route - serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API route for player match history
app.get('/api/player/:id/history', async (req, res) => {
  try {
    const playerId = req.params.id;
    const matchHistory = await getPlayerMatchHistory(playerId);
    res.json(matchHistory);
  } catch (error) {
    console.error("Error in /api/player/:id/history:", error);
    res.status(500).json({ error: 'Failed to fetch player history' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
