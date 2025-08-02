const MensagemModel = require('../models/mensagemModel.js');

module.exports = (io) => {
    io.on('connection', socket =>{
        console.log(`Socket conectado: ${socket.id}`)

        socket.on('joinRoom', async (roomId, callback) =>{
            try{
                socket.join(roomId);
                console.log(`Socket ${socket.id} entrou na sala ${roomId}`);
                const mensagens = await MensagemModel.buscarMensagensPorChat(roomId);

                socket.emit('previousMessages', mensagens);

                if (callback) callback({ status: 'success' });
            }
            catch(erro){
                console.error(erro)
                if (callback) callback({ 
                    status: 'error',
                    message: 'Erro ao enviar mensagem'
                });
            }
        });


        socket.on('sendMessage', data =>{
            const roomId = data.room;
            
            io.to(roomId).emit('receivedMessage', data)
        });

        socket.on('leaveRoom', (roomId) => {
            socket.leave(roomId);
            console.log(`${socket.id} saiu da sala ${roomId}`)
        });
    })
}