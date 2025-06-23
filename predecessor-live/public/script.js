const form = document.getElementById('playerForm');
const input = document.getElementById('playerName');
const resultDiv = document.getElementById('results');
const chartCanvas = document.getElementById('kdaChart').getContext('2d');
let kdaChart = null;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const playerName = input.value.trim();
  if (!playerName) return;

  try {
    const idRes = await fetch(`/api/player-id/${playerName}`);
    const { id } = await idRes.json();

    const historyRes = await fetch(`/api/player/${id}/history`);
    const matches = await historyRes.json();

    renderStats(matches);
    renderChart(matches);
  } catch (err) {
    resultDiv.innerHTML = `<p>Error fetching stats. Please try again.</p>`;
    console.error(err);
  }
});

function renderStats(matches) {
  if (!Array.isArray(matches) || matches.length === 0) {
    resultDiv.innerHTML = `<p>No match data found.</p>`;
    return;
  }

  const html = matches.map(match => {
    const hero = match.hero_id || 'unknown';
    const heroName = hero.charAt(0).toUpperCase() + hero.slice(1);
    const imageUrl = `https://cdn.omeda.city/heroes/${hero}/icon.png`;

    const date = new Date(match.created_at);
    const kills = match.kills ?? 0;
    const deaths = match.deaths ?? 1;
    const assists = match.assists ?? 0;
    const kda = ((kills + assists) / deaths).toFixed(2);

    return `
      <div class="match-card">
        <img src="${imageUrl}" alt="${heroName}" class="avatar" />
        <div>
          <h3>${heroName}</h3>
          <p>Date: ${date.toLocaleString()}</p>
          <p>K/D/A: ${kills}/${deaths}/${assists}</p>
          <p>KDA: ${kda}</p>
        </div>
      </div>
    `;
  }).join('');

  resultDiv.innerHTML = html;
}

function renderChart(matches) {
  const labels = matches.map((m, i) => {
    const date = new Date(m.created_at);
    return isNaN(date) ? `Match ${i + 1}` : date.toLocaleDateString();
  });

  const data = matches.map(m => {
    const kills = m.kills ?? 0;
    const deaths = m.deaths ?? 1;
    const assists = m.assists ?? 0;
    return ((kills + assists) / deaths).toFixed(2);
  });

  if (kdaChart) kdaChart.destroy();

  kdaChart = new Chart(chartCanvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'KDA Over Time',
        data,
        borderColor: '#4bc0c0',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'KDA' }
        },
        x: {
          title: { display: true, text: 'Match Date' }
        }
      }
    }
  });
}

