const bcrypt = require("bcryptjs");
const pool = require("../config/db.js");
const CandidatoModel = require('../models/candidatoModel.js');
const ChatModel = require('../models/chatModel.js');
const ValidarCampos = require('../utils/validarCampos.js');
const Erros = require("../utils/erroClasses.js");

class CandidatoService{
  
  static async popularTabelaCandidatosPendentes(nome, email, senha, genero, data_nasc, codigo, expira_em){

    ValidarCampos.validarTamanhoMin(senha, 8, 'Senha');
    ValidarCampos.validarTamanhoMax(nome, 100, 'Nome');
    ValidarCampos.validarTamanhoMax(genero, 30, 'Gênero');
    ValidarCampos.validarEmail(email);
    ValidarCampos.validarIdade(data_nasc, 14, 120, 'Data de Nascimento');
    nome = nome.trim();
    email = email.trim();
    senha = senha.trim();
    genero = genero.trim();

    const emailExistente = await CandidatoModel.verificarEmailExistente(email);
    if (emailExistente) throw new Erros.ErroDeConflito('Email já cadastrado.');

    const emailPendente = await CandidatoModel.verificarEmailPendente(email);
    if (emailPendente) throw new Erros.ErroDeConflito("Email aguardando confirmação.");

    //criptografa a senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    await pool.query(
      `INSERT INTO candidatos_pend (nome, email, senha, genero, data_nasc, codigo, expira_em) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [nome, email, senhaCriptografada, genero, data_nasc, codigo, expira_em]
    );

  }

  static async popularTabelaCandidatos(codigo){
    const candidato = await CandidatoModel.buscarCandidatoPendentePorCodigo(codigo);

    if(!candidato) throw new Erros.ErroDeNaoEncontrado("Código inválido ou expirado.");

    const result = await pool.query(`insert into candidatos (nome, email, senha, genero, data_nasc) values ($1, $2, $3, $4, $5) returning id`,
      [candidato.nome, candidato.email, candidato.senha, candidato.genero, candidato.data_nasc]
    )

    await pool.query(`delete from candidatos_pend where codigo = $1`,
      [codigo]
    )

    return result.rows[0].id;
  }

  static async gerarNovoCodigoPendente(email){
    ValidarCampos.validarEmail(email);

    const existe = await CandidatoModel.verificarEmailPendente(email);
    if(!existe) return false;

    const codigo = Math.floor(Math.random() * 9000) + 1000;

    await pool.query(`
      update candidatos_pend set codigo = $1 where email = $2
    `, [codigo, email]);

    return codigo;
  }

  static async editarPerfil(atributos, valores, id){
    if (atributos.length === 0 || valores.length === 0 || !id) {
      throw new Erros.ErroDeValidacao("Os atributos, valores e id do candidato devem ser fornecidos.");
    }

    const colunasPermitidas = [
      "foto",
      "descricao",
      "cpf",
      "estado",
      "cidade",
      "instagram",
      "github",
      "youtube",
      "twitter",
      "pronomes",
    ];

    const atributosInvalidos = atributos.filter((col) => !colunasPermitidas.includes(col));

    if (atributosInvalidos.length > 0) {
      throw new Erros.ErroDeValidacao(`Atributos inválidos detectados: ${atributosInvalidos.join(", ")}`);
    }

    if (atributos.length !== valores.length) {
      throw new Erros.ErroDeValidacao("Números de atributos e valores não coincidem.");
    }

    for (let i = 0; i < atributos.length; i++) {
      
      const atri = atributos[i];
      let valor = valores[i];

      if (atri === "foto") {
        ValidarCampos.validarImagemNoCloudinary(valor);
      }
      else if (atri === "cpf") {
        ValidarCampos.validarCpf(valor);
        valor = valor.replace(/[^\d]/g, '').trim();
      }
      else if (atri === "estado" && valor !== "NM") {
        await ValidarCampos.validarEstadoSigla(valor);
        valor = valor.toUpperCase();
        if (atributos.findIndex((x) => x === "cidade") === -1) {
          await pool.query("UPDATE candidatos SET cidade = null WHERE id = $1", [id]);
        }
      } 
      else if (atri === "cidade") {
        let estado = "";
        if (atributos.findIndex(x => x === "estado") !== -1) {
          const indexEstado = atributos.findIndex((x) => x === "estado");
          estado = valores[indexEstado].toUpperCase();
        } 
        else {
          const resultado = await CandidatoModel.buscarEstadoPorId(id);
          if (!resultado) {
            throw new Erros.ErroDeValidacao(`Você deve fornecer o estado antes de atualizar a cidade.`);
          }
          estado = resultado;
        }
        await ValidarCampos.validarCidadePorEstadoSigla(valor, estado);
        valor = valor.trim();
      }
      else if (atri === "descricao") {
        ValidarCampos.validarTamanhoMax(valor, 2000, 'Descrição');
        valor = valor.trim();
      } 
      else if (atri === "instagram") {
        ValidarCampos.validarLink(valor, 'i');
        valor = valor.trim();
      } 
      else if (atri === "github") {
        ValidarCampos.validarLink(valor, 'g');
        valor = valor.trim();
      } 
      else if (atri === "youtube") {
        ValidarCampos.validarLink(valor, 'y');
        valor = valor.trim();
      } 
      else if (atri === "twitter") {
        ValidarCampos.validarLink(valor, 'x');
        valor = valor.trim();
      } 
      else if (atri === "pronomes") {
        ValidarCampos.validarTamanhoMax(valor, 20, 'Pronomes');
      }
      valores[i] = valor;
    }

    const pedido = atributos.map((coluna, index) => `${coluna} = $${index + 1}`);
    const pedidoForm = pedido.join(", ");

    const query = `UPDATE candidatos SET ${pedidoForm} WHERE id = $${atributos.length + 1}`;

    const valoresComId = [...valores, id];

    await pool.query(query, valoresComId);
  }

  static async removerCandidato(cd, id, nivel){
    if(!cd || !id || !nivel){
      throw new Erros.ErroDeValidacao('Informações faltando para a remoção.')
    }

    cd = Number(cd);

    if(nivel!=='admin'&& cd!==id){
      throw new Erros.ErroDeAutorizacao("Apenas o próprio candidato pode se remover.");
    }

    const candidatoExistente = await CandidatoModel.verificarIdExistente(cd);
    if(!candidatoExistente) throw new Erros.ErroDeNaoEncontrado('Candidato fornecido não existe.')

    if(nivel==='admin'){
      if(cd===id){
        throw new Erros.ErroDeAutorizacao('Você não pode se remover kkkkkkkk');
      }else{
        const candidatoNivel = await CandidatoModel.buscarNivelPorId(cd);
        if (candidatoNivel === 'admin') throw new Erros.ErroDeAutorizacao('Você não pode remover outro admin.');
      }
      
    }

    const chatsCandidato = await ChatModel.buscarChatsPorCandidato(cd);

    await Promise.all(
      chatsCandidato.map(chat =>
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

}

module.exports = CandidatoService;