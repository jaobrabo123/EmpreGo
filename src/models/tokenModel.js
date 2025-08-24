// * Prisma
const prisma = require('../config/db.js');

class TokenModel{

    static async verificarTokenExistente(tkn){
        const resultado = await prisma.tokens.findUnique({
            select: {
                id: true
            },
            where: {
                token: tkn
            }
        })
        return resultado;
    }

}

module.exports = TokenModel;