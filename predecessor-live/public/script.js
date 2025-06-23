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
  }
};
