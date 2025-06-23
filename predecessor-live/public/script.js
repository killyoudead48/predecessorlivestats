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
    const history = await res.json();

    if (!Array.isArray(history) || history.length === 0) {
      resultDiv.innerHTML = '<p>No match data found for this player.</p>';
      return;
    }

    renderStats(history);
    renderChart(history);
  } catch (err) {
    resultDiv.innerHTML = `<p>Error fetching stats. Please try again.</p>`;
    console.error(err);
  }
});

function renderStats(matches) {
  const html = matches.map(match => {
    const date = new Date(match.timestamp || match.created_at);
    const formattedDate = isNaN(date) ? 'Unknown date' : date.toLocaleString();
    const kills = match.kills ?? 0;
    const deaths = match.deaths ?? 1;
    const assists = match.assists ?? 0;
    const kda = ((kills + assists) / deaths).toFixed(2);
    const hero = match.heroName || 'Unknown Hero';
    const avatarUrl = match.avatar || '';

    return `
      <div class="match-card">
        <img src="${avatarUrl}" alt="${hero}" class="avatar" />
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
    const date = new Date(match.timestamp || match.created_at);
    return isNaN(date) ? `Match ${i + 1}` : date.toLocaleDateString();
  });

  const data = matches.map(match => {
    const kills = match.kills ?? 0;
    const deaths = match.deaths ?? 1;
    const assists = match.assists ?? 0;
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
