const form = document.getElementById('player-form');
const input = document.getElementById('player-input');
const resultDiv = document.getElementById('result');
const chartCanvas = document.getElementById('kda-chart');
let chartInstance = null;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const playerName = input.value.trim();
  if (!playerName) return;

  resultDiv.innerHTML = '🔍 Fetching data...';
  if (chartInstance) {
    chartInstance.destroy();
  }

  try {
    const idRes = await fetch(`/api/player/${playerName}`);
    if (!idRes.ok) throw new Error(`Player lookup failed: ${idRes.status}`);
    const { playerId } = await idRes.json();

    const matchesRes = await fetch(`/api/player/${playerId}/history`);
    if (!matchesRes.ok) throw new Error(`Match fetch failed: ${matchesRes.status}`);
    const matches = await matchesRes.json();

    if (!Array.isArray(matches) || matches.length === 0) {
      resultDiv.innerHTML = `<p>No match data found for this player.</p>`;
      return;
    }

    renderStats(matches);
    renderChart(matches);
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = `<p>❌ Error: ${err.message}</p>`;
  }
});

function renderStats(matches) {
  resultDiv.innerHTML = matches.map((match, i) => {
    const stats = match.stats;
    return `
      <div class="match">
        <strong>Match ${i + 1}</strong><br>
        Hero ID: ${match.hero_id} <br>
        Kills: ${stats.kills} | Deaths: ${stats.deaths} | Assists: ${stats.assists}
      </div>
    `;
  }).join('');
}

function renderChart(matches) {
  const labels = matches.map((_, i) => `Match ${i + 1}`);
  const kills = matches.map(m => m.stats.kills);
  const deaths = matches.map(m => m.stats.deaths);
  const assists = matches.map(m => m.stats.assists);

  chartInstance = new Chart(chartCanvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Kills',
          data: kills,
          borderColor: 'green',
          fill: false
        },
        {
          label: 'Deaths',
          data: deaths,
          borderColor: 'red',
          fill: false
        },
        {
          label: 'Assists',
          data: assists,
          borderColor: 'blue',
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#fff' } }
      },
      scales: {
        x: { ticks: { color: '#ccc' } },
        y: { ticks: { color: '#ccc' } }
      }
    }
  });
}
