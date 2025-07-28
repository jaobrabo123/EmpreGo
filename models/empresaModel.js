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

    static async buscarTodasEmpresas(){
        const resultado = await pool.query(`
            SELECT cnpj, nome_fant, telefone, email, razao_soci, cep, 
            complemento, numero, descricao, setor, porte, data_fund, 
            contato, site, instagram, github, youtube, twitter,
            data_criacao FROM empresas
        `);
        return resultado.rows;
    }

    static async buscarInfoDoTokenPorCnpj(cnpj){
        const resultado = await pool.query(`
            SELECT senha, cnpj FROM empresas WHERE cnpj = $1
        `, [cnpj]);
        return resultado.rows[0];
    }

}

module.exports = EmpresaModel;