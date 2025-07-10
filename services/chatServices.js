const pool = require('../config/db.js');
const ErroDeValidacao = require('../utils/erroValidacao.js')

async function criarChat(empresa, candidato) {
  
  await pool.query(`insert into chats (empresa, candidato) values ($1, $2)`,
    [empresa, candidato]
  )

}

async function enviarMensagem(mensagem, de, para, chat){

  await pool.query(`insert into mensagens (mensagem, de, para, chat) values ($1, $2, $3, $4)`,
    [mensagem, de, para, chat]
  )

}

module.exports = {
    criarChat,
    enviarMensagem
}