// * Prisma
const prisma = require('../config/db.js');

class TagModel{

    static async buscarTagsPorIdCandidatoLO(id, limit=null, offset=null){
        const configPrisma = {
            select: {
                nome: true,
                id: true
            },
            orderBy: {
                data_criacao: 'desc'
            },
            where: {
                candidato: id
            }
        };
        if(limit) configPrisma.take = Number(limit);
        if(offset) configPrisma.skip = Number(offset);
        const resultado = await prisma.tags.findMany(configPrisma);
        return resultado;
    }

    static async buscarTodasTags(){
        const resultado = await prisma.tags.findMany({
            select: {
                id: true,
                nome: true,
                data_criacao: true,
                candidatos: {
                    select: {
                        email: true
                    }
                }
            }
        });
        const resultadoEmailComAs = resultado.map(tag=>({
            id: tag.id,
            nome: tag.nome,
            email_candidato: tag.candidatos.email,
            data_criacao: tag.data_criacao
        }));
        return resultadoEmailComAs;
    }

    static async buscarCandidatoPorTagId(id){
        const resultado = await prisma.tags.findUnique({
            select: {
                candidato: true
            },
            where: {
                id
            }
        });
        return resultado.candidato;
    }

}

module.exports = TagModel;