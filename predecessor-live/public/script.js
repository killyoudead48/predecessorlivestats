const form = document.getElementById('playerForm');
const input = document.getElementById('playerId');
const resultDiv = document.getElementById('results');
const chartCanvas = document.getElementById('kdaChart').getContext('2d');
let kdaChart;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const playerId = input.value.trim();
  if (!playerId) return;

  try {
    const res = await fetch(`/api/player/${playerId}/history`);
    const matches = await res.json();
    if (!Array.isArray(matches)) throw new Error('Invalid data');
    renderStats(matches);
    renderChart(matches);
  } catch (err) {
    resultDiv.innerHTML = `<p>Error fetching stats. Please try again.</p>`;
    console.error(err);
  }
});

function renderStats(matches) {
  if (!Array.isArray(matches) || matches.length === 0) {
    resultDiv.innerHTML = `<p>No match data found for this player.</p>`;
    return;
  }

  const html = matches.map(match => {
    const date = new Date(match.started_at);
    const formattedDate = isNaN(date) ? 'Unknown date' : date.toLocaleString();

    const hero = match.hero_codename || 'Unknown Hero';
    const avatarUrl = `https://cdn.omeda.city/heroes/${hero.toLowerCase()}.webp`;

    const stats = match.stats || {};
    const kills = stats.kills ?? 0;
    const deaths = stats.deaths || 1;
    const assists = stats.assists ?? 0;
    const kda = ((kills + assists) / deaths).toFixed(2);

    return `
      <div class="match-card">
        <img src="${avatarUrl}" alt="${hero}" class="avatar" onerror="this.src='/fallback.jpg'" />
        <div>
          <h3>${hero}</h3>
          <p>Date: ${formattedDate}</p>
          <p>K/D/A: ${kills}/${deaths}/${assists}</p>
          <p>KDA Ratio: ${kda}</p>
        </div>
      </div>
    `;
  }).join('');

  resultDiv.innerHTML = html;
}

function renderChart(matches) {
  const labels = matches.map((match, i) => {
    const date = new Date(match.started_at);
    return isNaN(date) ? `Match ${i + 1}` : date.toLocaleDateString();
  });

  const data = matches.map(match => {
    const stats = match.stats || {};
    const kills = stats.kills ?? 0;
    const deaths = stats.deaths || 1;
    const assists = stats.assists ?? 0;
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
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
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
