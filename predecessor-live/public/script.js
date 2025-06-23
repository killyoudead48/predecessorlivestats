const output = document.getElementById('output');
const ws = new WebSocket(`ws://${location.host}`);

ws.onmessage = event => {
  const data = JSON.parse(event.data);
  output.textContent += JSON.stringify(data, null, 2) + '\n\n';
};
