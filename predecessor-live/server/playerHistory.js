// server/playerHistory.js
import fetch from 'node-fetch';

/**
 * Fetches the recent match history for a player by player ID.
 * @param {string} playerId - The UUID of the player.
 * @returns {Promise<Array>} - Returns an array of match objects.
 */
export default async function getPlayerMatchHistory(playerId) {
  const url = `https://omeda.city/players/${playerId}/matches.json?per_page=10`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Error fetching player matches: ${response.statusText}`);
      return [];
    }

    const matchData = await response.json();

    // Optional: simplify data or filter fields as needed
    return Array.isArray(matchData) ? matchData : [];
  } catch (error) {
    console.error('Failed to fetch player match history:', error.message);
    return [];
  }
}

