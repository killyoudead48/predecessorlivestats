import fetch from 'node-fetch';

export default async function getPlayerMatchHistory(playerId) {
  const url = `https://backend.production.omeda-aws.com/api/public/get-matches-by-player/player_id/${playerId}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    const data = await res.json();

    if (!Array.isArray(data.matches)) {
      throw new Error('Unexpected response format');
    }

    return data.matches.map(m => ({
      matchId: m.id,
      heroName: m.hero_name || 'Unknown',
      kills: m.kills ?? 0,
      deaths: m.deaths ?? 0,
      assists: m.assists ?? 0,
      date: m.timestamp ? new Date(m.timestamp * 1000).toLocaleString() : 'Unknown'
    }));
  } catch (err) {
    console.error('Error fetching player match history:', err);
    throw err;
  }
}
