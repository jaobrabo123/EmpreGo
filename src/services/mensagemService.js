// * Prisma
const prisma = require('@config/db.js');

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

}

module.exports = MensagemService;