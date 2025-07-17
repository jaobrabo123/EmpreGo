const cron = require('node-cron');
const pool = require('../config/db.js');

const limpezaDeTokens = cron.schedule('0 * * * *', async () => {
  try{
    const deletados = await pool.query('delete from tokens where expira_em < now()');
    console.log(`Tokens expirados removidos: ${deletados.rowCount}`);
  }
  catch(erro){
    console.error('Erro ao remover tokens expirados: ' + erro.message)
  }
}, {
  timezone: 'America/Sao_Paulo'
});

module.exports = limpezaDeTokens
