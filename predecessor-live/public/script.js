const ul = document.getElementById('matches');
const ws = new WebSocket(`ws://${location.host}`);

ws.onmessage = e => {
  const { type, match } = JSON.parse(e.data);
  if (type === 'match') renderMatch(match);
};

function renderMatch(m) {
  const li = document.createElement('li');
  const team1 = m.teams?.[0]?.score ?? 0;
  const team2 = m.teams?.[1]?.score ?? 0;

  li.innerHTML = \`
    <details>
      <summary><strong>\${m.mode}</strong> | Duration: \${Math.round(m.duration)}s | Score: \${team1}-\${team2}</summary>
      <ul>
        \${m.players.map(p => \`
          <li>
            \${p.playerName || 'Anonymous'} (\${p.heroName}) - KDA: \${p.kills}/\${p.deaths}/\${p.assists}
          </li>
        \`).join('')}
      </ul>
    </details>
  \`;

  ul.prepend(li);
  if (ul.children.length > 20) ul.removeChild(ul.lastChild);
}