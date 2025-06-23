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
    renderStats(history);
    renderChart(history);
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
    const date = new Date(match.timestamp || match.created_at || match.date);
    const formattedDate = isNaN(date) ? 'Unknown date' : date.toLocaleString();

    const hero = match.hero_name || match.hero || match.character || 'Unknown Hero';
    const heroSlug = hero.toLowerCase().replace(/\s+/g, '');
    const avatarUrl = `https://cdn.omeda.city/heroes/${heroSlug}.webp`; // Adjust to actual image CDN path

    const kills = Number(match.kills) || 0;
    const deaths = Number(match.deaths) || 0;
    const assists = Number(match.assists) || 0;
    const kda = deaths === 0 ? kills + assists : ((kills + assists) / deaths).toFixed(2);

    return `
      <div class="match-card">
        <img src="${avatarUrl}" alt="${hero}" class="avatar" onerror="this.src='https://cdn.omeda.city/heroes/default.webp'" />
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
    const date = new Date(match.timestamp || match.created_at || match.date);
    return isNaN(date) ? `Match ${i + 1}` : date.toLocaleDateString();
  });

  const data = matches.map(match => {
    const kills = Number(match.kills) || 0;
    const deaths = Number(match.deaths) || 0;
    const assists = Number(match.assists) || 0;
    const kda = deaths === 0 ? kills + assists : ((kills + assists) / deaths).toFixed(2);
    return kda;
  });

  if (kdaChart) kdaChart.destroy(); // Clear previous chart

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
