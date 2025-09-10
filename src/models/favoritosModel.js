// * Prisma
const prisma = require('../config/db.js');

class FavoritosModels {
    
    static async listarEmpresasFavoritadasPorCandidatoId(id){
        const resultado = await prisma.favoritos_empresas.findMany({
            select: {
                cnpj_empresa: true,
                empresas: {
                    select: {
                        cnpj: true,
                        nome_fant: true,
                        foto: true,
                        setor: true
                    }
                }
            },
            where: {
                id_candidato: id
            },
            orderBy: {
                data_criacao: 'desc'
            }
        });
        return resultado;
    }

    static async listarCandidatosFavoritadosPorEmpresaCnpj(cnpj){
        const resultado = await prisma.favoritos_candidatos.findMany({
            select: {
                id_candidato: true,
                candidatos: {
                    select: {
                        id: true,
                        nome: true,
                        foto: true,
                        tags: {
                            select: {
                                nome: true
                            },
                            orderBy: {
                                data_criacao: 'desc'
                            },
                            take: 1
                        }
                    }
                }
            },
            where: {
                cnpj_empresa: cnpj
            },
            orderBy: {
                data_criacao: 'desc'
            }
        });
        return resultado;
    }

}

module.exports = FavoritosModels;