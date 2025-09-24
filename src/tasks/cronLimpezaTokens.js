const cron = require('node-cron');
const prisma = require('../config/db.js');
const { logCronTasks } = require('../utils/logsUtils.js');

const limpezaDeTokens = cron.schedule('0 * * * *', async () => {
  const inicio = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  let task;
  let fim;
  let taskErro;
  try{
    const deletados = await prisma.tokens.deleteMany({
      where: {
        expira_em: {
          lt: new Date()
        }
      }
    });
    const mensagem = `Tokens expirados removidos: ${deletados.count}`;
    task = mensagem;
    console.log(mensagem);
  }
  catch(erro){
    taskErro = 'Erro ao remover candidatos com codigos expirados: ' + erro.message;
    console.error('Erro ao remover tokens expirados:', erro)
  }
  finally{
    fim = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    logCronTasks(inicio, task, fim, taskErro);
  }
}, {
  timezone: 'America/Sao_Paulo'
});

module.exports = limpezaDeTokens;