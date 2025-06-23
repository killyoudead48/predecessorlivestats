// === backend/index.js ===
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import getPlayerMatchHistory from './playerHistory.js';
import dns from 'dns/promises';

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../frontend')));

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Player history API
app.get('/api/player/:id/history', async (req, res) => {
  try {
    const hostname = 'api.prod.omeda.city';
    const result = await dns.lookup(hostname);
    console.log(`✅ DNS lookup succeeded: ${result.address}`);

    const playerId = req.params.id;
    const matchHistory = await getPlayerMatchHistory(playerId);
    res.json(matchHistory);
  } catch (error) {
    console.error('Error in /api/player/:id/history:', error);
    res.status(500).json({ error: 'Failed to fetch player history' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});


// === backend/playerHistory.js ===
import fetch from 'node-fetch';

export default async function getPlayerMatchHistory(playerId) {
  const url = `https://api.prod.omeda.city/v1/matches/get-matches-by-player?player_id=${playerId}&limit=10`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch matches: ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data.matches)) {
    throw new Error('Invalid match data format');
  }

  return data.matches.map(match => ({
    matchId: match.id,
    hero: match.hero_id,
    kills: match.kills,
    deaths: match.deaths,
    assists: match.assists,
  }));
}


// === frontend/index.html ===
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Predecessor Stats</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>Predecessor Match History</h1>
    <form id="playerForm">
      <input type="text" id="playerId" placeholder="Enter Player ID" required>
      <button type="submit">Get Stats</button>
    </form>
    <div id="results"></div>
    <canvas id="kdaChart" width="400" height="200"></canvas>
  </div>
  <script src="script.js"></script>
</body>
</html>


// === frontend/styles.css ===
body {
  font-family: Arial, sans-serif;
  padding: 20px;
  background-color: #f4f4f4;
}
.container {
  max-width: 600px;
  margin: auto;
  background: white;
  padding: 20px;
  border-radius: 10px;
}
input, button {
  padding: 10px;
  margin: 10px 0;
  width: 100%;
}
#results {
  margin-top: 20px;
}


// === frontend/script.js ===
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('playerForm');
  const input = document.getElementById('playerId');
  const resultDiv = document.getElementById('results');
  const chartCanvas = document.getElementById('kdaChart').getContext('2d');
  let kdaChart;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const playerId = input.value.trim();
    if (!playerId) return;

    resultDiv.innerHTML = '<p>Loading...</p>';
    try {
      const res = await fetch(`/api/player/${playerId}/history`);
      const matches = await res.json();

      if (!Array.isArray(matches)) {
        resultDiv.innerHTML = '<p>No data found.</p>';
        return;
      }

      resultDiv.innerHTML = matches.map(m => `
        <div class="match">
          <p><strong>Match ID:</strong> ${m.matchId}</p>
          <p><strong>Hero:</strong> ${m.hero}</p>
          <p><strong>K/D/A:</strong> ${m.kills}/${m.deaths}/${m.assists}</p>
        </div>
      `).join('');

      const labels = matches.map(m => m.matchId);
      const kdaData = matches.map(m => (m.kills + m.assists) / Math.max(1, m.deaths));

      if (kdaChart) kdaChart.destroy();
      kdaChart = new Chart(chartCanvas, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'KDA Ratio',
            data: kdaData,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    } catch (err) {
      resultDiv.innerHTML = '<p>Error fetching data.</p>';
      console.error(err);
    }
  });
});
