import fetch from 'node-fetch';

export async function getPlayerMatchHistory(playerId, limit = 10) {
  try {
    const url = `https://omeda.city/players/${playerId}/matches.json?per_page=${limit}`;
    console.log('Fetching match history from:', url);

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);

    const data = await response.json();
    if (!Array.isArray(data)) {
      console.error('Unexpected data format:', data);
      return [];
    }

    // Normalize data to match frontend expectations
    return data.map(match => {
      const stats = match.stats || {};
      return {
        timestamp: match.created_at,
        hero: match.character || 'Unknown Hero',
        hero_image: `https://omeda.city/heroes/${match.character?.toLowerCase()}.png`,
        kills: stats.kills ?? 0,
        deaths: stats.deaths ?? 1,
        assists: stats.assists ?? 0
      };
    });
  } catch (err) {
    console.error('Error fetching player history:', err);
    return [];
  }
}
