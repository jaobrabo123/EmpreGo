const NotificacaoModel = require("../models/notificacaoModel");
const NotificacaoService = require("../services/notificacaoService");

module.exports = (io, socket) => {
    socket.on('joinNotifications', async (usua, callback) =>{
        try{
            const roomName = `${usua.tipo}:${usua.id}`;
            socket.join(roomName);
            // console.log(`Socket ${socket.id} entrou na sala ${roomName}`);
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
                message: `Erro ao carregar notificações: ${erro.message}`
            });
        }
    });


    socket.on('sendNotification', async (data, callback) =>{
        try {
            const { tipo, id } = data.usua;
            const roomName = `${tipo}:${id}`;
            const notificacao = tipo === 'empresa' ? 
                await NotificacaoService.enviarNotificacaoParaEmpresa(data.notificacao.tipo, data.notificacao.titulo, data.notificacao.texto, data.notificacao.fvtd)
                : false;

            io.to(roomName).emit('receivedNotification', notificacao);
            if (callback) callback({ status: 'success' });
        } catch (erro) {
            console.error(erro)
            if (callback) callback({ 
                status: 'error',
                message: `Erro ao enviar notificação: ${erro.message}`
            });
        }
    });
}