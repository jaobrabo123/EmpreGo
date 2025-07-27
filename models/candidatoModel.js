const pool = require('../config/db.js');

class CandidatoModel{

    static async verificarEmailExistente(email){
        const resultado = await pool.query(`
            select 1 from candidatos where email = $1
        `, [email]);
        return resultado.rowCount > 0;
    }
    
    static async verificarEmailPendente(email){
        const resultado = await pool.query(`
            select 1 from candidatos_pend where email = $1
        `, [email]);
        return resultado.rowCount > 0;
    }

    static async verificarIdExistente(id){
        const resultado = await pool.query(`
            select 1 from candidatos where id = $1
        `, [id]);
        return resultado.rowCount > 0;
    }

    static async buscarCodigoPendentePorEmail(email){
        const resultado = await pool.query(`
            select codigo from candidatos_pend where email = $1 and expira_em > now()
        `, [email]);
        return resultado.rows[0].codigo;
    }

    static async buscarCandidatoPendentePorCodigo(codigo){
        const resultado = await pool.query(`
            select nome, email, senha, genero, data_nasc from candidatos_pend 
            where codigo = $1 and expira_em > now()
        `, [codigo]);
        return resultado.rows[0];
    }

    static async buscarTodosCandidatos(){
        const resultado = await pool.query(`SELECT 
            id, nome, email, genero, data_nasc, 
            descricao, cpf, estado, cidade, instagram,
            github, youtube, twitter, pronomes, nivel,
            data_criacao 
            FROM candidatos
        `);
        return resultado.rows;
    }

    static async buscarInfoDoTokenPorEmail(email){
        const resultado = await pool.query('SELECT id, senha, nivel FROM candidatos WHERE email = $1', [email]);
        return resultado.rows[0];
    }

    static async buscarNivelPorId(id){
        const resultado = await pool.query('select nivel from candidatos where id = $1',[id]);
        return resultado.rows[0].nivel;
    }

    static async buscarChatsPorId(id){
        const resultado = await pool.query(`
            select id from chats where candidato = $1 
        `, [id]);
        return resultado.rows;
    }

}

module.exports = CandidatoModel;