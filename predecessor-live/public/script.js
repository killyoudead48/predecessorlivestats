const form = document.getElementById('playerForm');
const input = document.getElementById('playerId');
const resultDiv = document.getElementById('results');
const chartCanvas = document.getElementById('kdaChart').getContext('2d');
let kdaChart;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const playerName = input.value.trim();
  if (!playerName) return;

  resultDiv.innerHTML = `<p>Loading data...</p>`;

  try {
    const idRes = await fetch(`/api/player/name/${playerName}`);
    const idData = await idRes.json();

    if (!idData || !idData.id) {
      resultDiv.innerHTML = `<p>Player not found.</p>`;
      return;
    }

    const playerId = idData.id;

    const historyRes = await fetch(`/api/player/${playerId}/history`);
    const matches = await historyRes.json();

    if (!Array.isArray(matches) || matches.length === 0) {
      resultDiv.innerHTML = `<p>No match data found for this player.</p>`;
      return;
    }

    renderStats(matches);
    renderChart(matches);
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = `<p>Error fetching stats. Please try again later.</p>`;
  }
});

function renderStats(matches) {
  const html = matches.map(match => {
    const date = new Date(match.timestamp || match.created_at);
    const formattedDate = isNaN(date) ? 'Unknown date' : date.toLocaleString();

    const heroName = match.heroName || 'Unknown Hero';
    const heroImage = match.heroImage || '/images/placeholder.png'; // fallback image

    const kills = match.kills ?? 0;
    const deaths = match.deaths ?? 1; // Avoid division by zero
    const assists = match.assists ?? 0;
    const kda = ((kills + assists) / deaths).toFixed(2);

    return `
      <div class="match-card">
        <img src="${heroImage}" alt="${heroName}" class="avatar" />
        <div>
          <h3>${heroName}</h3>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>K/D/A:</strong> ${kills}/${deaths}/${assists}</p>
          <p><strong>KDA Ratio:</strong> ${kda}</p>
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
