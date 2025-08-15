const pool = require('../config/db.js')

class TokenModel{

    static async verificarTokenExistente(tkn){
        const resultado = await pool.query(`
            SELECT 1 FROM tokens WHERE token = $1
        `, [tkn]);
        return resultado.rowCount>0;
    }
    
}

module.exports = TokenModel;