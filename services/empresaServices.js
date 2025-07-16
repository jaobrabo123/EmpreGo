const bcrypt = require("bcryptjs");
const pool = require('../config/db.js');
const {ErroDeValidacao} = require('../utils/erroClasses.js');

async function popularTabelaEmpresas(cnpj, nome_fant, telefone, email, senha, razao_soci, cep, complemento, num) {

  if (senha.length < 8) {
    throw new ErroDeValidacao("A senha deve ter pelo menos 8 caracteres");
  }

  const senhaCripitografada = await bcrypt.hash(senha, 10);

  if (!/^\d{14}$/.test(cnpj)) {
    throw new ErroDeValidacao("CNPJ inválido. Deve conter 14 dígitos numéricos.");
  }

  if (nome_fant.length > 50) {
    throw new ErroDeValidacao("O nome da empresa não pode ter mais de 50 caracteres");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ErroDeValidacao("O e-mail não é válido");
  }

  if (razao_soci.length > 100) {
    throw new ErroDeValidacao("A razão social não pode ter mais de 100 caracteres");
  }

  const cepLimpo = cep.replace(/[^\d]/g, "");
  if (cepLimpo.length !== 8) {
    throw new ErroDeValidacao("CEP inválido. Deve conter 8 dígitos numéricos.");
  }

  if (complemento.length > 100) {
    throw new ErroDeValidacao("O complemento não pode ter mais de 100 caracteres");
  }

  if (num.length < 1 || num.length > 10) {
    throw new ErroDeValidacao("Número do endereço inválido");
  }

  const telefoneLimpo = telefone.replace(/[^\d]/g, "");
  if (telefoneLimpo.length < 12 || telefoneLimpo.length > 13) {
    throw new ErroDeValidacao("Telefone inválido. Deve conter entre 12 e 13 dígitos com DDI.");
  }

  await pool.query(
    `INSERT INTO empresas 
     (cnpj, nome_fant, telefone, email, senha, razao_soci, cep, complemento, numero) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [cnpj, nome_fant, telefoneLimpo, email, senhaCripitografada, razao_soci, cepLimpo, complemento, num]
  );

}

async function editarPerfilEmpresa(atributos, valores, cnpj) {

  if (!atributos || !valores || !cnpj) {
    throw new ErroDeValidacao("Os atributos, valores e CNPJ da empresa devem ser fornecidos.");
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
    throw new ErroDeValidacao(`Atributos inválidos detectados: ${atributosInvalidos.join(", ")}`);
  }

  if (atributos.length !== valores.length) {
    throw new ErroDeValidacao("Números de atributos e valores não coincidem.");
  }

  for (let i = 0; i < atributos.length; i++) {
    const atributo = atributos[i];
    const valor = valores[i];

    if (atributo === "descricao" && valor.length > 2000) {
      throw new ErroDeValidacao("A descrição da empresa não pode conter mais de 2000 caracteres.");
    } else

    if (atributo === "setor" && valor.length > 70) {
      throw new ErroDeValidacao("O setor da empresa não pode conter mais de 70 caracteres.");
    } else

    if (atributo === "porte" && valor.length > 30) {
      throw new ErroDeValidacao("O porte da empresa não pode conter mais de 30 caracteres.");
    } else

    if (atributo === "contato" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
      throw new ErroDeValidacao("E-mail de contato inválido.");
    } else

    if (atributo === "site" && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(valor)) {
      throw new ErroDeValidacao("URL do site da empresa inválida.");
    } else

    if (atributo === "instagram" && !/^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._-]+\/?$/.test(valor)) {
      throw new ErroDeValidacao("URL do Instagram da empresa inválida.");
    } else

    if (atributo === "github" && !/^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9._-]+\/?$/.test(valor)) {
      throw new ErroDeValidacao("URL do GitHub da empresa inválida.");
    } else

    if (atributo === "youtube" && !/^https?:\/\/(www\.)?youtube\.com\/(@[a-zA-Z0-9._-]+)(\/)?(\?.*)?$/.test(valor)) {
      throw new ErroDeValidacao("URL do YouTube da empresa inválida.");
    } else

    if (atributo === "twitter" && !/^https?:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9._-]+\/?$/.test(valor)) {
      throw new ErroDeValidacao("URL do Twitter da empresa inválida.");
    } else 
    
    if (atributo === "foto") {
      const prefix = "https://res.cloudinary.com/ddbfifdxd/image/upload/";
      if (!valor.startsWith(prefix)) {
        throw new ErroDeValidacao("A foto da empresa não pode ser atualizada diretamente. Use o upload de arquivo.");
      }
    } else

    if (atributo === "data_fund") {
      const data = new Date(valor);
      if (isNaN(data.getTime())) {
        throw new ErroDeValidacao("Data de fundação da empresa inválida.");
      }
      const hoje = new Date();
      if (data > hoje) {
        throw new ErroDeValidacao("A data de fundação da empresa não pode ser no futuro.");
      }
    }

  }

  const inserts = atributos.map((atri, index) => `${atri} = $${index + 1}`).join(", ");

  await pool.query(`update empresas set ${inserts} where cnpj = $${atributos.length + 1}`, [...valores, cnpj]);

}

async function removerEmpresa(cnpj) {

  const chatsEmpresa = await pool.query(`select id from chats where empresa = $1`, [cnpj]);

  for (let i = 0; i < chatsEmpresa.rows.length; i++) {

    await pool.query(`DELETE FROM mensagens WHERE chat = $1`, [chatsEmpresa.rows[i].id,]);

  }

  await pool.query(`delete from tokens where empresa_cnpj = $1`, [cnpj])
  await pool.query(`delete from chats where empresa = $1`, [cnpj]);
  await pool.query(`delete from empresas where cnpj = $1`, [cnpj]);

}

module.exports = {
  popularTabelaEmpresas,
  editarPerfilEmpresa,
  removerEmpresa
}