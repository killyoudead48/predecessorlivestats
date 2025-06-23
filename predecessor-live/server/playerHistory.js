// server/playerHistory.js
import fetch from 'node-fetch';

export default async function getPlayerMatchHistory(playerId) {
  const url = `https://api.prod.omeda.city/v1/matches/get-matches-by-player?player_id=${playerId}&limit=10`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`API response not ok: ${res.status}`);
    }
    const data = await res.json();
    return data.matches || [];
  } catch (err) {
    console.error('Error fetching match history:', err);
    throw err;
  }
}
