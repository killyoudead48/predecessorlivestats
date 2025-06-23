// server/playerHistory.js
import fetch from 'node-fetch';

export async function getPlayerMatchHistory(playerId) {
  const matchRes = await fetch(`https://api.prod.omeda.city/players/${playerId}/matches.json?per_page=10`);
  if (!matchRes.ok) {
    throw new Error(`Failed to fetch matches: ${matchRes.status}`);
  }
  const matchData = await matchRes.json();

  const heroRes = await fetch(`https://api.prod.omeda.city/heroes.json`);
  const heroData = await heroRes.json();
  const heroMap = {};
  heroData.forEach(h => {
    heroMap[h.id] = { name: h.name, image: h.portrait_icon_url };
  });

  const matches = matchData.map(match => {
    const heroId = match.hero_id;
    return {
      heroName: heroMap[heroId]?.name || 'Unknown Hero',
      heroImage: heroMap[heroId]?.image || '',
      kills: match.kills,
      deaths: match.deaths,
      assists: match.assists,
      timestamp: match.created_at
    };
  });

  return matches;
}
