const pool = require("../config/db.js");
const { ErroDeValidacao, ErroDeAutorizacao } = require("../utils/erroClasses.js");

async function popularTabelaTags(nome, id) {
  if (nome.length > 25) {
    throw new ErroDeValidacao("O nome da tag não pode ter mais de 25 caracteres");
  }

  await pool.query(`INSERT INTO tags (nome, candidato) VALUES ($1, $2)`, [ nome, id, ]);

}

async function removerTag(id, idCandidato, tipo) {
  
  if (!id) throw new ErroDeValidacao("O id da tag precisa ser fornecido.");

  const resposta = await pool.query(`select candidato from tags where id = $1`, [id]);

  const tag = resposta.rows[0];

  if (!tag) {
    throw new ErroDeValidacao("Tag não encontrada.");
  }

  if (tipo !== "admin" && idCandidato !== tag.candidato) {
    throw new ErroDeAutorizacao("A tag só pode ser removida pelo dono dela.");
  }

  await pool.query(`delete from tags where id = $1`, [id]);

}

module.exports = {
  popularTabelaTags,
  removerTag
}