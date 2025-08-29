// * Prisma
const prisma = require('../config/db.js')

class EmpresaModel {

    /*static async verificarEmpresaExistente(cnpj, email, razao_soci){
        const resultado = await prisma.empresas.findFirst({
            select: {
                cnpj: true
            },
            where: {
                OR: [
                    { cnpj },
                    { email },
                    { razao_soci }
                ]
            }
        });
        return !!resultado;
    }*/

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

    static async buscarTodasEmpresasPublic(page){
        const pagina = page && Number(page)>1 ? Number(page) : 1;
        const resultado = await prisma.empresas.findMany({
            select: {
                cnpj: true,
                nome_fant: true,
                descricao: true,
                setor: true,
                porte: true,
                estado: true,
                foto: true
            },
            orderBy: {
                data_criacao: 'desc'
            },
            skip: (pagina-1)*9,
            take: 9
        });
        return resultado;
    }

    static async loginInfoPorCnpj(cnpj){
        const resultado = await prisma.empresas.findUniqueOrThrow({
            select: {
                senha: true,
                foto: true
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

    static async buscarFotoPorCnpj(cnpj){
        const resultado = await prisma.empresas.findUniqueOrThrow({
            where: {
                cnpj
            },
            select: {
                foto: true
            }
        })
        return resultado.foto;
    }

}

module.exports = EmpresaModel;