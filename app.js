import bcrypt from 'bcryptjs';

import pool from './db.js';

export async function popularTabelaUsuarios(nome, email, senha, genero, datanasc) {
    
    //criptografa a senha
    const senhaCripitografada = await bcrypt.hash(senha, 10);

    if(nome.length>100){
      throw new Error('O nome do usuário não pode ter mais de 100 caracteres');
    }
    if(genero.length>30){
      throw new Error('O gênero não pode conter mais de 20 caracteres');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('O e-mail fornecido não é válido');
    }

    //insere os dados na tabela cadastro_usuarios
    await pool.query(
        `INSERT INTO cadastro_usuarios (nome, email, senha, genero, datanasc) VALUES ($1, $2, $3, $4, $5)`,
        [nome, email, senhaCripitografada, genero, datanasc]
    );

}

export async function criarTabelaUsuariosPerfil(idusuario) {

    // Verifica se o usuário já tem um perfil
    const existente = await pool.query(`SELECT * FROM usuarios_perfil WHERE id_usuario = $1`, [idusuario]);
    // Se não existir, cria um novo perfil
    if (existente.rows.length === 0) {
        await pool.query(`INSERT INTO usuarios_perfil (id_usuario) VALUES ($1)`, [idusuario]);
    }

}

export async function popularTabelaTags(nome_tag, id_usuario) {

    // Insere a tag na tabela tags_usuario
    await pool.query(
        `INSERT INTO tags_usuario (nome_tag, id_usuario) VALUES ($1, $2)`,
        [nome_tag, id_usuario]
    )

}

export async function popularTabelaExperiencias(titulo_exp, descricao_exp, img_exp, id_usuario) {

    // Insere a experiência na tabela experiencia_usuario
    await pool.query(
        `INSERT INTO experiencia_usuario (titulo_exp, descricao_exp, img_exp, id_usuario) VALUES ($1, $2, $3, $4)`,
        [titulo_exp, descricao_exp, img_exp, id_usuario]
    )

}

export async function editarPerfil(atributos, valores, id_usuario) {

  const colunasPermitidas = ['foto_perfil','descricao','cpf','estado','cidade','endereco','instagram','github','youtube','twitter','pronomes'];

  const atributosInvalidos = atributos.filter(col => !colunasPermitidas.includes(col));
  if (atributosInvalidos.length > 0) {
    throw new Error(`Atributos inválidos detectados: ${atributosInvalidos.join(', ')}`);
  }

  if(atributos.length !== valores.length) {
    throw new Error('Números de atributos e valores não coincidem.');
  }

  for (let i = 0; i < atributos.length; i++) {
    const atri = atributos[i];
    const valor = valores[i];

    if (atri === 'foto_perfil') {
      const prefix = 'https://res.cloudinary.com/ddbfifdxd/image/upload/';
      if (!valor.startsWith(prefix)) {
        throw new Error(`Atributo foto_perfil não pode ser atualizado diretamente. Use o upload de arquivo.`);
      }
    }
    if (atri === 'cpf' && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(valor)) {
      throw new Error(`CPF inválido. Formato correto: 123.456.789-10`);
    }
    if (atri === 'estado' && valor !== 'NM') {
      const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
      const estados = await response.json();
      const siglas = estados.map(e => e.sigla.toUpperCase());
      if (!siglas.includes(valor.toUpperCase())) {
        throw new Error(`Estado inválido. Use uma sigla válida.`);
      }
      if(atributos.findIndex(x => x === 'cidade') === -1){
        await pool.query('UPDATE usuarios_perfil SET cidade = null WHERE id_usuario = $1', [id_usuario]);
      }
    }
    if (atri === 'cidade') {
      let estado = '';
      const resultado = await pool.query(
        'SELECT estado FROM usuarios_perfil WHERE id_usuario = $1',
        [id_usuario]
      );
      if(atributos.findIndex(x => x === 'estado') !== -1) {
        const indexEstado = atributos.findIndex(x => x === 'estado');
        estado = valores[indexEstado];
      } else if (resultado.rows.length > 0 && resultado.rows[0].estado) {
        estado = resultado.rows[0].estado;
      } else {
        throw new Error(`Você deve fornecer o estado antes de atualizar a cidade.`);
      }
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`);
      const cidades = await response.json();
      const nomesCidades = cidades.map(c => c.nome.toLowerCase());
      if (!nomesCidades.includes(valor.toLowerCase())) {
        throw new Error(`Cidade inválida para o estado ${estado}.`);
      }
    }
    if (atri === 'endereco' && valor.length > 200) {
      throw new Error(`Endereço não pode exceder 200 caracteres.`);
    }
    if (atri === 'descricao' && valor.length > 2000) {
      throw new Error(`Descrição não pode exceder 2000 caracteres.`);
    }
    if (atri === 'instagram' && !/^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._-]+\/?$/.test(valor)) {
      throw new Error(`URL do Instagram inválida.`);
    }
    if (atri === 'github' && !/^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9._-]+\/?$/.test(valor)) {
      throw new Error(`URL do GitHub inválida.`);
    }
    if (atri === 'youtube' && !/^https?:\/\/(www\.)?youtube\.com\/[a-zA-Z0-9._-]+\/?$/.test(valor)) {
      throw new Error(`URL do YouTube inválida.`);
    }
    if (atri === 'twitter' && !/^https?:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9._-]+\/?$/.test(valor)) {
      throw new Error(`URL do Twitter inválida.`);
    }
    if (atri === 'pronomes' && valor.length > 20) {
      throw new Error(`Pronomes não podem exceder 20 caracteres.`);
    }
  }

  const pedido = atributos.map((coluna, index) => `${coluna} = $${index + 1}`);
  const pedidoForm = pedido.join(', ');

  const query = `UPDATE usuarios_perfil SET ${pedidoForm} WHERE id_usuario = $${atributos.length + 1}`;

  const valoresComId = [...valores, id_usuario];

  await pool.query(query, valoresComId);

}
