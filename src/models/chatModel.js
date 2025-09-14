// * Prisma
const prisma = require('../config/db.js');
const { descriptografarMensagem } = require('../utils/cryptoMsgs.js');

class ChatModel {

    static async buscarChatsPorCandidato(id){
        const resultado = await prisma.chats.findMany({
            select: {
                id: true
            },
            where: {
                candidato: id
            }
        })
        return resultado;
    }

    static async buscarChatsPorEmpresa(cnpj){
        const resultado = await prisma.chats.findMany({
            select: {
                id: true
            },
            where: {
                empresa: cnpj
            }
        })
        return resultado;
    }

    static async buscarChatsInfoPorCandidatoId(id){
        const resultado = await prisma.chats.findMany({
            select: {
                id: true,
                empresa: true,
                candidato: true,
                empresas: {
                    select: {
                        cnpj: true,
                        nome_fant: true,
                        foto: true
                    }
                },
                mensagens: {
                    select: {
                        mensagem: true,
                        de: true,
                        status: true,
                        data_criacao: true
                    },
                    orderBy: {
                        data_criacao: 'asc'
                    }
                },
                favoritos_chats_cand: {
                    select: {
                        id: true
                    }
                }
            },
            where: {
                candidato: id
            },
            orderBy: {
                data_criacao: 'desc'
            }
        });
        const resultadoComMensagensDescriptografadas = resultado.map(({mensagens, ...resto})=>({
            ...resto,
            mensagens: mensagens.map(msg => ({
                data_criacao: msg.data_criacao,
                mensagem: descriptografarMensagem(msg.mensagem),
                de: msg.de,
                status: msg.status
            }))
        }))
        return resultadoComMensagensDescriptografadas;
    }

    static async buscarChatsInfoPorEmpresaCnpj(cnpj){
        const resultado = await prisma.chats.findMany({
            select: {
                id: true,
                empresa: true,
                candidato: true,
                candidatos: {
                    select: {
                        id: true,
                        nome: true,
                        foto: true
                    }
                },
                mensagens: {
                    select: {
                        mensagem: true,
                        de: true,
                        status: true,
                        data_criacao: true
                    },
                    orderBy: {
                        data_criacao: 'asc'
                    }
                },
                favoritos_chats_emp: {
                    select: {
                        id: true
                    }
                }
            },
            where: {
                empresa: cnpj
            },
            orderBy: {
                data_criacao: 'desc'
            }
        });
        const resultadoComMensagensDescriptografadas = resultado.map(({mensagens, ...resto})=>({
            ...resto,
            mensagens: mensagens.map(msg => ({
                data_criacao: msg.data_criacao,
                mensagem: descriptografarMensagem(msg.mensagem),
                de: msg.de,
                status: msg.status
            }))
        }))
        return resultadoComMensagensDescriptografadas;
    }

}

module.exports = ChatModel;