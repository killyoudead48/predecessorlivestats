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
app.use(cors());
app.use(express.static('public'));
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
let clients = [];
wss.on('connection', ws => { clients.push(ws); ws.on('close', () => clients = clients.filter(c=>c!==ws)); });

function broadcast(data) {
  clients.forEach(ws => ws.readyState===1 && ws.send(JSON.stringify(data)));
}

let cursor = null;
const PER_PAGE = 10;

async function pollMatches() {
  while (true) {
    let url = `https://omeda.city/matches.json?per_page=${PER_PAGE}`;
    if (cursor) url += `&cursor=${cursor}`;

    try {
      const res = await fetch(url);
      const body = await res.json();
      cursor = body.cursor;
      for (const m of body.matches) {
        const matchRes = await fetch(`https://omeda.city/matches/${m.id}.json`);
        const full = await matchRes.json();
        broadcast({ type: 'match', match: full });
      }
    } catch (err) {
      console.error('Fetch failed:', err);
    }
    await new Promise(r=>setTimeout(r, 5000));
  }
}
pollMatches();

app.get('/api/player/:id/history', async (req, res) => {
  try{
    const data = await getPlayerMatchHistory (req.params.id, 5)
    res.json(data);
  } catch (err){
    console.error(err);
    res.status(500).json({ error: 'failed to fetch player history' });
  const history = await getPlayerMatchHistory(req.params.id, 5);
  res.json(history);
};

app.use(express.static(path.join(__dirname, '../public')));

const PORT = process.env.PORT||3000;
server.listen(PORT, ()=>console.log(`Listening on ${PORT}`));
