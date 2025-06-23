import fetch from 'node-fetch';

export async function getPlayerMatchHistory(playerId, limit = 5) {
  const url = `https://omeda.city/players/${playerId}/matches.json?limit=${limit}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch player history');
  }
  return await response.json();
}
