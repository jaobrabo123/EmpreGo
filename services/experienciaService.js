const pool = require('../config/db.js');
const {ErroDeValidacao, ErroDeAutorizacao} = require('../utils/erroClasses.js');
const ValidarCampos = require('../utils/validarCampos.js');
const ExperienciaModel = require('../models/experienciaModel.js')

class ExperienciaService {

  static async popularTabelaExperiencias(titulo, descricao, imagem, id){

    ValidarCampos.validarTamanhoMax(titulo, 30, 'Título');
    ValidarCampos.validarTamanhoMax(descricao, 1500, 'Descrição');
    if (imagem !== "imagem padrão") {
      ValidarCampos.validarImagemNoCloudinary(imagem);
    }

    titulo = titulo.trim();
    descricao = descricao.trim();   

    await pool.query(`INSERT INTO experiencias (titulo, descricao, imagem, candidato) VALUES ($1, $2, $3, $4)`,
      [titulo, descricao, imagem, id]
    );
  }

  static async removerExperiencia(xp, id, nivel){
    if (!xp) throw new ErroDeValidacao("O id da experiência precisa ser fornecido.");

    xp = Number(xp);

    const candidato = await ExperienciaModel.buscarCandidatoPorExperienciaId(xp);

    if (!candidato) {
      throw new ErroDeValidacao("Experiência não encontrada.");
    }

    if (nivel !== "admin" && id !== candidato) {
      throw new ErroDeAutorizacao("A experiência só pode ser removida pelo dono dela.");
    }

    await pool.query(`delete from experiencias where id = $1`, [xp]);
  }

}

module.exports = ExperienciaService;