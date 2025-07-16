const pool = require("../config/db.js");
const { ErroDeValidacao, ErroDeAutorizacao } = require("../utils/erroClasses.js");

async function popularTabelaTags(nome, id) {
  if (nome.length > 25) {
    throw new ErroDeValidacao("O nome da tag não pode ter mais de 25 caracteres");
  }

  await pool.query(`INSERT INTO tags (nome, candidato) VALUES ($1, $2)`, [ nome, id, ]);

}

async function removerTag(tg, id, nivel) {
  
  if (!tg) throw new ErroDeValidacao("O id da tag precisa ser fornecido.");

  const resposta = await pool.query(`select candidato from tags where id = $1`, [tg]);

  const tag = resposta.rows[0];

  if (!tag) {
    throw new ErroDeValidacao("Tag não encontrada.");
  }

  if (nivel !== "admin" && id !== tag.candidato) {
    throw new ErroDeAutorizacao("A tag só pode ser removida pelo dono dela.");
  }

  await pool.query(`delete from tags where id = $1`, [tg]);

}

module.exports = {
  popularTabelaTags,
  removerTag
}