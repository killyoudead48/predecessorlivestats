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
    renderStats(history, playerId);
    renderChart(history, playerId);
  } catch (err) {
    resultDiv.innerHTML = `<p>Error fetching stats. Please try again.</p>`;
    console.error(err);
  }
});

function renderStats(matches, playerId) {
  if (!Array.isArray(matches) || matches.length === 0) {
    resultDiv.innerHTML = `<p>No match data found for this player.</p>`;
    return;
  }

  const html = matches.map(match => {
    const date = new Date(match.timestamp || match.created_at || match.date);
    const formattedDate = isNaN(date) ? 'Unknown date' : date.toLocaleString();

    const player = match.players.find(p => p.player_id === playerId);
    if (!player) return '<p>Match data missing for player.</p>';

    const hero = player.hero || player.character || 'Unknown';
    const heroSlug = hero.toLowerCase().replace(/\s+/g, '-');
    const avatarUrl = `https://cdn.omeda.city/heroes/${heroSlug}.webp`;

    const kills = player.kills ?? 0;
    const deaths = player.deaths ?? 1; // Prevent divide by 0
    const assists = player.assists ?? 0;
    const kda = ((kills + assists) / deaths).toFixed(2);

    return `
      <div class="match-card">
        <img src="${avatarUrl}" alt="${hero}" class="avatar" onerror="this.onerror=null;this.src='fallback.png';" />
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

function renderChart(matches, playerId) {
  const labels = [];
  const data = [];

  matches.forEach((match, i) => {
    const date = new Date(match.timestamp || match.created_at || match.date);
    labels.push(isNaN(date) ? `Match ${i + 1}` : date.toLocaleDateString());

    const player = match.players.find(p => p.player_id === playerId);
    if (player) {
      const kills = player.kills ?? 0;
      const deaths = player.deaths ?? 1;
      const assists = player.assists ?? 0;
      data.push(((kills + assists) / deaths).toFixed(2));
    } else {
      data.push(null);
    }
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
