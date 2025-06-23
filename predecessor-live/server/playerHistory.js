import fetch from 'node-fetch';

export async function getPlayerMatchHistory(playerId, limit = 5) {
  const url = `https://omeda.city/players/${playerId}/matches.json?limit=${limit}`;
  console.log(`Fetching: ${url}`);
  const res = await fetch('https://omeda.city/players/${playerId}/matches.json');

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch: ${res.status} - ${await res.text()}`);
  }

  const data = await res.json();
  if (!data.matches) {
    throw new Error(`Unexpected response format: ${JSON.stringify(data)}`);
  }

  return data.matches.slice(0, count);
}
