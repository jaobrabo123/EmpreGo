// * Prisma
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();

class CandidatoModel{

    static async verificarEmailExistente(email){
        const resultado = await prisma.candidatos.count({
            where: {
                email
            }
        });
        return resultado > 0;
    }

    static async buscarCodigoECandidatoPendentePorEmail(email){
        const resultado = await prisma.candidatos_pend.findUniqueOrThrow({
            select:{
                nome: true,
                senha: true,
                genero: true,
                data_nasc: true,
                codigo: true
            },
            where: {
                email,
                expira_em: {
                    gt: new Date()
                }
            }
        })
        return resultado;
    }

    static async buscarTodosCandidatos(limit = null, offset = null){
        const configPrisma = {
            orderBy: {
                data_criacao: 'desc'
            }
        };
        if(limit) configPrisma.take = Number(limit);
        if(offset) configPrisma.skip = Number(offset);
        const resultado = await prisma.candidatos.findMany(configPrisma);
        const resultadoSemSenha = resultado.map(({senha, ...resto}) => resto)

        return resultadoSemSenha;
    }

    static async loginInfo(email){
        const resultado = await prisma.candidatos.findUniqueOrThrow({
            select: {
                id: true,
                senha: true,
                nivel: true
            },
            where: {
                email
            }
        });
        return resultado;
    }

    static async buscarNivelPorId(id){
        const resultado = await prisma.candidatos.findUnique({
            select: {
                nivel: true
            },
            where: {
                id
            }
        });
        return resultado.nivel;
    }

    static async buscarEstadoPorId(id){
        const resultado = await prisma.candidatos.findUnique({
            select: {
                estado: true
            },
            where: {
                id
            }
        });
        return resultado.estado;
    }

    static async buscarCandidatoPorId(id){
        const resultado = await prisma.candidatos.findUniqueOrThrow({
            where: {
                id
            }
        });
        const {senha, ...resultadoSemSenha } = resultado;
        return resultadoSemSenha;
    }

}

module.exports = CandidatoModel;