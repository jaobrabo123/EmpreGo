function limparCookieToken(res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  });
}

module.exports = {
    limparCookieToken
};
