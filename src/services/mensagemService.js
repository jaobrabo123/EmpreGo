// * Prisma
const prisma = require('../config/db.js');
const ChatModel = require('../models/chatModel.js');
const { criptografarMensagem } = require('../utils/cryptoMsgs.js');
const ValidarCampos = require('../utils/validarCampos.js');
const Erros = require("../utils/erroClasses.js");
const MensagemModel = require('../models/mensagemModel.js');

class MensagemService {

  static async enviarMensagem(autor, mensagem, de, chat, idUsua){
    const chatBloqueado = await ChatModel.verificarChatBloqueadoPorIdEPorUsua(chat, de, idUsua);
    if(!chatBloqueado) throw new Erros.ErroDeNaoEncontrado('Chat fornecido não existe ou não é seu.');
    if(chatBloqueado.bloqueado) throw new Erros.ErroDeAutorizacao('Você não pode enviar mensagem para um chat bloqueado.');

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

  static async enviarArquivo(autor, chat, de, path, size, nomeFile, idUsua){
    const chatBloqueado = await ChatModel.verificarChatBloqueadoPorIdEPorUsua(chat, de, idUsua);
    if(!chatBloqueado) throw new Erros.ErroDeNaoEncontrado('Chat fornecido não existe ou não é seu.');
    if(chatBloqueado.bloqueado) throw new Erros.ErroDeAutorizacao('Você não pode enviar um arquivo para um chat bloqueado.');
    ValidarCampos.validarArquivoRawNoCloudinary(path);

    const nomeAjeitado = Buffer.from(nomeFile, 'latin1').toString('utf8');
    const mensagem = `NewSendFile|${path}|${size}|${nomeAjeitado}|fileNew`;
    const mensagemCriptografada = criptografarMensagem(mensagem);

    await prisma.mensagens.create({
      data: {
        mensagem: mensagemCriptografada,
        de,
        chat,
        autor
      }
    });

    return mensagem;
  }

  static async enviarFoto(autor, chat, de, path, size, nomeImg, idUsua){
    const chatBloqueado = await ChatModel.verificarChatBloqueadoPorIdEPorUsua(chat, de, idUsua);
    if(!chatBloqueado) throw new Erros.ErroDeNaoEncontrado('Chat fornecido não existe.');
    if(chatBloqueado.bloqueado) throw new Erros.ErroDeAutorizacao('Você não pode enviar uma imagem para um chat bloqueado.');
    ValidarCampos.validarImagemNoCloudinary(path);
    
    const nomeAjeitado = Buffer.from(nomeImg, 'latin1').toString('utf8');
    const mensagem = `NewSendImage|${path}|${size}|${nomeAjeitado}|imageNew`;
    const mensagemCriptografada = criptografarMensagem(mensagem);

    await prisma.mensagens.create({
      data: {
        mensagem: mensagemCriptografada,
        de,
        chat,
        autor
      }
    });

    return mensagem;
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

  static async ocultarMensagem(idUsua, tipoUsua, idMsg){
    if(tipoUsua==='candidato'){
      const removedMessage = await prisma.mensagens_ocultas_cand.create({
        data: {
          candidato_id: Number(idUsua),
          mensagem_id: idMsg
        },
        select: {
          mensagens: {
            select: {
              mensagens_ocultas_emp: { select: { id: true } },
              id: true
            }
          }
        }
      });
      if (removedMessage.mensagens.mensagens_ocultas_emp.length > 0){
        await prisma.mensagens.delete({
          where: {
            id: removedMessage.mensagens.id
          }
        })
      } 
    } else {
      const removedMessage = await prisma.mensagens_ocultas_emp.create({
        data: {
          empresa_cnpj: idUsua,
          mensagem_id: idMsg
        },
        select: {
          mensagens: {
            select: {
              mensagens_ocultas_cand: { select: { id: true } },
              id: true
            }
          }
        }
      });
      if (removedMessage.mensagens.mensagens_ocultas_cand.length > 0){
        await prisma.mensagens.delete({
          where: {
            id: removedMessage.mensagens.id
          }
        })
      } 
    }
  }

  static async deletarMensagem(idUsua, tipoUsua, nivelUsua, idMsg){
    if(nivelUsua==='admin'){
      await prisma.mensagens.delete({
        where: {
          id: idMsg
        }
      });
      return;
    }
    const trintaMinAtras = new Date();
    trintaMinAtras.setMinutes(trintaMinAtras.getMinutes() - 30);
    const messageToDelete = await prisma.mensagens.deleteMany({
      where: {
        id: idMsg,
        de: tipoUsua,
        data_criacao: {
          gte: trintaMinAtras
        },
        chats: {
          [tipoUsua]: tipoUsua==='candidato' ? Number(idUsua) : idUsua
        }
      }
    });
    if(messageToDelete.count===0) throw new Erros.ErroDeValidacao('A mensagem não pode ser deletada ou ela não existe.');
  }

  static async limparChatMensagens(idUsua, tipoUsua, nivelUsua, idChat){
    if(nivelUsua!=='admin'){
      const idUsuaChat = tipoUsua === 'candidato' ? 
        (await ChatModel.buscarCandidatoIdPorChatId(idChat)).candidato
        : (await ChatModel.buscarEmpresaCnpjPorChatId(idChat)).empresa;
      if(!idUsuaChat || idUsuaChat !== idUsua) throw new Erros.ErroDeAutorizacao('Você não pode limpar uma conversa que não é sua.');
    };
    await prisma.mensagens.deleteMany({ where: { chat: idChat } });
  }

}

module.exports = MensagemService;