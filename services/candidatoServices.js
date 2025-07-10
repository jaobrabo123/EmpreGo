const bcrypt = require('bcryptjs');
const pool = require('../config/db.js');
const ErroDeValidacao = require('../utils/erroValidacao.js');



async function popularTabelaCandidatos(nome, email, senha, genero, data_nasc) {

  if(senha.length < 8) {
    throw new ErroDeValidacao('A senha deve ter pelo menos 8 caracteres');
  }

  //criptografa a senha
  const senhaCripitografada = await bcrypt.hash(senha, 10);

  if(nome.length>100){
    throw new ErroDeValidacao('O nome do usuário não pode ter mais de 100 caracteres');
  }

  if(genero.length>30){
    throw new ErroDeValidacao('O gênero não pode conter mais de 20 caracteres');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ErroDeValidacao('O e-mail não é válido');
  }

  const hoje = new Date();
  const nascimento = new Date(data_nasc);
  const idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  const dia = hoje.getDate() - nascimento.getDate();

  const tem14Anos = idade > 14 || (idade === 14 && (mes > 0 || (mes === 0 && dia >= 0)));

  if (!tem14Anos) {
    throw new ErroDeValidacao('Você precisa ter no mínimo 14 anos para se cadastrar.');
  }

  //insere os dados na tabela cadastro_usuarios
  await pool.query(
      `INSERT INTO candidatos (nome, email, senha, genero, data_nasc) VALUES ($1, $2, $3, $4, $5)`,
      [nome, email, senhaCripitografada, genero, data_nasc]
  );

}



async function editarPerfil(atributos, valores, id) {

  const colunasPermitidas = ['foto','descricao','cpf','estado','cidade','endereco','instagram','github','youtube','twitter','pronomes'];

  const atributosInvalidos = atributos.filter(col => !colunasPermitidas.includes(col));
  if (atributosInvalidos.length > 0) {
    throw new ErroDeValidacao(`Atributos inválidos detectados: ${atributosInvalidos.join(', ')}`);
  }

  if(atributos.length !== valores.length) {
    throw new ErroDeValidacao('Números de atributos e valores não coincidem.');
  }

  for (let i = 0; i < atributos.length; i++) {
    const atri = atributos[i];
    const valor = valores[i];

    if (atri === 'foto') {
      const prefix = 'https://res.cloudinary.com/ddbfifdxd/image/upload/';
      if (!valor.startsWith(prefix)) {
        throw new ErroDeValidacao(`A foto de perfil não pode ser atualizado diretamente. Use o upload de arquivo.`);
      }
    } else
    if (atri === 'cpf' && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(valor)) {
      throw new ErroDeValidacao(`CPF inválido. Formato correto: 123.456.789-10`);
    } else
    if (atri === 'estado' && valor !== 'NM') {
      const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
      const estados = await response.json();
      const siglas = estados.map(e => e.sigla.toUpperCase());
      if (!siglas.includes(valor.toUpperCase())) {
        throw new ErroDeValidacao(`Estado inválido. Use uma sigla válida.`);
      }
      if(atributos.findIndex(x => x === 'cidade') === -1){
        await pool.query('UPDATE candidatos SET cidade = null WHERE id = $1', [id]);
      }
    } else
    if (atri === 'cidade') {
      let estado = '';
      const resultado = await pool.query(
        'SELECT estado FROM candidatos WHERE id = $1',
        [id]
      );
      if(atributos.findIndex(x => x === 'estado') !== -1) {
        const indexEstado = atributos.findIndex(x => x === 'estado');
        estado = valores[indexEstado];
      } else if (resultado.rows.length > 0 && resultado.rows[0].estado) {
        estado = resultado.rows[0].estado;
      } else {
        throw new ErroDeValidacao(`Você deve fornecer o estado antes de atualizar a cidade.`);
      }
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`);
      const cidades = await response.json();
      const nomesCidades = cidades.map(c => c.nome.toLowerCase());
      if (!nomesCidades.includes(valor.toLowerCase())) {
        throw new ErroDeValidacao(`Cidade inválida para o estado ${estado}.`);
      }
    } else
    if (atri === 'endereco' && valor.length > 200) {
      throw new ErroDeValidacao(`Endereço não pode exceder 200 caracteres.`);
    } else
    if (atri === 'descricao' && valor.length > 2000) {
      throw new ErroDeValidacao(`Descrição não pode exceder 2000 caracteres.`);
    } else
    if (atri === 'instagram' && !/^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._-]+\/?$/.test(valor)) {
      throw new ErroDeValidacao(`URL do Instagram inválida.`);
    } else
    if (atri === 'github' && !/^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9._-]+\/?$/.test(valor)) {
      throw new ErroDeValidacao(`URL do GitHub inválida.`);
    } else
    if (atri === 'youtube' && !/^https?:\/\/(www\.)?youtube\.com\/(@[a-zA-Z0-9._-]+)(\/)?(\?.*)?$/.test(valor)) {
      throw new ErroDeValidacao(`URL do YouTube inválida.`);
    } else
    if (atri === 'twitter' && !/^https?:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9._-]+\/?$/.test(valor)) {
      throw new ErroDeValidacao(`URL do Twitter inválida.`);
    } else
    if (atri === 'pronomes' && valor.length > 20) {
      throw new ErroDeValidacao(`Pronomes não podem exceder 20 caracteres.`);
    }
  }

  const pedido = atributos.map((coluna, index) => `${coluna} = $${index + 1}`);
  const pedidoForm = pedido.join(', ');

  const query = `UPDATE candidatos SET ${pedidoForm} WHERE id = $${atributos.length + 1}`;

  const valoresComId = [...valores, id];

  await pool.query(query, valoresComId);

}

module.exports = {
    popularTabelaCandidatos,
    editarPerfil
}