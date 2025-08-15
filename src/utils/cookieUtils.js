const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET;

function limparCookieToken(res) {
  res.clearCookie('token', {
   httpOnly: true,
    secure: true,
    sameSite: 'strict' 
  });
}

function limparCookieRefreshToken(res) {
  res.clearCookie('refreshToken', {
   httpOnly: true,
    secure: true,
    sameSite: 'strict' 
  });
}

function salvarCookieToken(res, id, tipo, nivel){
  const token = jwt.sign({ id: id, tipo: tipo, nivel: nivel }, SECRET_KEY, { expiresIn: '1h' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 30*24*60*60*1000
  });
  return token;
}

function salvarCookieRefreshToken(res, acessToken){
  const refreshToken = jwt.sign({ acessToken }, SECRET_KEY, { expiresIn: '30d' });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 30*24*60*60*1000
  })
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
  limparCookieRefreshToken,
  salvarCookieToken,
  salvarCookieRefreshToken,
  validarCookieToken,
};
