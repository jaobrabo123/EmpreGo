const fs = require('fs');
const path = require('path');
const logDir = path.join(__dirname, '..', 'logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

function logCronTasks(taskInit, taskFunc, taskEnd, taskError){
    const log = `[Início: ${taskInit}] ${taskFunc||taskError} [Fim: ${taskEnd}]\n`;
    fs.appendFile(path.join(logDir, 'cron-tasks.log'), log, erro => {
        if (erro) console.error('Erro ao salvar log da cron-task:', erro);
    });
}

module.exports = {
    logCronTasks
};