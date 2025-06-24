const form = document.getElementById('player-form');
const input = document.getElementById('player-name');
const resultDiv = document.getElementById('result');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const playerName = input.value.trim();
  if (!playerName) return;

  resultDiv.innerHTML = '🔍 Resolving player name...';

  try {
    // Resolve player name to ID
    const resId = await fetch(`/api/player/${playerName}`);
    const { playerId } = await resId.json();

    resultDiv.innerHTML = '⏳ Loading match history...';

    // Fetch match list
    const resMatches = await fetch(`/api/player/${playerId}/matches`);
    const matches = await resMatches.json();

    if (!Array.isArray(matches) || matches.length === 0) {
      resultDiv.innerHTML = '⚠️ No matches found.';
      return;
    }

    // Get detailed match data
    const detailedMatches = await Promise.all(
      matches.map(m => fetch(`/api/match/${m.id}`).then(r => r.json()))
    );

    resultDiv.innerHTML = detailedMatches.map((m, i) => `
      <div class="match">
        <strong>Match ${i + 1}</strong><br>
        Game Mode: ${m.game_mode} <br>
        Hero ID: ${m.players[0]?.hero_id} <br>
        Kills: ${m.players[0]?.stats.kills} | Deaths: ${m.players[0]?.stats.deaths} | Assists: ${m.players[0]?.stats.assists}
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = `❌ Error: ${err.message}`;
  }
});
