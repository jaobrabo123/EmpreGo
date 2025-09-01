// * Prisma
const prisma = require('../config/db.js');

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
            email_candidato: exp.candidatos.email,
            data_criacao: exp.data_criacao
        }))
        return resultadoEmailComAS;
    }

    static async buscarExperienciasPublic(){
        const resultado = await prisma.$queryRaw`
            select e.titulo, e.descricao, e.imagem,
            c.nome as candidato_nome, c.data_nasc as candidato_nasc
            from experiencias e join candidatos c
            on e.candidato = c.id
            order by random()
            limit 4
        `;
        return resultado;
    }

}

module.exports = ExperienciaModel;