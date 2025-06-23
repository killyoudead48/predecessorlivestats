import fetch from 'node-fetch';

export default async function getPlayerMatchHistory(playerId) {
  const url = `https://api.prod.omeda.city/v1/matches/get-matches-by-player?player_id=${playerId}&limit=10`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch matches for player ${playerId}`);
  }
  const data = await response.json();
  return data.matches.map(match => ({
    matchId: match.id,
    heroName: match.hero_name || 'Unknown',
    kills: match.kills || 0,
    deaths: match.deaths || 0,
    assists: match.assists || 0,
  }));
}
