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

    static async verificarCpfExistente(cpf){
        const resultado = await pool.query(`
            select 1 from candidatos where cpf = $1
        `, [cpf]);
        return resultado.rowCount > 0;
    }

    static async buscarCodigoPendentePorEmail(email){
        const resultado = await pool.query(`
            select codigo from candidatos_pend where email = $1 and expira_em > now()
        `, [email]);
        return resultado.rows[0].codigo;
    }

    static async buscarCodigoECandidatoPendentePorEmail(email){
        const resultado = await pool.query(`
            select nome, senha, genero, data_nasc, codigo from candidatos_pend 
            where email = $1 and expira_em > now()
        `, [email]);
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

    static async buscarPerfilInfoPorId(id){
        const resultado = await pool.query(`
            SELECT nome, data_nasc, email, descricao, foto, cpf, 
            estado, cidade, instagram, github, youtube, twitter, pronomes
            FROM candidatos where id = $1
        `, [id]);
        return resultado.rows[0];
    }

    static async buscarEstadoPorId(id){
        const resultado = await pool.query(`
            SELECT estado FROM candidatos WHERE id = $1
        `,[id]);
        return resultado.rows[0].estado;
    }

}

module.exports = CandidatoModel;