// playerHistory.js
import fetch from 'node-fetch';

export async function getPlayerMatchHistory(playerId, limit = 10) {
  try {
    const matchUrl = `https://backend.production.omeda-aws.com/api/public/get-matches-by-player/player_id/${playerId}`;
    const matchRes = await fetch(matchUrl);
    const matchData = await matchRes.json();

    const heroDataRes = await fetch(`https://backend.production.omeda-aws.com/api/public/hero/all`);
    const heroData = await heroDataRes.json();
    const heroMap = {};
    for (const hero of heroData) {
      heroMap[hero.Codename] = hero;
    }

    const matches = matchData.matches.slice(0, limit).map(match => {
      const player = match.teams.flatMap(t => t.players).find(p => p.player_id === playerId);
      const codename = player.character;
      const hero = heroMap[codename] || {};

      return {
        date: match.created_at,
        heroName: hero.DisplayName || codename || 'Unknown',
        heroImage: hero.PortraitImageURL || '',
        kills: player.kills,
        deaths: player.deaths,
        assists: player.assists,
      };
    });

    return matches;
  } catch (error) {
    console.error('Error fetching player match history:', error);
    throw error;
  }
}
