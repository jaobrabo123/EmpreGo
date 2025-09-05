// * Prisma
const prisma = require('../config/db.js');

const {ErroDeValidacao, ErroDeAutorizacao} = require('../utils/erroClasses.js');
const ValidarCampos = require('../utils/validarCampos.js');
const ExperienciaModel = require('../models/experienciaModel.js')

class ExperienciaService {

  static async popularTabelaExperiencias(titulo, descricao, imagem, id){

    const data = {
      titulo,
      descricao,
      candidato: id
    }

    ValidarCampos.validarTamanhoMax(titulo, 30, 'Título');
    ValidarCampos.validarTamanhoMax(descricao, 1500, 'Descrição');
    if (imagem) {
      ValidarCampos.validarImagemNoCloudinary(imagem);
      data.imagem = imagem;
    }

    titulo = titulo.trim();
    descricao = descricao.trim();   
    
    await prisma.experiencias.create({ data });

  }

  static async removerExperiencia(xp, id, nivel){
    if (!xp) throw new ErroDeValidacao("O id da experiência precisa ser fornecido.");

    xp = Number(xp);

    const candidato = await ExperienciaModel.buscarCandidatoPorExperienciaId(xp);

    if (!candidato) {
      throw new ErroDeValidacao("Experiência não encontrada.");
    };

    if (nivel !== "admin" && id !== candidato) {
      throw new ErroDeAutorizacao("A experiência só pode ser removida pelo dono dela.");
    };

    await prisma.experiencias.delete({
      where: {
        id: xp
      }
    });
  }

}

module.exports = ExperienciaService;