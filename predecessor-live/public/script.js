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
    if (!Array.isArray(matches)) throw new Error('Invalid data format');

    renderStats(matches);
    renderChart(matches);
  } catch (err) {
    resultDiv.innerHTML = `<p>Error fetching stats. Please try again.</p>`;
    console.error(err);
  }
});

function renderStats(matches) {
  if (matches.length === 0) {
    resultDiv.innerHTML = `<p>No match data found for this player.</p>`;
    return;
  }

  const html = matches.map(match => {
    const date = new Date(match.timestamp);
    const formattedDate = isNaN(date) ? 'Unknown date' : date.toLocaleString();

    const kills = match.kills;
    const deaths = match.deaths;
    const assists = match.assists;
    const kda = ((kills + assists) / deaths).toFixed(2);

    return `
      <div class="match-card">
        <img src="${match.hero_image}" alt="${match.hero}" class="avatar" onerror="this.onerror=null;this.src='fallback.png';" />
        <div>
          <h3>${match.hero}</h3>
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
  const labels = matches.map((m,i) => {
    const date = new Date(m.timestamp);
    return isNaN(date) ? `Match ${i+1}` : date.toLocaleDateString();
  });

  const data = matches.map(m => ((m.kills + m.assists) / m.deaths).toFixed(2));

  if (kdaChart) kdaChart.destroy();

  kdaChart = new Chart(chartCanvas, {
    type: 'line',
    data: { labels, datasets: [{ label:'KDA Over Time', data, borderColor:'#4bc0c0', backgroundColor:'rgba(75,192,192,0.2)', fill:true }] },
    options: { responsive:true, scales:{ y:{ beginAtZero:true, title:{display:true,text:'KDA'}} , x:{ title:{display:true,text:'Match Date'} } } }
  });
}

