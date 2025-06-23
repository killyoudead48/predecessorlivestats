import fetch from 'node-fetch';

export async function getPlayerMatchHistory(playerId) {
  const matchesUrl = `https://omeda.city/players/${playerId}/matches.json?per_page=5`;
  const heroesUrl = `https://omeda.city/heroes.json`;

  const [matchRes, heroesRes] = await Promise.all([
    fetch(matchesUrl),
    fetch(heroesUrl)
  ]);

  const matches = await matchRes.json();
  const heroes = await heroesRes.json();

  const heroMap = {};
  heroes.forEach(hero => {
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

