//Imports
const jwt = require('jsonwebtoken');
const { limparCookieToken } = require('../utils/cookieUtils.js');
const TokenModel = require('../models/tokenModel.js');

// Chave secreta para o JWT
const SECRET_KEY = process.env.JWT_SECRET;

// Autenticação JWT
async function authenticateToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ error: 'Você não está logado.' });

  jwt.verify(token, SECRET_KEY, async (err, user) => {
    if (err) {
      limparCookieToken(res)

      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ error: 'Sessão expirada, faça login novamente.' });
      }

      return res.status(403).json({ error: 'Token inválido.' });
    }

    try {
      const resultado = await TokenModel.verificarTokenExistente(token);

      if(!resultado) {
        limparCookieToken(res)
        return res.status(403).json({ error: 'Token inválido.' });
      }

      if (resultado <= new Date()) {
        limparCookieToken(res)
        return res.status(403).json({ error: 'Sessão expirada, faça login novamente.' });
      }

      req.user = user;
      req.token = token;
      next();
    } catch (erro) {
      return res.status(500).json({ error: 'Erro na verificação do token: ' + erro.message });
    }
  });
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