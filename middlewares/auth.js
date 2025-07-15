//Imports
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

//Dotenv
dotenv.config();

// Chave secreta para o JWT
const SECRET_KEY = process.env.JWT_SECRET;

// Autenticação JWT
function authenticateToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ error: 'Você não está logado.' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
      });

      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ error: 'Sessão expirada, faça login novamente.' });
      }

      return res.status(403).json({ error: 'Token inválido.' });
    }
    
    req.user = user;
    next();
  });
}

function apenasEmpresa(req,res,next) {
  if(req.user?.tipo==='empresa') return next()
  return res.status(403).json({ error: 'Acesso apenas para empresas' });
}

function apenasCandidatos(req,res,next) {
  if(req.user?.tipo==='candidato'||req.user?.tipo==='admin') return next()
  return res.status(403).json({ error: 'Acesso apenas para candidatos' });
}

function apenasAdmins(req, res, next) {
  if(req.user?.tipo==='admin') return next()
  return res.status(403).json({ error: 'Acesso apenas para ADMINS' });
}

module.exports = {
  authenticateToken,
  apenasEmpresa,
  apenasCandidatos,
  apenasAdmins
}