// * Conexão com os WebSockets
const server = window.location.hostname.includes('localhost') ? 
'http://localhost:3001' : 'https://tcc-vjhk.onrender.com';
var socket = io(server);

export default socket;