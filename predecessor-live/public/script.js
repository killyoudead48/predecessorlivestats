document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('playerForm');
  const input = document.getElementById('playerId');
  const resultDiv = document.getElementById('results');
  const chartCanvas = document.getElementById('kdaChart').getContext('2d');
  let kdaChart;

  if (!form || !input || !resultDiv || !chartCanvas) {
    console.error("One or more required elements were not found.");
    return;
  }

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
    const statsHtml = matches.map(match => `
      <div class="match">
        <img src="${match.heroImage}" alt="${match.heroName}" class="hero-img">
        <p><strong>${match.heroName}</strong></p>
        <p>KDA: ${match.kills}/${match.deaths}/${match.assists}</p>
      </div>
    `).join('');
    resultDiv.innerHTML = statsHtml;
  }

  function renderChart(matches) {
    const labels = matches.map((_, index) => `Match ${index + 1}`);
    const kdaData = matches.map(match => (match.kills + match.assists) / (match.deaths || 1));

    if (kdaChart) {
      kdaChart.destroy();
    }

    kdaChart = new Chart(chartCanvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'KDA Ratio',
          data: kdaData,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.4
        }]
      }
    });
  }
});
