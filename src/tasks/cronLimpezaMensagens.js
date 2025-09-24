const cron = require('node-cron');
const prisma = require('../config/db.js');
const { logCronTasks } = require('../utils/logsUtils.js');

const limpezaDeMensagens = cron.schedule('0 * * * *', async () => {
  const inicio = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  let task;
  let fim;
  let taskErro;
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
    const mensagem = `Mensagens antigas removidas: ${deletados.count}`;
    task = mensagem;
    console.log(mensagem);
  }
  catch(erro){
    taskErro = 'Erro ao remover candidatos com codigos expirados: ' + erro.message;
    console.error('Erro ao remover mensagens antigas:', erro)
  }
  finally{
    fim = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    logCronTasks(inicio, task, fim, taskErro);
  }
}, {
  timezone: 'America/Sao_Paulo'
});

module.exports = limpezaDeMensagens;