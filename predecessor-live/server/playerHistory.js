import fetch from 'node-fetch';

export async function getPlayerMatchHistory(playerId) {
  const matchesUrl = `https://omeda.city/players/${playerId}/matches.json?per_page=5`;
  const heroesUrl = `https://omeda.city/heroes.json`;

  const [matchRes, heroesRes] = await Promise.all([
    fetch(matchesUrl),
    fetch(heroesUrl)
  ]);

  if (!matchRes.ok) {
    throw new Error(`Failed to fetch matches: ${matchRes.status}`);
  }
  if (!heroesRes.ok) {
    throw new Error(`Failed to fetch heroes: ${heroesRes.status}`);
  }

  const matchJson = await matchRes.json();
  const heroJson = await heroesRes.json();

  // Defensive check: ensure matches is an array
  const matches = Array.isArray(matchJson) ? matchJson : matchJson.data ?? [];

  if (!Array.isArray(matches)) {
    console.error('Unexpected match data structure:', matchJson);
    throw new Error('Invalid match data received from API');
  }

  const heroMap = {};
  heroJson.forEach(hero => {
    heroMap[hero.id] = {
      name: hero.name,
      image: hero.image_portrait
    };
  });

  return matches.map(match => {
    const hero = heroMap[match.hero_id] || { name: 'Unknown Hero', image: '' };
    return {
      date: match.started,
      kills: match.kills,
      deaths: match.deaths,
      assists: match.assists,
      heroName: hero.name,
      heroImage: hero.image
    };
  });
}
