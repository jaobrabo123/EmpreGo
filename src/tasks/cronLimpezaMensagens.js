const cron = require('node-cron');
const prisma = require('../config/db.js');

const limpezaDeMensagens = cron.schedule('0 * * * *', async () => {
  try{
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
    const deletados = await prisma.mensagens.deleteMany({
      where: {
        data_criacao: {
          lt: trintaDiasAtras
        }
      }
    });
    console.log(`Mensagens antigas removidas: ${deletados.count}`);
  }
  catch(erro){
    console.error('Erro ao remover mensagens antigas:', erro)
  }
}, {
  timezone: 'America/Sao_Paulo'
});

module.exports = limpezaDeMensagens;