import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import fetch from 'node-fetch';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPlayerMatchHistory } from './playerHistory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

let clients = [];
wss.on('connection', (ws) => {
  clients.push(ws);
  ws.on('close', () => {
    clients = clients.filter((c) => c !== ws);
  });
});

function broadcast(data) {
  clients.forEach((ws) => {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify(data));
    }
  });
}

let cursor = null;
const PER_PAGE = 10;

async function pollMatches() {
  while (true) {
    let url = `https://omeda.city/matches.json?per_page=${PER_PAGE}`;
    if (cursor) {
      url += `&cursor=${cursor}`;
    }

    try {
      const res = await fetch(url);
      const body = await res.json();
      cursor = body.cursor;

      for (const match of body.matches) {
        const matchRes = await fetch(`https://omeda.city/matches/${match.id}.json`);
        const fullMatch = await matchRes.json();
        broadcast({ type: 'match', match: fullMatch });
      }
    } catch (err) {
      console.error('Error fetching live matches:', err);
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}
pollMatches();

// ✅ GET player match history
app.get('/api/player/:id/history', async (req, res) => {
  try {
    const matches = await getPlayerMatchHistory(req.params.id, 10);
    res.json(matches);
  } catch (err) {
    console.error('Error in /api/player/:id/history:', err);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`✅ Server listening on port ${PORT}`));
