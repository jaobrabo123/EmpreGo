// * Prisma
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();

const pool = require('../config/db.js');

class CandidatoModel{

    static async verificarEmailExistente(email){
        const resultado = await pool.query(`
            select 1 from candidatos where email = $1
        `, [email]);
        return resultado.rowCount > 0;
    }
    
    static async verificarEmailPendente(email){
        const resultado = await pool.query(`
            select 1 from candidatos_pend where email = $1
        `, [email]);
        return resultado.rowCount > 0;
    }

    static async verificarIdExistente(id){
        const resultado = await pool.query(`
            select 1 from candidatos where id = $1
        `, [id]);
        return resultado.rowCount > 0;
    }

    static async verificarCpfExistente(cpf){
        const resultado = await pool.query(`
            select 1 from candidatos where cpf = $1
        `, [cpf]);
        return resultado.rowCount > 0;
    }

    static async buscarCodigoECandidatoPendentePorEmail(email){
        const resultado = await pool.query(`
            select nome, senha, genero, data_nasc, codigo from candidatos_pend 
            where email = $1 and expira_em > now()
        `, [email]);
        return resultado.rows[0];
    }

    static async buscarTodosCandidatos(limit = null, offset = null){
        const configPrisma = {
            orderBy: {
                data_criacao: 'desc'
            }
        }
        if(limit) configPrisma.take = Number(limit);
        if(offset) configPrisma.skip = Number(offset);
        const resultado = await prisma.candidatos.findMany(configPrisma);
        const resultadoSemSenha = resultado.map(({senha, ...resto}) => resto)

        return resultadoSemSenha;
    }

    static async loginInfo(email){
        const resultado = await prisma.candidatos.findUniqueOrThrow({
            select: {
                id: true,
                senha: true,
                nivel: true
            },
            where: {
                email
            }
        })
        return resultado;
    }

    static async buscarNivelPorId(id){
        const resultado = await pool.query('select nivel from candidatos where id = $1',[id]);
        return resultado.rows[0].nivel;
    }

    static async buscarPerfilInfoPorId(id){
        const resultado = await pool.query(`
            SELECT nome, data_nasc, email, descricao, foto, cpf, 
            estado, cidade, instagram, github, youtube, twitter, pronomes
            FROM candidatos where id = $1
        `, [id]);
        return resultado.rows[0];
    }

    static async buscarEstadoPorId(id){
        const resultado = await pool.query(`
            SELECT estado FROM candidatos WHERE id = $1
        `,[id]);
        return resultado.rows[0].estado;
    }

    static async buscarCandidatoPorId(id){
        const resultado = await prisma.candidatos.findUniqueOrThrow({
            where: {
                id
            }
        });
        const {senha, ...resultadoSemSenha } = resultado;
        return resultadoSemSenha;
    }

}

module.exports = CandidatoModel;