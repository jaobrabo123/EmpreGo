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

function salvarCookieToken(res, id, tipo, nivel, nome){
  const token = jwt.sign({ id: id, tipo: tipo, nivel: nivel, nome: nome }, SECRET_KEY, { expiresIn: '5s' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7*24*60*60*1000
  });
  return token;
}

function salvarCookieRefreshToken(res, acessToken){
  const refreshToken = jwt.sign({ acessToken }, SECRET_KEY, { expiresIn: '7d' });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7*24*60*60*1000
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

function salvarCookieFoto(res, foto){
  res.cookie('foto_perfil', foto, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 10*60*1000
  })
}

function limparCookieFoto(res) {
  res.clearCookie('foto_perfil', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict' 
  });
}

module.exports = {
  limparCookieToken,
  limparCookieRefreshToken,
  salvarCookieToken,
  salvarCookieRefreshToken,
  validarCookieToken,
  salvarCookieFoto,
  limparCookieFoto
}