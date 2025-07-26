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
}

module.exports = CandidatoModel;