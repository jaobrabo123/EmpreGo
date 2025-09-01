// * Prisma
const prisma = require('../config/db.js');

class FavoritosModels {
    
    static async listarEmpresasFavoritadasPorCandidatoId(id){
        const resultado = await prisma.favoritos_empresas.findMany({
            select: {
                cnpj_empresa: true,
                empresas: {
                    select: {
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

}

module.exports = FavoritosModels;