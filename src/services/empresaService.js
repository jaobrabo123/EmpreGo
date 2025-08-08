const bcrypt = require("bcrypt");
const pool = require('../config/db.js');
const Erros = require('../utils/erroClasses.js');
const ValidarCampos = require('../utils/validarCampos.js');
const EmpresaModel = require("../models/empresaModel.js");
const ChatModel = require('../models/chatModel.js');

class EmpresaService{

  static async popularTabelaEmpresas(cnpj, nome_fant, telefone, email, senha, razao_soci, cep, complemento, num, estado, cidade){

    ValidarCampos.validarTamanhoMin(senha, 8, 'Senha');
    ValidarCampos.validarCnpj(cnpj);
    ValidarCampos.validarTamanhoMax(nome_fant, 50, 'Nome Fantasia');
    ValidarCampos.validarEmail(email);
    ValidarCampos.validarTamanhoMax(razao_soci, 100, 'Razão Social');
    ValidarCampos.validarCep(cep);
    if (complemento!== '') ValidarCampos.validarTamanhoMax(complemento, 100, 'Complemento');
    ValidarCampos.validarTamanhoMin(num, 1, 'Número do Endereço');
    ValidarCampos.validarTamanhoMax(num, 10, 'Número do Endereço');
    ValidarCampos.validarTelefone(telefone);
    await ValidarCampos.validarCidadePorEstadoSigla(cidade, estado);

    senha = senha.trim();
    cnpj = cnpj.replace(/[^\d]/g, '').trim();
    nome_fant = nome_fant.trim();
    email = email.trim();
    razao_soci = razao_soci.trim();
    cep = cep.replace(/[^\d]/g, '').trim();
    complemento = complemento.trim();
    num = num.trim();
    telefone = telefone.replace(/[^\d]/g, '').trim();
    cidade = cidade.trim();

    const empresaExistente = await EmpresaModel.verificarEmpresaExistente(cnpj, email, razao_soci);

    if (empresaExistente) {
      throw new Erros.ErroDeConflito("Empresa já cadastrada.");
    }

    const senhaCripitografada = await bcrypt.hash(senha, 10);

    await pool.query(
      `INSERT INTO empresas 
      (cnpj, nome_fant, telefone, email, senha, razao_soci, cep, complemento, numero, estado, cidade) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [cnpj, nome_fant, telefone, email, senhaCripitografada, razao_soci, cep, complemento, num, estado, cidade]
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
      let valor = valores[i];

      if (atributo === "descricao") {
        ValidarCampos.validarTamanhoMax(valor, 2000, "Descrição");
        valor = valor.trim();
      } 
      else if (atributo === "setor") {
        ValidarCampos.validarTamanhoMax(valor, 70, "Setor");
        valor = valor.trim();
      } 
      else if (atributo === "porte") {
        ValidarCampos.validarTamanhoMax(valor, 30, "Porte");
        valor = valor.trim();
      } 
      else if (atributo === "contato") {
        ValidarCampos.validarEmail(valor);
        valor = valor.trim();
      } 
      else if (atributo === "site") {
        ValidarCampos.validarLink(valor, 'non');
        valor = valor.trim();
      } 
      else if (atributo === "instagram") {
        ValidarCampos.validarLink(valor, 'i');
        valor = valor.trim();
      } 
      else if (atributo === "github") {
        ValidarCampos.validarLink(valor, 'g');
        valor = valor.trim();
      } 
      else if (atributo === "youtube") {
        ValidarCampos.validarLink(valor, 'y');
        valor = valor.trim();
      }
      else if (atributo === "twitter") {
        ValidarCampos.validarLink(valor, 'x');
        valor = valor.trim();
      } 
      else if (atributo === "foto") {
        ValidarCampos.validarImagemNoCloudinary(valor);
      } 
      else if (atributo === "data_fund") {
        ValidarCampos.validarIdade(valor, 0, 9999, 'Data de Fundação');
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

    const chatsEmpresa = await ChatModel.buscarChatsPorEmpresa(em);
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