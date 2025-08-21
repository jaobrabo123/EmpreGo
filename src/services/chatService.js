// * Prisma
const prisma = require('@config/db.js');

const Erros = require('../utils/erroClasses.js');

class ChatService {

  static async criarChat(empresa, candidato){

    await prisma.chats.create({
      data: {
        empresa,
        candidato
      }
    })

  }

}

module.exports = ChatService;