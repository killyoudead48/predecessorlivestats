import fetch from 'node-fetch';

export async function getPlayerMatchHistory(playerId, count = 5) {
  const url = `https://omeda.city/players/${playerId}/matches.json?limit=${count}`;
  console.log('Fetching:', url);

  const res = await fetch(url);
  const body = await res.text();

  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status} - ${body}`);
  }

  const data = JSON.parse(body);
  return data.matches.slice(0, count);
}
