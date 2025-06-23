
import fetch from 'node-fetch';

export async function getPlayerMatchHistory(playerId, limit = 5) {
  const res = await fetch(`https://omeda.city/players/${playerId}/matches.json?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch player history');
  const data = await res.json();
  return data.matches;
}
