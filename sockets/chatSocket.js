const pool = require('../config/db.js')

module.exports = (io) => {
    io.on('connection', socket =>{
        console.log(`Socket conectado: ${socket.id}`)

        socket.on('joinRoom', async (roomId, callback) =>{
            try{
                socket.join(roomId)
                console.log(`Socket ${socket.id} entrou na sala ${roomId}`)
                const response = await pool.query(`select autor as author, mensagem as message, chat as room, de as type from mensagens 
                    where chat = $1
                    order by data_criacao asc`,
                    [roomId]
                );
                //console.log(response.rows)

                socket.emit('previousMessages', response.rows);

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
        });
    })
    }