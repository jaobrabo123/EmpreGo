const pool = require('../config/db.js');
const Erros = require('../utils/erroClasses.js');

class ChatService {

  static async criarChat(empresa, candidato){

    await pool.query(`
      insert into chats (empresa, candidato) values ($1, $2)
      `, [empresa, candidato]
    );

  }

}

module.exports = ChatService;