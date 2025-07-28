const cron = require('node-cron');
const pool = require('../config/db.js');

const limpezaDeMensagens = cron.schedule('0 * * * *', async () => {
  try{
    const deletados = await pool.query(`delete from mensagens where data_criacao < now() - INTERVAL '7 days'`);
    console.log(`Mensagens antigas removidas: ${deletados.rowCount}`);
  }
  catch(erro){
    console.error('Erro ao remover mensagens antigas: ' + erro.message)
  }
}, {
  timezone: 'America/Sao_Paulo'
});

module.exports = limpezaDeMensagens