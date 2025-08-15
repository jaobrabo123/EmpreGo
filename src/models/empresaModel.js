const pool = require('../config/db.js');

class EmpresaModel {

    static async verificarEmpresaExistente(cnpj, email, razao_soci){
        const resultado = await pool.query(
            'SELECT 1 FROM empresas WHERE cnpj = $1 OR email = $2 OR razao_soci = $3',
            [cnpj, email, razao_soci]
        );
        return resultado.rowCount > 0;
    }

    static async verificarCnpjExistente(cnpj){
        const resultado = await pool.query(`
            select 1 from empresas where cnpj = $1
        `, [cnpj]);
        return resultado.rowCount > 0;
    }

    static async buscarTodasEmpresas(limit, offset){
        const resultado = await pool.query(`
            SELECT cnpj, nome_fant, telefone, email, razao_soci, cep, 
            complemento, estado, cidade, numero, descricao, setor, porte, data_fund, 
            contato, site, instagram, github, youtube, twitter,
            data_criacao FROM empresas 
            order by data_criacao desc limit $1 offset $2
        `, [limit, offset]);
        return resultado.rows;
    }

    static async buscarInfoDoTokenPorCnpj(cnpj){
        const resultado = await pool.query(`
            SELECT senha, cnpj FROM empresas WHERE cnpj = $1
        `, [cnpj]);
        return resultado.rows[0];
    }

    static async buscarPerfilInfoPorCnpj(cnpj){
        const resultado = await pool.query(`
            SELECT nome_fant, telefone, cep, complemento, numero, descricao, setor, porte, data_fund, contato, site, instagram, github, youtube, twitter, foto
            FROM empresas where cnpj = $1
        `,[cnpj]);
        return resultado.rows[0];
    }

}

module.exports = EmpresaModel;