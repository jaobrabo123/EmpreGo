class ErroDeValidacao extends Error {
  constructor(message) {
    super(message);
    this.name = 'ErroDeValidacao';
  }
}

class ErroDeAutorizacao extends Error {
  constructor(message) {
    super(message);
    this.name = 'ErroDeAutorizacao';
  }
}

module.exports = {
  ErroDeValidacao,
  ErroDeAutorizacao
}