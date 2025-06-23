// ==== server/playerHistory.js ====
import fetch from 'node-fetch';

const HEROES_API = 'https://omeda.city/heroes.json';
const MATCH_HISTORY_API = 'https://omeda.city/players';

let heroMapCache = {};

async function getHeroMap() {
  if (Object.keys(heroMapCache).length > 0) return heroMapCache;
  const res = await fetch(HEROES_API);
  const data = await res.json();
  for (const hero of data) {
    heroMapCache[hero.id] = {
      name: hero.name,
      avatar: hero.portrait_icon || hero.icon || '',
    };
  }
  return heroMapCache;
}

export default async function getPlayerMatchHistory(playerId) {
  const res = await fetch(`${MATCH_HISTORY_API}/${playerId}/matches.json?per_page=10`);
  const matches = await res.json();
  if (!Array.isArray(matches)) throw new Error('Invalid match data');

  const heroMap = await getHeroMap();

  return matches.map(match => {
    const heroData = heroMap[match.hero_id] || { name: 'Unknown Hero', avatar: '' };
    return {
      ...match,
      heroName: heroData.name,
      avatar: heroData.avatar,
    };
  });
}
