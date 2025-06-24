import fetch from 'node-fetch';

export default async function getPlayerMatchHistory(playerId) {
  const url = `https://api.prod.omeda.city/v1/players/${playerId}/matches?limit=10`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch match history: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data.matches || []; // or just return data depending on API structure
  } catch (err) {
    console.error('Error fetching match history:', err);
    throw err;
  }
}
