// * Conexão com os WebSockets
const hostName = window.location.hostname;
const server = hostName.includes('localhost') ? 
    'http://localhost:3001' 
    : hostName.includes('tragic-cherrita-jaobrabo123-ad1a795a.koyeb.app') ? 
    'https://tragic-cherrita-jaobrabo123-ad1a795a.koyeb.app' 
    : 'https://tcc-vjhk.onrender.com';
    
var socket = io(server);

export default socket;