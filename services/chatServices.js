const pool = require('../config/db.js');
const { ErroDeValidacao } = require('../utils/erroClasses.js')

async function criarChat(empresa, candidato) {
  
  await pool.query(`insert into chats (empresa, candidato) values ($1, $2)`,
    [empresa, candidato]
  )

}

async function enviarMensagem(autor, mensagem, de, chat){

  await pool.query(`insert into mensagens (mensagem, de, chat, autor) values ($1, $2, $3, $4)`,
    [mensagem, de, chat, autor]
  )

}

module.exports = {
  criarChat,
  enviarMensagem
}