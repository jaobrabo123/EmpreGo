const pool = require('../config/db.js');
const {ErroDeValidacao, ErroDeAutorizacao} = require('../utils/erroClasses.js');

async function popularTabelaExperiencias(titulo, descricao, imagem, id) {

  if (titulo.length > 30) {
    throw new ErroDeValidacao("O título da experiência não pode ter mais de 30 caracteres");
  }

  if (descricao.length > 1500) {
    throw new ErroDeValidacao("A descrição da experiência não pode ter mais de 1500 caracteres");
  }
  
  if (imagem !== "imagem padrão") {
    const prefix = "https://res.cloudinary.com/ddbfifdxd/image/upload/";
    if (imagem && !imagem.startsWith(prefix)) {
      throw new ErroDeValidacao("A imagem da experiência não pode ser atualizado diretamente. Use o upload de arquivo.");
    }
  }

  // Insere a experiência na tabela experiencia_usuario
  await pool.query(`INSERT INTO experiencias (titulo, descricao, imagem, candidato) VALUES ($1, $2, $3, $4)`,
    [titulo, descricao, imagem, id]
  );

}

async function removerExperiencia(xp, id, nivel) {

  if (!xp) throw new ErroDeValidacao("O id da experiência precisa ser fornecido.");

  const resposta = await pool.query(`select candidato from experiencias where id = $1`, [xp]);

  const experiencia = resposta.rows[0];

  if (!experiencia) {
    throw new ErroDeValidacao("Experiência não encontrada.");
  }

  if (nivel !== "admin" && id !== experiencia.candidato) {
    throw new ErroDeAutorizacao("A experiência só pode ser removida pelo dono dela.");
  }

  await pool.query(`delete from experiencias where id = $1`, [xp]);

}

module.exports = {
  popularTabelaExperiencias,
  removerExperiencia,
}