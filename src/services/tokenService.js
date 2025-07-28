const pool = require('../config/db.js');
const { ErroDeValidacao } = require('../utils/erroClasses.js');

class TokenService{

    static async adicionarToken(iden, tipo, token, expira_em){
        if(!iden||!tipo||!token||!expira_em) throw new ErroDeValidacao('Todos os campos devem ser fornecidos.');

        let insert
        if(tipo==='candidato') insert = 'candidato_id';
        else if(tipo==='empresa') insert = 'empresa_cnpj'
        else throw new ErroDeValidacao('Tipo inválido para o token.');

        await pool.query(`insert into tokens (${insert}, tipo, token, expira_em) values($1, $2, $3, $4)`,
            [iden, tipo, token, expira_em]
        )
    }
    
    static async removerToken(tkn){
        if(!tkn) throw new Error('Token não fornecido.');

        await pool.query('DELETE FROM tokens WHERE token = $1', 
            [tkn]
        );
    }
}

module.exports = TokenService;