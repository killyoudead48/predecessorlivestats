const form = document.getElementById('player-form');
const input = document.getElementById('player-name');
const resultDiv = document.getElementById('result');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const playerName = input.value.trim();
  if (!playerName) {
    resultDiv.innerHTML = '⚠️ Please enter a player name.';
    return;
  }

  resultDiv.innerHTML = '🔍 Resolving player name...';

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
      resultDiv.innerHTML = '⚠️ Could not find player ID for the given name.';
      console.error('Player ID not found in response:', data);
      return;
    }

    resultDiv.innerHTML = '⏳ Loading match history...';

    const resMatches = await fetch(`/api/player/${playerId}/matches`);
    if (!resMatches.ok) {
      resultDiv.innerHTML = '⚠️ Error fetching match history.';
      console.error('Error fetching matches:', resMatches.status, resMatches.statusText);
      return;
    }

    const matches = await resMatches.json();

    if (!Array.isArray(matches) || matches.length === 0) {
      resultDiv.innerHTML = '⚠️ No matches found.';
      return;
    }

    // Fetch match details in parallel
    const detailedMatches = await Promise.all(
      matches.map(m => fetch(`/api/match/${m.id}`).then(r => r.json()))
    );

    // Render each match
    resultDiv.innerHTML = detailedMatches.map((m, i) => `
      <div class="match">
        <strong>Match ${i + 1}</strong><br>
        Game Mode: ${m.game_mode || 'Unknown'}<br>
        Hero ID: ${m.players?.[0]?.hero_id || 'N/A'}<br>
        Kills: ${m.players?.[0]?.stats?.kills ?? 0} |
        Deaths: ${m.players?.[0]?.stats?.deaths ?? 0} |
        Assists: ${m.players?.[0]?.stats?.assists ?? 0}
      </div>
    `).join('');
  } catch (err) {
    console.error('Unhandled error:', err);
    resultDiv.innerHTML = `❌ Unexpected error: ${err.message}`;
  }
});
