import fetch from 'node-fetch';

export async function getPlayerMatchHistory(playerId, limit = 5) {
  const url = `https://omeda.city/players/${playerId}/matches.json?limit=${limit}`;
  console.log("Fetching:", url);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    
    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("Unexpected response format:", data);
      return [];
    }

    return data;
  } catch (err) {
    console.error("Failed to fetch player match history:", err.message);
    return [];
  }
}
