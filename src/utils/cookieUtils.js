const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET;

function limparCookieToken(res) {
  res.clearCookie('token', {
   httpOnly: true,
    secure: true,
    sameSite: 'strict' 
  });
}

function salvarCookieToken(res, id, tipo, nivel){
  const token = jwt.sign({ id: id, tipo: tipo, nivel: nivel }, SECRET_KEY, { expiresIn: '1d' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7*24*60*60*1000
  });
  return token;
}

function validarCookieToken(tkn){
  try {
    jwt.verify(tkn, SECRET_KEY);
    return true;
  } catch (erro) {
    return false;
  }
}

module.exports = {
  limparCookieToken,
  salvarCookieToken,
  validarCookieToken
};
