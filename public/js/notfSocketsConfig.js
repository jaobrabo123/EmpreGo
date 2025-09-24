// * Conexão com os WebSockets
const hostName = window.location.hostname;
const server = hostName.includes('localhost') ? 'http://localhost:3001' : 'https://tragic-cherrita-jaobrabo123-ad1a795a.koyeb.app';

var socket = io(server);

export default socket;