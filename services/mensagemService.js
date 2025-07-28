const pool = require('../config/db.js')

class MensagemService {

  static async enviarMensagem(autor, mensagem, de, chat){
    await pool.query(`
      insert into mensagens (mensagem, de, chat, autor) values ($1, $2, $3, $4)
      `, [mensagem, de, chat, autor]
    );
  }

}

module.exports = MensagemService;