// * Prisma
const prisma = require('../config/db.js');

const TagModel = require("../models/tagModel.js");
const { ErroDeValidacao, ErroDeAutorizacao } = require("../utils/erroClasses.js");
const ValidarCampos = require('../utils/validarCampos.js');

class TagService {

  static async popularTabelaTags(nome, id) {

    ValidarCampos.validarTamanhoMax(nome, 25, 'Tag');
    nome = nome.trim();

    const idTag = await prisma.tags.create({
      data: {
        nome,
        candidato: id
      }
    });
    return idTag.id;
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

    await prisma.tags.delete({
      where: {
        id: tg
      }
    })
  }

}

module.exports = TagService;