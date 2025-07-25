const bcrypt = require("bcryptjs");
const pool = require("../config/db.js");
const  { ErroDeValidacao, ErroDeAutorizacao } = require("../utils/erroClasses.js");

async function popularTabelaCandidatosPendentes(nome, email, senha, genero, data_nasc, codigo, expira_em) {

  if (senha.length < 8) {
    throw new ErroDeValidacao("A senha deve ter pelo menos 8 caracteres");
  }

  if (nome.length > 100) {
    throw new ErroDeValidacao("O nome do usuário não pode ter mais de 100 caracteres");
  }

  if (genero.length > 30) {
    throw new ErroDeValidacao("O gênero não pode conter mais de 20 caracteres");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ErroDeValidacao("O e-mail não é válido");
  }

  const hoje = new Date();
  const nascimento = new Date(data_nasc);
  const idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  const dia = hoje.getDate() - nascimento.getDate();

  const tem14Anos = idade > 14 || (idade === 14 && (mes > 0 || (mes === 0 && dia >= 0)));

  if (!tem14Anos) {
    throw new ErroDeValidacao("Você precisa ter no mínimo 14 anos para se cadastrar.");
  }

  //criptografa a senha
  const senhaCriptografada = await bcrypt.hash(senha, 10);

  await pool.query(
    `INSERT INTO candidatos_pend (nome, email, senha, genero, data_nasc, codigo, expira_em) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [nome, email, senhaCriptografada, genero, data_nasc, codigo, expira_em]
  );

}

async function popularTabelaCandidatos(candidato, codigo){

  if (!candidato||!codigo) {
    throw new ErroDeValidacao("Codigo inválido ou candidato não encontrado.");
  }

  if(!candidato.nome || !candidato.email || !candidato.senha || !candidato.genero || !candidato.data_nasc){
    throw new ErroDeValidacao("Dados faltando.");
  }

  const result = await pool.query(`insert into candidatos (nome, email, senha, genero, data_nasc) values ($1, $2, $3, $4, $5) returning id`,
    [candidato.nome, candidato.email, candidato.senha, candidato.genero, candidato.data_nasc]
  )

  await pool.query(`delete from candidatos_pend where codigo = $1`,
    [codigo]
  )

  return result.rows[0].id;

}

async function editarPerfil(atributos, valores, id) {

  if (!atributos || !valores || !id) {
    throw new ErroDeValidacao("Os atributos, valores e ID do candidato devem ser fornecidos.");
  }

  const colunasPermitidas = [
    "foto",
    "descricao",
    "cpf",
    "estado",
    "cidade",
    "endereco",
    "instagram",
    "github",
    "youtube",
    "twitter",
    "pronomes",
  ];

  const atributosInvalidos = atributos.filter((col) => !colunasPermitidas.includes(col));

  if (atributosInvalidos.length > 0) {
    throw new ErroDeValidacao(`Atributos inválidos detectados: ${atributosInvalidos.join(", ")}`);
  }

  if (atributos.length !== valores.length) {
    throw new ErroDeValidacao("Números de atributos e valores não coincidem.");
  }

  for (let i = 0; i < atributos.length; i++) {
    
    const atri = atributos[i];
    const valor = valores[i];

    if (atri === "foto") {
      const prefix = "https://res.cloudinary.com/ddbfifdxd/image/upload/";
      if (!valor.startsWith(prefix)) {
        throw new ErroDeValidacao(`A foto de perfil não pode ser atualizado diretamente. Use o upload de arquivo.`);
      }
    } else

    if (atri === "cpf" && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(valor)) {
      throw new ErroDeValidacao(`CPF inválido. Formato correto: 123.456.789-10`);
    } else 

    if (atri === "estado" && valor !== "NM") {
      const response = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      const estados = await response.json();
      const siglas = estados.map((e) => e.sigla.toUpperCase());

      if (!siglas.includes(valor.toUpperCase())) {
        throw new ErroDeValidacao(`Estado inválido. Use uma sigla válida.`);
      }
      if (atributos.findIndex((x) => x === "cidade") === -1) {
        await pool.query("UPDATE candidatos SET cidade = null WHERE id = $1", [id]);
      }
    } else 
      
    if (atri === "cidade") {
      let estado = "";

      const resultado = await pool.query("SELECT estado FROM candidatos WHERE id = $1",[id]);

      if (atributos.findIndex(x => x === "estado") !== -1) {
        const indexEstado = atributos.findIndex((x) => x === "estado");
        estado = valores[indexEstado];
      } else if (resultado.rows.length > 0 && resultado.rows[0].estado) {
        estado = resultado.rows[0].estado;
      } else {
        throw new ErroDeValidacao(`Você deve fornecer o estado antes de atualizar a cidade.`);
      }

      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`);
      const cidades = await response.json();
      const nomesCidades = cidades.map((c) => c.nome.toLowerCase());

      if (!nomesCidades.includes(valor.toLowerCase())) {
        throw new ErroDeValidacao(`Cidade inválida para o estado ${estado}.`);
      }

    } else 
      
    if (atri === "endereco" && valor.length > 200) {
      throw new ErroDeValidacao(`Endereço não pode exceder 200 caracteres.`);
    } else 
      
    if (atri === "descricao" && valor.length > 2000) {
      throw new ErroDeValidacao(`Descrição não pode exceder 2000 caracteres.`);
    } else 
      
    if (atri === "instagram" && !/^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._-]+\/?$/.test(valor)) {
      throw new ErroDeValidacao(`URL do Instagram inválida.`);
    } else 
      
    if (atri === "github" && !/^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9._-]+\/?$/.test(valor)) {
      throw new ErroDeValidacao(`URL do GitHub inválida.`);
    } else 
      
    if (atri === "youtube" && !/^https?:\/\/(www\.)?youtube\.com\/(@[a-zA-Z0-9._-]+)(\/)?(\?.*)?$/.test(valor)) {
      throw new ErroDeValidacao(`URL do YouTube inválida.`);
    } else 
      
    if (atri === "twitter" && !/^https?:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9._-]+\/?$/.test(valor)) {
      throw new ErroDeValidacao(`URL do Twitter inválida.`);
    } else
      
    if (atri === "pronomes" && valor.length > 20) {
      throw new ErroDeValidacao(`Pronomes não podem exceder 20 caracteres.`);
    }

  }

  const pedido = atributos.map((coluna, index) => `${coluna} = $${index + 1}`);
  const pedidoForm = pedido.join(", ");

  const query = `UPDATE candidatos SET ${pedidoForm} WHERE id = $${atributos.length + 1}`;

  const valoresComId = [...valores, id];

  await pool.query(query, valoresComId);

}

async function removerCandidato(cd, id, nivel) {

  if(!cd || !id || !nivel){
    throw new ErroDeValidacao('Informações faltando para a remoção.')
  }

  cd = Number(cd);

  if(nivel!=='admin'&& cd!==id){
    throw new ErroDeAutorizacao("Apenas o próprio candidato pode se remover.");
  }

  if(nivel==='admin'){
    if(cd===id){
      throw new ErroDeAutorizacao('Você não pode se remover kkkkkkkk')
    }else{
      const resultado = await pool.query('select nivel from candidatos where id = $1',[cd])
      const niv = resultado.rows[0].nivel;
      if (niv === 'admin') throw new ErroDeAutorizacao('Você não pode remover outro admin.');
    }
    
  }

  const chatsCandidato = await pool.query(
    `select id from chats where candidato = $1`,
    [cd]
  );

  await Promise.all(
    chatsCandidato.rows.map(chat =>
      pool.query('delete from mensagens where chat = $1', [chat.id])
    )
  )

  await Promise.all([
    pool.query(`delete from tokens where candidato_id = $1`, [cd]),
    pool.query(`delete from chats where candidato = $1`, [cd]),
    pool.query(`delete from tags where candidato = $1`, [cd]),
    pool.query(`delete from experiencias where candidato = $1`, [cd])
  ])

  await pool.query(`delete from candidatos where id = $1`, [cd]);

}

module.exports = {
  popularTabelaCandidatos,
  popularTabelaCandidatosPendentes,
  editarPerfil,
  removerCandidato
}