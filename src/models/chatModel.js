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
                bloqueado: true,
                bloqueador_tipo: true,
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
                bloqueado: true,
                bloqueador_tipo: true,
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

    static async buscarEmpresaCnpjPorChatId(id){
        const resultado = await prisma.chats.findUniqueOrThrow({
            select: { empresa: true, bloqueador_tipo: true, bloqueado: true },
            where: { id }
        });
        return resultado;
    }

    static async buscarCandidatoIdPorChatId(id){
        const resultado = await prisma.chats.findUniqueOrThrow({
            select: { candidato: true, bloqueador_tipo: true, bloqueado: true },
            where: { id }
        });
        return resultado;
    }

    static async verificarChatBloqueadoPorId(id){
        const resultado = await prisma.chats.findUnique({
            select: { bloqueado: true, bloqueador_tipo: true },
            where: { id }
        });
        return resultado;
    }

}

module.exports = ChatModel;