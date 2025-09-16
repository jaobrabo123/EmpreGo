const setupChat = require('./chatSocket.js');
const setupNotificacao = require('./notificacaoSocket.js');

module.exports = (io) => {
    io.on('connection', (socket) => {
        // console.log(`⚡ Nova conexão: ${socket.id}`);
        setupChat(io, socket);
        setupNotificacao(io, socket);
    });
}