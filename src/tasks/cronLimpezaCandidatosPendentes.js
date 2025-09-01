const cron = require('node-cron');
const prisma = require('../config/db.js');

const limpezaDeCandidatosPendentes = cron.schedule('*/10 * * * *', async () => {
  try{
    const deletados = await prisma.candidatos_pend.deleteMany({
      where: {
        expira_em: {
          lt: new Date()
        }
      }
    });
    console.log(`Candidatos com codigos expirados removidos: ${deletados.count}`);
  }
  catch(erro){
    console.error('Erro ao remover candidatos com codigos expirados: ' + erro.message)
  }
}, {
  timezone: 'America/Sao_Paulo'
});

module.exports = limpezaDeCandidatosPendentes;