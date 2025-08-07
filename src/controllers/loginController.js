const bcrypt = require('bcryptjs');
const TokenService = require('../services/tokenService.js');
const { limparCookieToken, salvarCookieToken } = require('../utils/cookieUtils.js');
const Erros = require("../utils/erroClasses.js");
const CandidatoModel = require('../models/candidatoModel.js')
const EmpresaModel = require('../models/empresaModel.js')

class LoginController {

    static async logarCandidato(req, res){
        try {
            const { email, senha } = req.body; 
            if (!email || !senha) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

            const tkn = req.cookies.token;
            if (tkn) {
                await TokenService.removerToken(tkn);
            }

            const candidato = await CandidatoModel.buscarInfoDoTokenPorEmail(email);

            if(candidato && await bcrypt.compare(senha, candidato.senha)){
                const token = salvarCookieToken(res, candidato.id, 'candidato', candidato.nivel)

                const expira_em = new Date(Date.now() + 24 * 60 * 60 * 1000);
                await TokenService.adicionarToken(candidato.id, 'candidato', token, expira_em)

                res.status(200).json({ message: 'Logado com sucesso!' });
            }
            else{
                res.status(401).json({ error: 'Credenciais inválidas.' });
            }
        } catch (error) {
            if (error instanceof Erros.ErroDeValidacao){
                return res.status(400).json({ error: error.message })
            }
            res.status(500).json({ error: 'Erro ao fazer login: ' + error.message });
        }
    }

    static async logarEmpresa(req, res){
        try{
            const { cnpj, senha } = req.body;
            if (!cnpj || !senha) return res.status(400).json({ error: 'CNPJ e senha são obrigatórios' });

            const tkn = req.cookies.token;
            if (tkn) {
                await TokenService.removerToken(tkn);
            }

            const empresa = await EmpresaModel.buscarInfoDoTokenPorCnpj(cnpj);
            if(empresa && await bcrypt.compare(senha, empresa.senha)){
                const token = salvarCookieToken(res, empresa.cnpj, 'empresa', 'comum')

                const expira_em = new Date(Date.now() + 24 * 60 * 60 * 1000);
                await TokenService.adicionarToken(empresa.cnpj, 'empresa', token, expira_em);

                res.status(200).json({ message: 'Logado com sucesso!' });
            }
            else{
                res.status(401).json({ error: 'Credenciais inválidas.' });
            }
        }
        catch(error){
            console.error(error);
            if (error instanceof Erros.ErroDeValidacao){
                return res.status(400).json({ error: error.message })
            }
            res.status(500).json({ error: 'Erro ao fazer login: ' + error.message });
        }
    }

    static async deslogar(req, res){
        try{
            limparCookieToken(res);
            
            const token = req.cookies.token;
            if (token) {
                await TokenService.removerToken(token);
            }
            res.status(200).json({ message: 'Logout realizado com sucesso' });
        }
        catch(erro){
            res.status(500).json({ error: 'Erro ao remover token: ' + erro.message})
        }
    }

}

module.exports = LoginController;