const NotificacaoModel = require("../models/notificacaoModel");

module.exports = (io, socket) => {
    socket.on('joinNotifications', async (usua, callback) =>{
        try{
            const roomName = `${usua.tipo}:${usua.id}`;
            socket.join(roomName);
            console.log(`Socket ${socket.id} entrou na sala ${roomName}`);
            const notificacoes = usua.tipo === 'candidato' ? 
                await NotificacaoModel.buscarNotificacoesPorCandidatoId(usua.id)
                : await NotificacaoModel.buscarNotificacoesPorEmpresaCnpj(usua.id);

            socket.emit('previousNotifications', notificacoes);

            if (callback) callback({ status: 'success' });
        }
        catch(erro){
            console.error(erro)
            if (callback) callback({ 
                status: 'error',
                message: 'Erro ao carregar notificações'
            });
        }
    });


    socket.on('sendNotification', data =>{
        const roomName = `${data.usua.tipo}:${data.usua.id}`;
        
        // TODO Salvar no banco de dados antes de emitir

        io.to(roomName).emit('receivedNotification', data.notificacao);
    });

}