const pool = require('../config/db.js')

class TokenModel{

    static async verificarTokenExistente(tkn){
        const resultado = await pool.query(`
            SELECT expira_em FROM tokens WHERE token = $1
        `, [tkn]);
        return resultado.rows[0].expira_em;
    }
    
}

module.exports = TokenModel;