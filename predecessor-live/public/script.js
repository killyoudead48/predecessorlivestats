const form = document.getElementById('player-form');
const input = document.getElementById('player-input');
const resultDiv = document.getElementById('result');
const chartCanvas = document.getElementById('kda-chart');
let chartInstance = null;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const playerName = input.value.trim();
  if (!playerName) return;

  resultDiv.innerHTML = '🔍 Resolving player name...';
  if (chartInstance) chartInstance.destroy();

  try {
    // Step 1: Get player ID
    const resId = await fetch(`/api/player/${playerName}`);
    if (!resId.ok) {
      throw new Error(`Failed to resolve player name. Status: ${resId.status}`);
    }

    const data = await resId.json();
    const playerId = data.playerId;

    if (!playerId) {
      throw new Error('❌ Player ID not found in response. Try a different player name.');
    }

    // Step 2: Get matches
    resultDiv.innerHTML = '⏳ Fetching matches...';
    const resMatches = await fetch(`/api/player/${playerId}/matches`);
    if (!resMatches.ok) {
      throw new Error(`Failed to fetch matches. Status: ${resMatches.status}`);
    }

    const matches = await resMatches.json();
    if (!Array.isArray(matches) || matches.length === 0) {
      resultDiv.innerHTML = '⚠️ No match history found for this player.';
      return;
    }

    // Step 3: Fetch match details
    const detailedMatches = await Promise.all(
      matches.map(m => fetch(`/api/match/${m.id}`).then(r => r.json()))
    );

    // Step 4: Render data
    renderStats(detailedMatches);
    renderChart(detailedMatches);
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = `<p>❌ ${err.message}</p>`;
  }
});
