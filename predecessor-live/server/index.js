import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPlayerMatchHistory } from './playerHistory.js';

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/player/:id/history', async (req, res) => {
  try {
    const history = await getPlayerMatchHistory(req.params.id);
    res.json(history);
  } catch (err) {
    console.error("Error in /api/player/:id/history:", err);
    res.status(500).json({ error: 'Failed to fetch match history' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
