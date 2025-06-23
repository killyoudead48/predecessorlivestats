const output = document.getElementById('output');
const ws = new WebSocket(`ws://${location.host}`);

ws.onmessage = event => {
  const data = JSON.parse(event.data);
  if (data.type === 'match') {
    const match = data.match;
    const html = `
      <div class="match-card">
        <h2>Match ID: ${match.id}</h2>
        <p>Game Mode: ${match.mode}</p>
        <p>Players: ${match.players.map(p => p.name).join(', ')}</p>
      </div>
    `;
    output.innerHTML = html + output.innerHTML;
    const form = document.getElementById('player-form');
const input = document.getElementById('player-id-input');
const output = document.getElementById('output');
const header = document.getElementById('player-header');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const playerId = input.value.trim();
  if (playerId) {
    localStorage.setItem('playerId', playerId);
    loadPlayerHistory(playerId);
  }
});

async function loadPlayerHistory(playerId) {
  header.textContent = `Stats for Player: ${playerId}`;
  output.innerHTML = 'Loading...';
  try {
    const res = await fetch(`/api/player/${playerId}/history`);
    const data = await res.json();

    if (!data.length) {
      output.innerHTML = '<p>No match history found.</p>';
      return;
    }

    output.innerHTML = data.map(match => `
      <div class="match-card">
        <p><strong>Match ID:</strong> ${match.id}</p>
        <p><strong>Date:</strong> ${new Date(match.started_at).toLocaleString()}</p>
        <p><strong>Duration:</strong> ${match.duration_minutes} mins</p>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
    output.innerHTML = '<p>Error loading data.</p>';
  }
}

// Auto-load if saved
const savedId = localStorage.getItem('playerId');
if (savedId) {
  input.value = savedId;
  loadPlayerHistory(savedId);
}
    const form = document.getElementById('player-form');
const input = document.getElementById('player-id-input');
const output = document.getElementById('player-output');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const playerId = input.value.trim();
  if (!playerId) return;

  output.innerHTML = 'Loading...';
  try {
    const res = await fetch(`/api/player/${playerId}/history`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      output.innerHTML = '<p>No match data found.</p>';
      return;
    }

    output.innerHTML = data.map(match => `
      <div class="match-card">
        <p><strong>Match ID:</strong> ${match.id}</p>
        <p><strong>Game Mode:</strong> ${match.game_mode}</p>
        <p><strong>Started At:</strong> ${new Date(match.started_at).toLocaleString()}</p>
        <p><strong>Duration:</strong> ${match.duration_minutes} min</p>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
    output.innerHTML = '<p>Error loading stats.</p>';
  }
});


  }
};
