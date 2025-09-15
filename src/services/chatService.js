// * Prisma
const prisma = require('../config/db.js');
const ChatModel = require('../models/chatModel.js');

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

  static async deletarChat(idUsua, tipoUsua, nivelUsua, idChat){
    if(nivelUsua!=='admin'){
      const idUsuaChat = tipoUsua === 'candidato' ? 
        (await ChatModel.buscarCandidatoIdPorChatId(idChat)).candidato
        : (await ChatModel.buscarEmpresaCnpjPorChatId(idChat)).empresa;
      if(!idUsuaChat || idUsuaChat !== idUsua) throw new Erros.ErroDeAutorizacao('Você não pode deletar um chat que não é seu.');
    };
    await prisma.chats.delete({ where: { id: idChat } });
  }

  static async bloquearChat(idUsua, tipoUsua, nivelUsua, idChat, blockChat){
    if(nivelUsua!=='admin'){
      const idUsuaChat = tipoUsua === 'candidato' ? 
        (await ChatModel.buscarCandidatoIdPorChatId(idChat)).candidato
        : (await ChatModel.buscarEmpresaCnpjPorChatId(idChat)).empresa;
      if(!idUsuaChat || idUsuaChat !== idUsua) throw new Erros.ErroDeAutorizacao(`Você não pode ${blockChat?'bloquear':'desbloquear'} um chat que não é seu.`);
    };
    await prisma.chats.update({ 
      data: { bloqueado: blockChat, bloqueador_tipo: (blockChat?tipoUsua:null) },
      where: { id: idChat } 
    });
  }

}

module.exports = ChatService;