// * Prisma
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

class EmpresaModel {

    static async verificarEmpresaExistente(cnpj, email, razao_soci){
        const resultado = await prisma.empresas.count({
            where: {
                OR: [
                    { cnpj },
                    { email },
                    { razao_soci }
                ]
            }
        });
        return resultado > 0;
    }

    static async buscarTodasEmpresas(limit=null, offset=null){
        const configPrisma = {
            orderBy: {
                data_criacao: 'desc'
            }
        }
        if(limit) configPrisma.take = Number(limit);
        if(offset) configPrisma.skip = Number(offset);
        const resultado = await prisma.empresas.findMany(configPrisma)
        const resultadoSemSenha = resultado.map(({ senha, ...resto }) => resto);
        return resultadoSemSenha;
    }

    static async loginInfo(cnpj){
        const resultado = await prisma.empresas.findUniqueOrThrow({
            select: {
                senha: true
            },
            where: {
                cnpj
            }
        });
        return resultado;
    }

    static async buscarEmpresaPorCnpj(cnpj){
        const resultado = await prisma.empresas.findUniqueOrThrow({
            where: {
                cnpj
            }
        });
        const { senha, ...resultadoSemSenha } = resultado;
        return resultadoSemSenha;
    }

}

module.exports = EmpresaModel;