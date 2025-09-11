// * Imports
const CandidatoService = require('../services/candidatoService.js');
const CandidatoModel = require('../models/candidatoModel.js');
const Erros = require("../utils/erroClasses.js");
const TokenService = require('../services/tokenService.js');
const { salvarCookieToken, validarCookieToken, salvarCookieRefreshToken, salvarCookieFoto } = require('../utils/cookieUtils.js');
const transporter = require('../config/nodemailer.js');

// * Variáveis de ambiente
const EMAIL_SERVER = process.env.EMAIL;

class CandidatoController {

    static async cadastrar(req, res) {
        try{
            const { nome, email, senha, genero, data_nasc } = req.body;
            if (!nome || !email || !senha || !genero || !data_nasc) {
                return res.status(400).json({ error: "Todas as informações devem ser fornecidas para o cadastro!" });
            }

            const codigo = Math.floor(Math.random() * 9000) + 1000;
            const expira_em = new Date(Date.now() + 15 * 60 * 1000);

            await CandidatoService.popularTabelaCandidatosPendentes(
                nome, email, senha, genero, data_nasc, codigo, expira_em
            );

            const emailOptions = {
                from: EMAIL_SERVER,
                to: email,
                subject: 'Código de verificação EmpreGo',
                text: `Seu código de verificação é: ${codigo}`
            }

            transporter.sendMail(emailOptions);

            res.status(201).json({ message: "Pré-cadastro concluído." });
        }
        catch(erro){
            if (erro instanceof Erros.ErroDeValidacao) {
                return res.status(400).json({ error: erro.message });
            }
            if(erro instanceof Erros.ErroDeConflito) {
                return res.status(409).json({ error: erro.message });
            }
            if(erro.code==='P2002'){
                return res.status(409).json({ error: "Email aguardando confirmação." });
            }

            res.status(500).json({ error: "Erro ao fazer pré-cadastro: " + erro.message });
        }
    }

    static async confirmarCadastro(req, res) {
        try{
            const { codigo, email } = req.body;

            if(!codigo||!email) return res.status(400).json({ error: "Codigo de verificação e email precisam ser fornecidos."});

            const newCand = await CandidatoService.popularTabelaCandidatos(codigo, email);

            const tkn = req.cookies.token;
            if (tkn && validarCookieToken(tkn)) {
                await TokenService.removerToken(tkn);
            }

            const token = salvarCookieToken(res, newCand.id, 'candidato', 'comum', newCand.nome);
            salvarCookieRefreshToken(res, token);
            const expira_em = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await TokenService.adicionarToken(newCand.id, 'candidato', token, expira_em);

            salvarCookieFoto(res, newCand.foto);
            res.status(201).json({ message: 'Email confirmado com sucesso.'});
        }
        catch(erro){
            if(erro.code==='P2025'){
                return res.status(404).json({ error: "Email fornecido não está aguardando confirmação." });
            }
            if (erro instanceof Erros.ErroDeValidacao) {
                return res.status(400).json({ error: erro.message });
            }
            res.status(500).json({ error: "Erro ao confirmar cadastro." });
        }
    }

    static async enviarNovoCodigo(req, res){
        try{
            const { email } = req.body;

            if(!email) return res.status(400).json({ error: 'Email precisa ser fornecido.' });

            const codigo = await CandidatoService.gerarNovoCodigoPendente(email);

            const emailOptions = {
                from: EMAIL_SERVER,
                to: email,
                subject: 'Código de verificação EmpreGo (reenvio).',
                text: `Seu código de verificação é: ${codigo}`
            }

            await transporter.sendMail(emailOptions);

            res.status(200).json({ message: 'Reenvio realizado com sucesso.'})
        }
        catch(erro){
            if(erro.code==='P2025'){
                return res.status(404).json({ error: 'Email fornecido não está aguardando confirmação.' });
            }
            if (erro instanceof Erros.ErroDeValidacao) {
                return res.status(400).json({ error: erro.message });
            }
            res.status(500).json({ error: `Erro ao reenviar email: ${erro.message}`})
        }
    }

    static async listarTodos(req, res){
        try {
            const candidatos = await CandidatoModel.buscarTodosCandidatos(req.query.limit, req.query.offset);
            res.status(200).json(candidatos);
        } catch (erro) {
            res.status(500).json({ error: `Erro ao buscar usuários: ${erro?.message || "erro desconhecido"}` });
        }
    }

    static async listarTodosPublic(req, res){
        try {
            const candidatos = await CandidatoModel.buscarTodosCandidatosPublic(req.query.page);
            res.status(200).json(candidatos);
        } catch (erro) {
            res.status(500).json({ error: `Erro ao buscar candidatos: ${erro.message}` });
        }
    }

    static async remover(req, res){
        try {
            const { cd } = req.params;
            const { id, nivel } = req.user;

            await CandidatoService.removerCandidato(cd, id, nivel);

            res.status(200).json({ message: "Candidato removido com sucesso" });
        } catch (erro) {
            if (erro instanceof Erros.ErroDeAutorizacao) {
                return res.status(403).json({ error: erro.message });
            }
            if (erro instanceof Erros.ErroDeValidacao){
                return res.status(400).json({ error: erro.message })
            }
            if(erro.code==='P2025'){
                return res.status(404).json({ error: "Candidato fornecido não existe." });
            }
            res.status(500).json({ error: erro.message });
        }
    }
    
}

module.exports = CandidatoController;