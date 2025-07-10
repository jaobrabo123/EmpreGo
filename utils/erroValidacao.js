class ErroDeValidacao extends Error {
  constructor(message) {
    super(message);
    this.name = 'ErroDeValidacao';
  }
}

module.exports = ErroDeValidacao