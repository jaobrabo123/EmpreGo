// * Conexão com os WebSockets
const server = window.location.hostname.includes('localhost') ? 
'http://localhost:3001' : 'https://tcc-vjhk.onrender.com';
var socket = io(server);

const intervalId = setInterval(() => socket.emit('refreshStatus'), 5000);

window.addEventListener('beforeunload', () => {
  clearInterval(intervalId);
});

export default socket;