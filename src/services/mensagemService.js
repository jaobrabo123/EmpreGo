// * Prisma
const prisma = require('../config/db.js');
const ChatModel = require('../models/chatModel.js');
const { criptografarMensagem } = require('../utils/cryptoMsgs.js');
const ValidarCampos = require('../utils/validarCampos.js');
const Erros = require("../utils/erroClasses.js");
const MensagemModel = require('../models/mensagemModel.js');

class MensagemService {

  static async enviarMensagem(autor, mensagem, de, chat){
    const chatBloqueado = await ChatModel.verificarChatBloqueadoPorId(chat);
    if(!chatBloqueado) throw new Erros.ErroDeNaoEncontrado('Chat fornecido não existe.')
    if(chatBloqueado.bloqueado) throw new Erros.ErroDeAutorizacao('Você não pode enviar mensagem para um chat bloqueado.')

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

  static async enviarArquivo(autor, chat, de, path, size){
    const chatBloqueado = await ChatModel.verificarChatBloqueadoPorId(chat);
    if(!chatBloqueado) throw new Erros.ErroDeNaoEncontrado('Chat fornecido não existe.');
    if(chatBloqueado.bloqueado) throw new Erros.ErroDeAutorizacao('Você não pode enviar um arquivo para um chat bloqueado.');
    ValidarCampos.validarArquivoRawNoCloudinary(path);
    const mensagem = `NewSendFile|${path}|${size}|fileNew`;
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