// * Prisma
const prisma = require('@config/db.js');

const { ErroDeValidacao } = require('../utils/erroClasses.js');

class TokenService{

    static async adicionarToken(iden, tipo, token, expira_em){
        if(!iden||!tipo||!token||!expira_em) throw new ErroDeValidacao('Todos os campos devem ser fornecidos.');

        const data = {
            tipo,
            token,
            expira_em
        }
        if(tipo==='candidato') data.candidato_id = iden;
        else if(tipo==='empresa') data.empresa_cnpj = iden;
        else throw new ErroDeValidacao('Tipo inválido para o token.');

        await prisma.tokens.create({ data });
    }
    
    static async removerToken(tkn){
        if(!tkn) throw new ErroDeValidacao('Token não fornecido.');

        await prisma.tokens.delete({
            where: {
                token: tkn
            }
        })
    }
}

module.exports = TokenService;