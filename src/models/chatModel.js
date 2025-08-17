// * Prisma
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();

const pool = require('../config/db.js');

class ChatModel {

    static async buscarChatsPorCandidato(cd){
        const resultado = await pool.query(`
            select id from chats where candidato = $1 
        `, [cd]);
        return resultado.rows;
    }

    static async buscarChatsPorEmpresa(cnpj){
        const resultado = await pool.query(`
            select id from chats where empresa = $1
        `, [cnpj]);
        return resultado.rows;
    }

    static async buscarChatsInfo(id, tipo){
        const where = tipo==='candidato' ? { candidato: id } 
            : { empresa: id };
        const resultado = prisma.chats.findMany({
            select: {
                id: true,
                empresa: true,
                candidato: true,
                empresas: {
                    select: {
                        nome_fant: true
                    }
                },
                candidatos: {
                    select: {
                        nome: true
                    }
                }
            },
            where,
            orderBy: {
                data_criacao: 'desc'
            }
        });
        return resultado;
    }

}

module.exports = ChatModel;