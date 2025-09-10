// * Prisma
const prisma = require('../config/db.js');
const Erros = require('../utils/erroClasses.js');

class FavoritosService {

    static async candidatoFavoritarEmpresa(empresa, candidato){
        const favoritadasCount = await prisma.favoritos_empresas.count({
            where: {
                id_candidato: candidato
            }
        });

        if(favoritadasCount>=10) throw new Erros.ErroDeValidacao("Você não pode favoritar mais de 10 empresas.");

        await prisma.favoritos_empresas.create({
            data: {
                cnpj_empresa: empresa,
                id_candidato: candidato
            }
        });
    }

    static async candidatoDesfavoritarEmpresa(empresa, candidato){
        await prisma.favoritos_empresas.deleteMany({
            where: {
                AND: [
                    {cnpj_empresa: empresa},
                    {id_candidato: candidato}
                ]
            }
        });
    }

    static async empresaFavoritarCandidato(empresa, candidato){
        const favoritadasCount = await prisma.favoritos_candidatos.count({
            where: {
                cnpj_empresa: empresa
            }
        });

        if(favoritadasCount>=30) throw new Erros.ErroDeValidacao("Você não pode favoritar mais de 30 candidatos.");

        await prisma.favoritos_candidatos.create({
            data: {
                cnpj_empresa: empresa,
                id_candidato: Number(candidato)
            }
        });
    }

    static async empresaDesfavoritarCandidato(empresa, candidato){
        await prisma.favoritos_candidatos.deleteMany({
            where: {
                cnpj_empresa: empresa,
                id_candidato: Number(candidato)
            }
        });
    }

    static async candidatoFavoritarChat(id_chat, id_candidato){
        const chatsFav = await prisma.favoritos_chats_cand.count({
            where: {
                id_candidato
            }
        })
        if(chatsFav>=3) throw new Erros.ErroDeValidacao('Você não pode favoritar mais de 3 chats.')
        await prisma.favoritos_chats_cand.create({
            data: {
                id_chat,
                id_candidato
            }
        })
    }

    static async empresaFavoritarChat(id_chat, cnpj_empresa){
        const chatsFav = await prisma.favoritos_chats_emp.count({
            where: {
                cnpj_empresa
            }
        })
        if(chatsFav>=3) throw new Erros.ErroDeValidacao('Você não pode favoritar mais de 3 chats.')
        await prisma.favoritos_chats_emp.create({
            data: {
                id_chat,
                cnpj_empresa
            }
        })
    }

    static async candidatoDesfavoritarChat(id_chat, id_candidato){
        await prisma.favoritos_chats_cand.deleteMany({
            where: {
                id_chat,
                id_candidato
            }
        })
    }

    static async empresaDesfavoritarChat(id_chat, cnpj_empresa){
        await prisma.favoritos_chats_emp.deleteMany({
            where: {
                id_chat,
                cnpj_empresa
            }
        })
    }

}

module.exports = FavoritosService;