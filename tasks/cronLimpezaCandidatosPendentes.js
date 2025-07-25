const cron = require('node-cron');
const pool = require('../config/db.js');

const limpezaDeTokens = cron.schedule('*/10 * * * *', async () => {
  try{
    const deletados = await pool.query('delete from candidatos_pend where expira_em < now()');
    console.log(`Candidatos com codigos expirados removidos: ${deletados.rowCount}`);
  }
  catch(erro){
    console.error('Erro ao remover candidatos com codigos expirados: ' + erro.message)
  }
}, {
  timezone: 'America/Sao_Paulo'
});

module.exports = limpezaDeTokens