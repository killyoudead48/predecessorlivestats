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

    try {
      const res = await fetch(`/api/player/${playerId}/history`);
      const matches = await res.json();

      if (!Array.isArray(matches) || matches.length === 0) {
        resultDiv.innerHTML = `<p>No match data found for this player.</p>`;
        return;
      }

      renderStats(matches);
      renderChart(matches);
    } catch (err) {
      resultDiv.innerHTML = `<p>Error fetching stats. Please try again.</p>`;
      console.error(err);
    }
  });

  function renderStats(matches) {
    resultDiv.innerHTML = matches.map(match => {
      const date = new Date(match.date);
      const formattedDate = isNaN(date) ? 'Unknown' : date.toLocaleString();
      const heroImage = `https://cdn.omeda.city/heroes/${match.heroName.toLowerCase()}.webp`;
      const kdaRatio = ((match.kills + match.assists) / Math.max(1, match.deaths)).toFixed(2);

      return `
        <div class="match-card">
          <img src="${heroImage}" alt="${match.heroName}" class="avatar" />
          <div>
            <h3>${match.heroName}</h3>
            <p>Date: ${formattedDate}</p>
            <p>K/D/A: ${match.kills}/${match.deaths}/${match.assists}</p>
            <p>KDA Ratio: ${kdaRatio}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderChart(matches) {
    const labels = matches.map((match, i) => {
      const date = new Date(match.date);
      return isNaN(date) ? `Match ${i + 1}` : date.toLocaleDateString();
    });

    const data = matches.map(match => ((match.kills + match.assists) / Math.max(1, match.deaths)).toFixed(2));

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
          tension: 0.3,
          fill: true
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
});
