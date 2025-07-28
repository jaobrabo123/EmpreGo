const pool = require('../config/db.js');

class MensagemModel {

    static async buscarMensagensPorChat(chat){
        const resultado = await pool.query(`select autor as author, mensagem as message, chat as room, de as type from mensagens 
            where chat = $1
            order by data_criacao asc`,
            [chat]
        );
        return resultado.rows;
    }

}

module.exports = MensagemModel;