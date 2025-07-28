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

class ErroDeNaoEncontrado extends Error {
  constructor(message) {
    super(message);
    this.name = 'ErroDeNaoEncontrado';
  }
}

class ErroDeConflito extends Error {
  constructor(message) {
    super(message);
    this.name = 'ErroDeConflito';
  }
}

module.exports = {
  ErroDeValidacao,
  ErroDeAutorizacao,
  ErroDeNaoEncontrado,
  ErroDeConflito
}