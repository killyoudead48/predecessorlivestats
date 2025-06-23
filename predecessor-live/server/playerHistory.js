// server/playerHistory.js
import fetch from 'node-fetch';

export async function getPlayerMatchHistory(playerId) {
  try {
    // ✅ Corrected API domain
    const matchesRes = await fetch(`https://api.prod.thepredecessor.com/v1/matches/get-matches-by-player?player_id=${playerId}&limit=10`);

    if (!matchesRes.ok) {
      throw new Error(`Failed to fetch matches: ${matchesRes.status}`);
    }

    const matchData = await matchesRes.json();
    const matches = matchData.data;

    // Fetch hero list once
    const heroesRes = await fetch('https://api.prod.thepredecessor.com/v1/heroes/list');
    if (!heroesRes.ok) {
      throw new Error('Failed to fetch hero list');
    }
    const heroData = await heroesRes.json();
    const heroMap = new Map(heroData.data.map(h => [h.hero_id, h]));

    // Format match data
    const formatted = matches.map(match => {
      const player = match.teams.flatMap(team => team.players)
        .find(p => p.player_id === playerId);

      const hero = heroMap.get(player.hero_id);
      const kda = `${player.kills}/${player.deaths}/${player.assists}`;
      const result = player.winner ? 'Win' : 'Loss';

      return {
        matchId: match.match_id,
        heroName: hero?.name || 'Unknown',
        heroImage: hero?.icon_url || '',
        kills: player.kills,
        deaths: player.deaths,
        assists: player.assists,
        kda,
        result,
        date: new Date(match.started_at).toLocaleString(),
      };
    });

    return formatted;
  } catch (error) {
    console.error('Error fetching player match history:', error);
    throw error;
  }
}

