
async function searchPlayer() {
  const id = document.getElementById('playerId').value;
  const res = await fetch(`/api/player/${id}/history`);
  const data = await res.json();
  const matches = document.getElementById('matches');
  matches.innerHTML = '<h2 class="text-xl font-semibold">Recent Matches:</h2>';
  data.forEach(m => {
    matches.innerHTML += `
      <div class="bg-gray-800 p-4 rounded">
        <p><strong>Match ID:</strong> ${m.id}</p>
        <p><strong>Date:</strong> ${new Date(m.started_at).toLocaleString()}</p>
        <p><strong>Result:</strong> ${m.outcome}</p>
      </div>
    `;
  });
}
