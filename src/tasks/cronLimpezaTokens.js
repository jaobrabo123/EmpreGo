const cron = require('node-cron');
const prisma = require('../config/db.js');

const limpezaDeTokens = cron.schedule('0 * * * *', async () => {
  try{
    const deletados = await prisma.tokens.deleteMany({
      where: {
        expira_em: {
          lt: new Date()
        }
      }
    });
    console.log(`Tokens expirados removidos: ${deletados.count}`);
  }
  catch(erro){
    console.error('Erro ao remover tokens expirados: ' + erro.message)
  }
}, {
  timezone: 'America/Sao_Paulo'
});

module.exports = limpezaDeTokens;