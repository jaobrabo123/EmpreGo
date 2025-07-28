const pool = require('../config/db.js');

class ChatModel {

    static async buscarChatsPorCandidato(cd){
        const resultado = await pool.query(`
            select id from chats where candidato = $1 
        `, [cd]);
        return resultado.rows;
    }

    static async buscarChatsPorEmpresa(cnpj){
        const resultado = await pool.query(`
            select id from chats where empresa = $1
        `, [cnpj]);
        return resultado.rows;
    }

    static async buscarChatsInfoPorCandidato(cd){
        const resultado = await pool.query(`
            select c.id, c.empresa, c.candidato, e.nome_fant, can.nome 
            from chats c join empresas e
            on c.empresa = e.cnpj
            join candidatos can on c.candidato = can.id
            where candidato = $1 order by c.data_criacao desc
        `, [cd]);
        return resultado.rows;
    }

    static async buscarChatsInfoPorEmpresa(cnpj){
        const resultado = await pool.query(`
            select c.id, c.empresa, c.candidato, can.nome, e.nome_fant 
            from chats c join candidatos can
            on c.candidato = can.id
            join empresas e on c.empresa = e.cnpj
            where empresa = $1 order by c.data_criacao desc
        `, [cnpj]);
        return resultado.rows;
    }

}

module.exports = ChatModel;