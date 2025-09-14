// * Prisma
const prisma = require('../config/db.js');
const { criptografarMensagem } = require('../utils/cryptoMsgs.js');
const ValidarCampos = require('../utils/validarCampos.js');

class MensagemService {

  static async enviarMensagem(autor, mensagem, de, chat){
    ValidarCampos.validarTamanhoMax(mensagem, 500, 'Mensagem');
    mensagem = mensagem.trim();
    
    const mensagemCriptografada = criptografarMensagem(mensagem);

    await prisma.mensagens.create({
      data: {
        mensagem: mensagemCriptografada,
        de,
        chat,
        autor
      }
    });

  }

  static async vizualizarMensagens(chatId, tipo){
    const where = {
      status: false,
      chat: chatId,
      de: tipo === 'candidato' ? 'empresa' : 'candidato'
    };
    await prisma.mensagens.updateMany({
      where,
      data: {
        status: true
      }
    })
  }

}

module.exports = MensagemService;