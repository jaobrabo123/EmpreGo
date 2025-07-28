const pool = require("../config/db.js");
const TagModel = require("../models/tagModel.js");
const { ErroDeValidacao, ErroDeAutorizacao } = require("../utils/erroClasses.js");
const ValidarCampos = require('../utils/validarCampos.js');

class TagService {

  static async popularTabelaTags(nome, id) {

    ValidarCampos.validarTamanhoMax(nome, 25, 'Tag');
    nome = nome.trim();

    await pool.query(`INSERT INTO tags (nome, candidato) VALUES ($1, $2)`, [ nome, id, ]);
  }

  static async removerTag(tg, id, nivel) {
    if (!tg) throw new ErroDeValidacao("O id da tag precisa ser fornecido.");

    tg = Number(tg);

    const tag = await TagModel.buscarCandidatoPorTagId(tg);

    if (!tag) {
      throw new ErroDeNaoEncontrado("Tag não encontrada.");
    }

    if (nivel !== "admin" && id !== tag) {
      throw new ErroDeAutorizacao("A tag só pode ser removida pelo dono dela.");
    }

    await pool.query(`delete from tags where id = $1`, [tg]);
  }

}

module.exports = TagService;