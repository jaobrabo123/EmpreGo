// * Prisma
const prisma = require('../config/prisma.js')

class ExperienciaModel {

    static async buscarCandidatoPorExperienciaId(id){
        const resultado = await prisma.experiencias.findUnique({
            select: {
                candidato: true
            },
            where: {
                id
            }
        })
        return resultado.candidato;
    }

    static async buscarExperienciasPorCandidatoId(id){
        const resultado = await prisma.experiencias.findMany({
            select:{
                titulo: true,
                descricao: true,
                imagem: true
            },
            where: {
                candidato: id
            },
            orderBy: {
                data_criacao: 'desc'
            }
        });
        return resultado;
    }

    static async buscarTodasExperiencias(){
        const resultado = await prisma.experiencias.findMany({
            select: {
                id: true,
                titulo: true,
                descricao: true,
                data_criacao: true,
                candidatos: {
                    select: {
                        email: true
                    }
                }
            }
        });
        const resultadoEmailComAS = resultado.map(exp=>({
            id: exp.id,
            titulo: exp.titulo,
            descricao: exp.descricao,
            data_criacao: exp.data_criacao,
            email_candidato: exp.candidatos.email
        }))
        return resultadoEmailComAS;
    }

}

module.exports = ExperienciaModel;