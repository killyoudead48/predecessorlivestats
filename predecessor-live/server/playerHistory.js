import fetch from 'node-fetch';

export async function getPlayerMatchHistory(playerId, limit = 5) {
  const url = `https://omeda.city/players/${playerId}/matches.json?limit=${limit}`;
  console.log(`Fetching: ${url}`);
  const res = await fetch(`https://omeda.city/players/${playerId}/matches.json`);
const body = await res.text();

if (!res.ok) throw new Error(`Failed to fetch: ${res.status} - ${body}`);

const data = JSON.parse(body);
return data.matches.slice(0, count);

  }

  return data.matches.slice(0, count);
}
