const cron = require('node-cron');
const prisma = require('../config/db.js');

const limpezaDeMensagens = cron.schedule('0 * * * *', async () => {
  try{
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    const deletados = await prisma.mensagens.deleteMany({
      where: {
        data_criacao: {
          lt: seteDiasAtras
        }
      }
    });
    console.log(`Mensagens antigas removidas: ${deletados.count}`);
  }
  catch(erro){
    console.error('Erro ao remover mensagens antigas: ' + erro.message)
  }
}, {
  timezone: 'America/Sao_Paulo'
});

module.exports = limpezaDeMensagens;