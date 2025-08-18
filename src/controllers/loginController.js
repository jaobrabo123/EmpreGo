// * Imports
const bcrypt = require('bcrypt');
const TokenService = require('../services/tokenService.js');
const { limparCookieToken, limparCookieRefreshToken, salvarCookieToken, salvarCookieRefreshToken, validarCookieToken } = require('../utils/cookieUtils.js');
const Erros = require("../utils/erroClasses.js");
const CandidatoModel = require('../models/candidatoModel.js');
const EmpresaModel = require('../models/empresaModel.js');

class LoginController {

    static async logarCandidato(req, res){
        try {
            const { email, senha } = req.body; 
            if (!email || !senha) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

            const lembreMe = req.body.lembreMe ? req.body.lembreMe : false;

            const candidato = await CandidatoModel.loginInfo(email);

            if(!await bcrypt.compare(senha, candidato.senha)) return res.status(401).json({ error: 'Credenciais inválidas.' });

            const tkn = req.cookies.token;
            if (tkn && validarCookieToken(tkn)) {
                await TokenService.removerToken(tkn);
            }

            const token = salvarCookieToken(res, candidato.id, 'candidato', candidato.nivel);
            let expira_em = new Date(Date.now() + 60 * 60 * 1000);
            if(lembreMe) {
                salvarCookieRefreshToken(res, token);
                expira_em = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            };

            await TokenService.adicionarToken(candidato.id, 'candidato', token, expira_em)

            res.status(200).json({ message: 'Logado com sucesso!' });
        } catch (erro) {
            if (erro instanceof Erros.ErroDeValidacao){
                return res.status(400).json({ error: erro.message })
            }
            if(erro.code==='P2025'){
                return res.status(401).json({ error: 'Credenciais inválidas.' });
            }
            res.status(500).json({ error: 'Erro ao fazer login: ' + erro.message });
        }
    }

    static async logarEmpresa(req, res){
        try{
            const { cnpj, senha } = req.body;
            if (!cnpj || !senha) return res.status(400).json({ error: 'CNPJ e senha são obrigatórios' });

            const tkn = req.cookies.token;
            if (tkn && validarCookieToken(tkn)) {
                await TokenService.removerToken(tkn);
            }

            const empresa = await EmpresaModel.loginInfo(cnpj);

            if(!await bcrypt.compare(senha, empresa.senha)) return res.status(401).json({ error: 'Credenciais inválidas.' });

            const token = salvarCookieToken(res, cnpj, 'empresa', 'comum')
            const expira_em = new Date(Date.now() + 60 * 60 * 1000);
            await TokenService.adicionarToken(cnpj, 'empresa', token, expira_em);

            res.status(200).json({ message: 'Logado com sucesso!' });
        }
        catch(erro){
            if (erro instanceof Erros.ErroDeValidacao){
                return res.status(400).json({ error: erro.message })
            }
            if(erro.code==='P2025'){
                return res.status(401).json({ error: 'Credenciais inválidas.' });
            }
            res.status(500).json({ error: 'Erro ao fazer login: ' + erro.message });
        }
    }

    static async deslogar(req, res){
        try{
            
            const tkn = req.cookies.token;
            if (tkn && validarCookieToken(tkn)) {
                await TokenService.removerToken(tkn);
            }

            limparCookieRefreshToken(res);
            limparCookieToken(res);
            
            res.status(200).json({ message: 'Logout realizado com sucesso' });
        }
        catch(erro){
            if (erro instanceof Erros.ErroDeValidacao){
                return res.status(400).json({ error: erro.message })
            }
            console.error(erro)
            res.status(500).json({ error: 'Erro ao remover token: ' + erro.message})
        }
    }

}

module.exports = LoginController;