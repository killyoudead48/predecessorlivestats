import fetch from 'node-fetch';

export async function getPlayerMatchHistory(playerId, limit = 5) {
  const url = `https://omeda.city/players/${playerId}/matches.json?per_page=${limit}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    const data = await res.json();
    return data.matches || [];
  } catch (err) {
    console.error(`Error fetching player history:`, err);
    return [];
  }
}
