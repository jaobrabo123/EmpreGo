//Imports
const jwt = require('jsonwebtoken');
const { limparCookieToken, limparCookieRefreshToken, salvarCookieToken, salvarCookieRefreshToken } = require('../utils/cookieUtils.js');
const TokenModel = require('../models/tokenModel.js');
const TokenService = require('../services/tokenService.js');

// Chave secreta para o JWT
const SECRET_KEY = process.env.JWT_SECRET;

// Autenticação JWT
async function authenticateToken(req, res, next) {
  
  const acessToken = req.cookies.token;
  if (!acessToken) return res.status(401).json({ error: 'Você não está logado.' });
  let user;
  let token;

  try {

    user = jwt.verify(acessToken, SECRET_KEY);
    token = acessToken

    if(!await TokenModel.verificarTokenExistente(token)) {
      limparCookieToken(res);
      return res.status(403).json({ error: 'Token inválido.' });
    }

  } catch (erro) {
    if(erro.name==='TokenExpiredError'){
      if(!req.cookies.refreshToken) {
        limparCookieToken(res);
        return res.status(403).json({ error: 'Sessão expirada, faça login novamente.' })
      }

      try {

        const refreshTokenDecoded = jwt.verify(req.cookies.refreshToken, SECRET_KEY);
        if(!(refreshTokenDecoded.acessToken===acessToken) || !await TokenModel.verificarTokenExistente(acessToken)) {
          limparCookieToken(res);
          limparCookieRefreshToken(res);
          return res.status(403).json({ error: 'Token inválido.' })
        };

        const acessTokenDecoded = jwt.decode(acessToken);
        token = salvarCookieToken(res, acessTokenDecoded.id, acessTokenDecoded.tipo, acessTokenDecoded.nivel);
        user = jwt.decode(token);
        salvarCookieRefreshToken(res, token);
        const expira_em = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await Promise.all([
          TokenService.adicionarToken(acessTokenDecoded.id, acessTokenDecoded.tipo, token, expira_em),
          TokenService.removerToken(acessToken)
        ])

      } catch (error) {
        limparCookieToken(res);
        limparCookieRefreshToken(res);
        if(error.name==='TokenExpiredError') return res.status(403).json({ error: 'Sessão expirada, faça login novamente.' });
        return res.status(403).json({ error: 'Token inválido.' });
      }

    }
    else{
      limparCookieToken(res);
      return res.status(403).json({ error: 'Token inválido.' });
    }
  }
  req.user = user;
  req.token = token;
  next();
  
}

function apenasEmpresa(req,res,next) {
  if(req.user?.tipo==='empresa'||req.user.nivel==='admin') return next();
  return res.status(403).json({ error: 'Acesso apenas para empresas' });
}

function apenasCandidatos(req,res,next) {
  if(req.user?.tipo==='candidato') return next();
  return res.status(403).json({ error: 'Acesso apenas para candidatos' });
}

function apenasAdmins(req, res, next) {
  if(req.user?.tipo==='candidato'&&req.user.nivel==='admin') return next();
  return res.status(403).json({ error: 'Acesso apenas para ADMINS' });
}

module.exports = {
  authenticateToken,
  apenasEmpresa,
  apenasCandidatos,
  apenasAdmins
}