import fetch from 'node-fetch';

export default async function getPlayerMatchHistory(playerId) {
  const url = `https://backend.production.omeda-aws.com/api/public/get-matches-by-player/player_id/${playerId}?limit=10`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch match history: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data.matches || [];
  } catch (err) {
    console.error('Error fetching match history:', err);
    throw err;
  }
}
