const bcrypt = require("bcryptjs");
const pool = require('../config/db.js');
const Erros = require('../utils/erroClasses.js');
const ValidarCampos = require('../utils/validarCampos.js');
const EmpresaModel = require("../models/empresaModel.js");

class EmpresaService{

  static async popularTabelaEmpresas(cnpj, nome_fant, telefone, email, senha, razao_soci, cep, complemento, num){

    ValidarCampos.validarTamanhoMin(senha, 8, 'Senha');
    ValidarCampos.validarCnpj(cnpj);
    ValidarCampos.validarTamanhoMax(nome_fant, 50, 'Nome Fantasia');
    ValidarCampos.validarEmail(email);
    ValidarCampos.validarTamanhoMax(razao_soci, 100, 'Razão Social');
    ValidarCampos.validarCep(cep);
    ValidarCampos.validarTamanhoMax(complemento, 100, 'Complemento');
    ValidarCampos.validarTamanhoMin(num, 1, 'Número do Endereço');
    ValidarCampos.validarTamanhoMax(num, 10, 'Número do Endereço');
    ValidarCampos.validarTelefone(telefone);

    senha = senha.trim();
    cnpj = cnpj.replace(/[^\d]/g, '').trim();
    nome_fant = nome_fant.trim();
    email = email.trim();
    razao_soci = razao_soci.trim();
    cep = cep.replace(/[^\d]/g, '').trim();
    complemento = complemento.trim();
    num = num.trim();
    telefone = telefone.replace(/[^\d]/g, '').trim();

    const empresaExistente = await EmpresaModel.verificarEmpresaExistente(cnpj, email, razao_soci);

    if (empresaExistente) {
      throw new Erros.ErroDeConflito("Empresa já cadastrada.");
    }

    const senhaCripitografada = await bcrypt.hash(senha, 10);

    await pool.query(
      `INSERT INTO empresas 
      (cnpj, nome_fant, telefone, email, senha, razao_soci, cep, complemento, numero) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [cnpj, nome_fant, telefone, email, senhaCripitografada, razao_soci, cep, complemento, num]
    );

  }

  static async editarPerfilEmpresa(atributos, valores, cnpj){
    if (!atributos || !valores || !cnpj) {
      throw new Erros.ErroDeValidacao("Os atributos, valores e CNPJ da empresa devem ser fornecidos.");
    }

    const colunasPermitidas = [
      "descricao",
      "setor",
      "porte",
      "data_fund",
      "contato",
      "site",
      "instagram",
      "github",
      "youtube",
      "twitter",
      "foto"
    ];

    const atributosInvalidos = atributos.filter(col => !colunasPermitidas.includes(col));

    if (atributosInvalidos.length > 0) {
      throw new Erros.ErroDeValidacao(`Atributos inválidos detectados: ${atributosInvalidos.join(", ")}`);
    }

    if (atributos.length !== valores.length) {
      throw new Erros.ErroDeValidacao("Números de atributos e valores não coincidem.");
    }

    for (let i = 0; i < atributos.length; i++) {
      const atributo = atributos[i];
      const valor = valores[i];

      if (atributo === "descricao" && valor.length > 2000) {
        throw new Erros.ErroDeValidacao("A descrição da empresa não pode conter mais de 2000 caracteres.");
      } else

      if (atributo === "setor" && valor.length > 70) {
        throw new Erros.ErroDeValidacao("O setor da empresa não pode conter mais de 70 caracteres.");
      } else

      if (atributo === "porte" && valor.length > 30) {
        throw new Erros.ErroDeValidacao("O porte da empresa não pode conter mais de 30 caracteres.");
      } else

      if (atributo === "contato" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
        throw new Erros.ErroDeValidacao("E-mail de contato inválido.");
      } else

      if (atributo === "site" && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(valor)) {
        throw new Erros.ErroDeValidacao("URL do site da empresa inválida.");
      } else

      if (atributo === "instagram" && !/^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._-]+\/?$/.test(valor)) {
        throw new Erros.ErroDeValidacao("URL do Instagram da empresa inválida.");
      } else

      if (atributo === "github" && !/^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9._-]+\/?$/.test(valor)) {
        throw new Erros.ErroDeValidacao("URL do GitHub da empresa inválida.");
      } else

      if (atributo === "youtube" && !/^https?:\/\/(www\.)?youtube\.com\/(@[a-zA-Z0-9._-]+)(\/)?(\?.*)?$/.test(valor)) {
        throw new Erros.ErroDeValidacao("URL do YouTube da empresa inválida.");
      } else

      if (atributo === "twitter" && !/^https?:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9._-]+\/?$/.test(valor)) {
        throw new Erros.ErroDeValidacao("URL do Twitter da empresa inválida.");
      } else 
      
      if (atributo === "foto") {
        const prefix = "https://res.cloudinary.com/ddbfifdxd/image/upload/";
        if (!valor.startsWith(prefix)) {
          throw new Erros.ErroDeValidacao("A foto da empresa não pode ser atualizada diretamente. Use o upload de arquivo.");
        }
      } else

      if (atributo === "data_fund") {
        const data = new Date(valor);
        if (isNaN(data.getTime())) {
          throw new Erros.ErroDeValidacao("Data de fundação da empresa inválida.");
        }
        const hoje = new Date();
        if (data > hoje) {
          throw new Erros.ErroDeValidacao("A data de fundação da empresa não pode ser no futuro.");
        }
      }

    }

    const inserts = atributos.map((atri, index) => `${atri} = $${index + 1}`).join(", ");

  await pool.query(`update empresas set ${inserts} where cnpj = $${atributos.length + 1}`, [...valores, cnpj]);
  }

  static async removerEmpresa(em, id, nivel){
    if(!em || !id || !nivel){
      throw new Erros.ErroDeValidacao('Campos faltando para a remoção.')
    }

    em = Number(em);

    if(nivel!=='admin'&& em!==id){
      throw new Erros.ErroDeAutorizacao("Apenas a própria empresa pode se remover.");
    }

    const empresaExistente = await EmpresaModel.verificarCnpjExistente(em);
    if(!empresaExistente) throw new Erros.ErroDeNaoEncontrado('Empresa fornecida não pode ser removida pois não existe.')

    const chatsEmpresa = await EmpresaModel.buscarChatsPorCnpj(em);
    await Promise.all(
      chatsEmpresa.map(chat => 
        pool.query(`delete from mensagens where chat = $1`, [chat.id])
      )
    )

    await Promise.all([
      pool.query(`delete from tokens where empresa_cnpj = $1`, [em]),
      pool.query(`delete from chats where empresa = $1`, [em])
    ])

    await pool.query(`delete from empresas where cnpj = $1`, [em]);
  }

}

module.exports = EmpresaService;