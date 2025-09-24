// * Conexão com os WebSockets
const hostName = window.location.hostname;
const server = hostName.includes('localhost') ? 'http://localhost:3001' : 'https://app.emprego-vagas.com.br';

var socket = io(server);

export default socket;