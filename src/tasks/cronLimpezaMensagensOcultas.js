const cron = require('node-cron');
const prisma = require('../config/db.js');
const { logCronTasks } = require('../utils/logsUtils.js');

const limpezaDeMensagensOcultas = cron.schedule('0 * * * *', async () => {
    const inicio = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    let task;
    let fim;
    let taskErro;
    try {
        const deleteResult = await prisma.mensagens.deleteMany({
            where: {
                AND: [
                    { mensagens_ocultas_cand: { some: {} } },
                    { mensagens_ocultas_emp: { some: {} } }
                ]
            }
        });
        const mensagem = `Mensagens ocultas removidas: ${deleteResult.count}`;
        task = mensagem;
        console.log(mensagem);
    } catch (erro) {
        taskErro = 'Erro ao remover candidatos com codigos expirados: ' + erro.message;
        console.error('Erro ao remover mensagens ocultas:', erro)
    }
    finally{
        fim = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        logCronTasks(inicio, task, fim, taskErro);
    }
}, {
  timezone: 'America/Sao_Paulo'
});

module.exports = limpezaDeMensagensOcultas;