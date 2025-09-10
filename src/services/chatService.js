// * Prisma
const prisma = require('../config/db.js');

const Erros = require('../utils/erroClasses.js');

class ChatService {

  static async criarChat(empresa, candidato){

    const novoChat = await prisma.chats.create({
      data: {
        empresa,
        candidato
      },
      select: {
        id: true,
        empresa: true,
        candidato: true,
        empresas: {
          select: {
            cnpj: true,
            nome_fant: true,
            foto: true
          }
        },
        candidatos: {
          select: {
            id: true,
            nome: true,
            foto: true
          }
        },
        mensagens: {
          select: {
            mensagem: true,
            de: true,
            status: true,
            data_criacao: true
          },
          orderBy: {
            data_criacao: 'asc'
          }
        },
        favoritos_chats_cand: {
          select: {
            id: true
          }
        },
        favoritos_chats_emp: {
          select: {
            id: true
          }
        }
      }
    })
    return novoChat;

  }

}

module.exports = ChatService;