const cron = require('node-cron');
const prisma = require('../config/db.js');

const limpezaDeMensagensOcultas = cron.schedule('0 * * * *', async () => {
    try {
        const deleteResult = await prisma.mensagens.deleteMany({
            where: {
                AND: [
                    { mensagens_ocultas_cand: { some: {} } },
                    { mensagens_ocultas_emp: { some: {} } }
                ]
            }
        });
        console.log(`Mensagens ocultas removidas: ${deleteResult.count}`);
    } catch (erro) {
        console.error('Erro ao remover mensagens ocultas:', erro)
    }
}, {
  timezone: 'America/Sao_Paulo'
});

module.exports = limpezaDeMensagensOcultas;