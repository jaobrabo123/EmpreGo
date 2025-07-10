const pool = require('../config/db.js')
const ErroDeValidacao = require('../utils/erroValidacao.js')

async function popularTabelaTags(nome, id) {

  if(nome.length > 25) {
    throw new ErroDeValidacao('O nome da tag não pode ter mais de 25 caracteres');
  }

  // Insere a tag na tabela tags_usuario
  await pool.query(
    `INSERT INTO tags (nome, candidato) VALUES ($1, $2)`,
    [nome, id]
  )

}

module.exports = {
    popularTabelaTags
}