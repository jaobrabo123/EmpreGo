// * Prisma
const prisma = require('../config/prisma.js')

class TokenModel{

    static async verificarTokenExistente(tkn){
        const resultado = await prisma.tokens.findFirst({
            select: {
                id: true
            },
            where: {
                token: tkn
            }
        })
        return !!resultado;
    }
    
}

module.exports = TokenModel;