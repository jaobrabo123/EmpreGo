const pool = require('../config/db.js')

class TagModel{

    static async buscarTagsPorIdCandidatoLO(id, limit, offset){
        const resultado = await pool.query(`
            SELECT nome, id FROM tags where candidato = $1
            order by data_criacao desc limit $2 offset $3
        `, [id, limit, offset]);
        return resultado.rows;
    }

    static async buscarTodasTags(){
        const resultado = await pool.query(`
            select t.id, t.nome, c.email as email_candidato, t.data_criacao 
            from tags t join candidatos c on t.candidato = c.id
        `);
        return resultado.rows;
    }

    static async buscarCandidatoPorTagId(id){
        const resultado = await pool.query(`select candidato from tags where id = $1`, [id]);
        return resultado.rows[0].candidato;
    }

}

module.exports = TagModel;