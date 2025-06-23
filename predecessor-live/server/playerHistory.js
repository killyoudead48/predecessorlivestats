import fetch from 'node-fetch';

const BASE_URL = 'https://api.prod.omeda.city/v1';

export async function getPlayerMatchHistory(playerId) {
  try {
    // Step 1: Get list of match IDs for the player
    const matchRes = await fetch(`${BASE_URL}/matches/get-matches-by-player?player_id=${playerId}&limit=10`);
    if (!matchRes.ok) throw new Error(`Failed to fetch matches: ${matchRes.status}`);
    const matchData = await matchRes.json();

    const matches = matchData.matches;
    if (!Array.isArray(matches)) throw new Error('Invalid match list');

    // Step 2: Get full match details for each match
    const matchDetails = await Promise.all(
      matches.map(async (match) => {
        const res = await fetch(`${BASE_URL}/matches/get?id=${match.match_id}`);
        if (!res.ok) throw new Error(`Failed to fetch match details for ${match.match_id}`);
        return res.json();
      })
    );

    // Step 3: Get hero metadata (names, images)
    const heroRes = await fetch(`${BASE_URL}/heroes/list`);
    const heroData = await heroRes.json();
    const heroMap = {};
    heroData.heroes.forEach(hero => {
      heroMap[hero.id] = {
        name: hero.name,
        image: hero.image_url
      };
    });

    // Step 4: Extract and format relevant player stats per match
    const playerMatches = matchDetails.map((match) => {
      const playerStats = match.match.teams
        .flatMap(team => team.players)
        .find(p => p.player_id === playerId);

      const hero = heroMap[playerStats.hero_id] || { name: 'Unknown', image: '' };

      return {
        matchId: match.match.id,
        heroId: playerStats.hero_id,
        heroName: hero.name,
        heroImage: hero.image,
        kills: playerStats.kills,
        deaths: playerStats.deaths,
        assists: playerStats.assists
      };
    });

    return playerMatches;
  } catch (err) {
    console.error('getPlayerMatchHistory error:', err);
    throw err;
  }
}
