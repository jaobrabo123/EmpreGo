//const MensagemModel = require('../models/mensagemModel.js');

module.exports = (io, socket) => {
    socket.on('joinRoom', async (roomId, callback) =>{
        try{
            socket.join(roomId);
            // console.log(`Socket ${socket.id} entrou na sala ${roomId}`);
            // const mensagens = await MensagemModel.buscarMensagensPorChat(roomId);

            // socket.emit('previousMessages', mensagens);
            io.to(roomId).emit("userStatus", { status: 'Online', socket: socket.id, room: roomId});

            if (callback) callback({ status: 'success' });
        }
        catch(erro){
            console.error(erro)
            if (callback) callback({ 
                status: 'error',
                message: 'Erro ao carregar mensagens'
            });
        }
    });

    socket.on('sendMessage', data =>{
        const roomId = data.room;
        io.to(roomId).emit('receivedMessage', data);
        io.to(roomId).emit("userStatus", { status: 'Online', socket: socket.id, room: roomId});
    });

    socket.on('refreshStatus', ()=>{
        socket.rooms.forEach((room) => {
            if (room !== socket.id) {
                io.to(room).emit("userStatus", { status: 'Online', socket: socket.id, room});
            }
        });
    })

    socket.on('leaveRoom', (roomId) => {
        io.to(roomId).emit("userStatus", { status: 'Offline', socket: socket.id, room: roomId});
        setTimeout(()=>{
            socket.leave(roomId);
        },200);
        console.log(`${socket.id} saiu da sala ${roomId}`)
    });

    socket.on("disconnecting", () => {
        // console.log(`Usuário desconectou: ${socket.id}`);
        socket.rooms.forEach((room) => {
            if (room !== socket.id) {
                io.to(room).emit("userStatus", { status: 'Offline', socket: socket.id, room});
            }
        });
    })
}