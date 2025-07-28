const pool = require('../config/db.js');

class ExperienciaModel {

    static async buscarCandidatoPorExperienciaId(xp){
        const resultado = await pool.query(`select candidato from experiencias where id = $1`, [xp]);
        return resultado.rows[0].candidato;
    }

    static async buscarExperienciasPorCandidatoId(cd){
        const resultado = await pool.query(`
            SELECT e.titulo, e.descricao, e.imagem
            FROM experiencias e
            JOIN candidatos c ON e.candidato = c.id
            WHERE e.candidato = $1
            ORDER BY e.data_criacao DESC
        `, [cd]);
        return resultado.rows;
    }

    static async buscarTodasExperiencias(){
        const resultado = await pool.query(`
            select e.id, e.titulo, e.descricao, c.email as email_candidato, e.data_criacao
            from experiencias e join candidatos c 
            on e.candidato = c.id
        `);
        return resultado.rows;
    }

}

module.exports = ExperienciaModel;