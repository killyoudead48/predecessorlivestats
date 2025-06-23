import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws'; // ✅ FIXED
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });


let clients = [];

wss.on('connection', ws => {
  clients.push(ws);
  ws.on('close', () => {
    clients = clients.filter(c => c !== ws);
  });
});

function broadcast(data) {
  clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  });
}

let lastEpoch = Math.floor(Date.now() / 1000) - 60;

async function fetchMatchDetails(matchId) {
  const url = `https://backend.production.omeda-aws.com/api/public/get-match/${matchId}/`;
  const res = await fetch(url);
  return res.json();
}

async function pollMatches() {
  while (true) {
    const url = `https://backend.production.omeda-aws.com/api/public/get-matches-since/${lastEpoch}/`;
    try {
      const res = await fetch(url);
      const matches = await res.json();

      if (matches.length) {
        lastEpoch = matches[matches.length - 1].endTime;
        for (const match of matches) {
          const fullMatch = await fetchMatchDetails(match.matchId);
          broadcast({ type: 'match', match: fullMatch });
        }
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
    }
    await new Promise(r => setTimeout(r, 5000));
  }
}

pollMatches();

app.use(express.static(path.join(__dirname, '../public')));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
