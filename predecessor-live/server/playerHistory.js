// =====================
// server/playerHistory.js
// =====================

import fetch from 'node-fetch';

export async function getPlayerMatchHistory(playerId, limit = 10) {
  try {
    const url = `https://backend.production.omeda-aws.com/api/public/get-matches-by-player/${playerId}/`;
    console.log('Fetching:', url);

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status} - ${await res.text()}`);
    }

    const data = await res.json();
    console.log('Response:', data);

    const matches = data.matches || data || [];
    if (!Array.isArray(matches)) throw new Error('Invalid matches data');

    return matches.slice(0, limit);
  } catch (err) {
    console.error('Error in getPlayerMatchHistory:', err);
    return [];
  }
}
