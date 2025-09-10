// * Prisma
const prisma = require('../config/db.js');

class MensagemService {

  static async enviarMensagem(autor, mensagem, de, chat){

    await prisma.mensagens.create({
      data: {
        mensagem,
        de,
        chat,
        autor
      }
    })

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