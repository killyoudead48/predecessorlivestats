// Wait until DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('player-form');
  const input = document.getElementById('player-input');
  const resultDiv = document.getElementById('result');
  const chartCanvas = document.getElementById('kda-chart');
  let chartInstance = null;

  if (!form || !input || !resultDiv || !chartCanvas) {
    console.error("One or more DOM elements not found!");
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const playerName = input.value.trim();
    if (!playerName) return;

    resultDiv.innerHTML = '🔍 Resolving player name...';
    if (chartInstance) chartInstance.destroy();

    try {
      const resId = await fetch(`/api/player/${playerName}`);
      if (!resId.ok) {
        resultDiv.innerHTML = '⚠️ Error fetching player ID.';
        console.error('Error fetching player ID:', resId.status, resId.statusText);
        return;
      }

      const data = await resId.json();
      const playerId = data.playerId;

      if (!playerId) {
        resultDiv.innerHTML = '⚠️ Player not found.';
        console.error('Player ID missing in response:', data);
        return;
      }

      resultDiv.innerHTML = '⏳ Loading match history...';

      const resMatches = await fetch(`/api/player/${playerId}/matches`);
      if (!resMatches.ok) {
        resultDiv.innerHTML = '⚠️ Could not fetch matches.';
        console.error('Match fetch error:', resMatches.statusText);
        return;
      }

      const matches = await resMatches.json();
      if (!Array.isArray(matches) || matches.length === 0) {
        resultDiv.innerHTML = '⚠️ No matches found.';
        return;
      }

      const detailedMatches = await Promise.all(
        matches.map(m => fetch(`/api/match/${m.id}`).then(r => r.json()))
      );

      renderStats(detailedMatches);
      renderChart(detailedMatches);
    } catch (err) {
      console.error('Error in script:', err);
      resultDiv.innerHTML = `<p>❌ ${err.message}</p>`;
    }
  });

  function renderStats(matches) {
    resultDiv.innerHTML = matches.map((match, i) => {
      const stats = match.stats || {};
      return `
        <div class="match">
          <strong>Match ${i + 1}</strong><br>
          Hero ID: ${match.hero_id}<br>
          Kills: ${stats.kills || 0} | Deaths: ${stats.deaths || 0} | Assists: ${stats.assists || 0}
        </div>
      `;
    }).join('');
  }

  function renderChart(matches) {
    const labels = matches.map((_, i) => `Match ${i + 1}`);
    const kills = matches.map(m => m.stats?.kills || 0);
    const deaths = matches.map(m => m.stats?.deaths || 0);
    const assists = matches.map(m => m.stats?.assists || 0);

    chartInstance = new Chart(chartCanvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Kills', data: kills, borderColor: 'green', fill: false },
          { label: 'Deaths', data: deaths, borderColor: 'red', fill: false },
          { label: 'Assists', data: assists, borderColor: 'blue', fill: false }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#fff' } } },
        scales: {
          x: { ticks: { color: '#ccc' } },
          y: { ticks: { color: '#ccc' } }
        }
      }
    });
  }
});
