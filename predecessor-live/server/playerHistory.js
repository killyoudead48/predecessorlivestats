import fetch from 'node-fetch';

const HERO_INFO_API = 'https://backend.production.omeda-aws.com/api/public/hero';

let heroCache = {};

async function fetchHeroDetails(heroCode) {
  if (heroCache[heroCode]) return heroCache[heroCode];

  const res = await fetch(`${HERO_INFO_API}/${heroCode}`);
  if (!res.ok) throw new Error(`Hero info not found for ${heroCode}`);
  const data = await res.json();

  heroCache[heroCode] = data;
  return data;
}

export async function getPlayerMatchHistory(playerId, limit = 10) {
  const url = `https://backend.production.omeda-aws.com/api/public/get-matches-by-player/${playerId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status} - ${await res.text()}`);

  const data = await res.json();
  const matches = data.matches?.slice(0, limit) || [];

  const enriched = await Promise.all(matches.map(async match => {
    const player = match.players.find(p => p.player_id === playerId);
    const heroInfo = player?.character ? await fetchHeroDetails(player.character) : null;

    return {
      hero: heroInfo?.display_name || player?.character || 'Unknown Hero',
      avatar: heroInfo?.icon_url || '',
      kills: player?.kills ?? 0,
      deaths: player?.deaths ?? 1,
      assists: player?.assists ?? 0,
      timestamp: match.started_at
    };
  }));

  return enriched;
}
