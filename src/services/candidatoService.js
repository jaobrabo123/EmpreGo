// * Prisma
const prisma = require('../config/prisma.js');

const bcrypt = require("bcrypt");
const CandidatoModel = require('../models/candidatoModel.js');
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

    // * Criptografa a senha
    const [ senhaCriptografada, codigoCriptografado ] = await Promise.all([
      bcrypt.hash(senha, 10),
      bcrypt.hash(String(codigo), 10)
    ])

    await prisma.candidatos_pend.create({
      data: {
        nome,
        email,
        senha: senhaCriptografada,
        genero,
        data_nasc,
        codigo: codigoCriptografado,
        expira_em
      }
    });
  }

  static async popularTabelaCandidatos(codigo, email){

    const candidato = await CandidatoModel.buscarCodigoECandidatoPendentePorEmail(email);

    if(!await bcrypt.compare(String(codigo), candidato.codigo)) throw new Erros.ErroDeValidacao("Código inválido ou expirado.");

    const [result, del] = await Promise.all([
      prisma.candidatos.create({
        data: {
          nome: candidato.nome,
          email,
          senha: candidato.senha,
          genero: candidato.genero,
          data_nasc: candidato.data_nasc
        },
        select: {
          id: true
        }
      }),
      prisma.candidatos_pend.delete({
        where: {
          email
        }
      })
    ])


    return result.id;
  }

  static async gerarNovoCodigoPendente(email){
    ValidarCampos.validarEmail(email);

    const codigo = Math.floor(Math.random() * 9000) + 1000;
    const codigoCriptografado = await bcrypt.hash(String(codigo), 10);

    await prisma.candidatos_pend.update({
      where: {
        email
      },
      data: {
        codigo: codigoCriptografado
      }
    });

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
          await prisma.candidatos.update({
            where: {
              id
            },
            data: {
              cidade: null
            }
          });
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

    const data = Object.fromEntries(atributos.map((atri, index)=>[atri, valores[index]]))

    await prisma.candidatos.update({
      where: {
        id
      },
      data
    })
  }

  static async removerCandidato(cd, id, nivel){
    if(!cd || !id || !nivel){
      throw new Erros.ErroDeValidacao('Informações faltando para a remoção.')
    }

    cd = Number(cd);

    if(nivel!=='admin'&& cd!==id){
      throw new Erros.ErroDeAutorizacao("Apenas o próprio candidato pode se remover.");
    }

    if(nivel==='admin'){
      if(cd===id){
        throw new Erros.ErroDeAutorizacao('Você não pode se remover kkkkkkkk');
      }else{
        const candidatoNivel = await CandidatoModel.buscarNivelPorId(cd);
        if (candidatoNivel === 'admin') throw new Erros.ErroDeAutorizacao('Você não pode remover outro admin.');
      }
      
    }

    await prisma.candidatos.delete({
      where: {
        id: cd
      }
    })
  }

}

module.exports = CandidatoService;