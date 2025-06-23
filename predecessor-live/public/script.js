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
        resultDiv.innerHTML = '<p>No match data found for this player.</p>';
        return;
      }

      renderStats(matches);
      renderChart(matches);
    } catch (err) {
      resultDiv.innerHTML = '<p>Error fetching stats. Please try again.</p>';
      console.error(err);
    }
  });

  function renderStats(matches) {
    resultDiv.innerHTML = matches.map(match => `
      <div class="match">
        <h3>Match ID: ${match.matchId}</h3>
        <p>Hero: ${match.heroName}</p>
        <p>Kills: ${match.kills}, Deaths: ${match.deaths}, Assists: ${match.assists}</p>
      </div>
    `).join('');
  }

  function renderChart(matches) {
    const labels = matches.map((_, i) => `Match ${i + 1}`);
    const kdaData = matches.map(m => ((m.kills + m.assists) / Math.max(m.deaths, 1)).toFixed(2));

    if (kdaChart) kdaChart.destroy();

    kdaChart = new Chart(chartCanvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'KDA Ratio',
          data: kdaData,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
