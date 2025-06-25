import bcrypt from 'bcryptjs';

import pool from './db.js';

export async function popularTabelaUsuarios(nome, email, senha, genero, datanasc) {

  if(senha.length < 8) {
    throw new Error('A senha deve ter pelo menos 8 caracteres');
  }

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
    throw new Error('O e-mail não é válido');
  }

  const hoje = new Date();
  const nascimento = new Date(datanasc);
  const idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  const dia = hoje.getDate() - nascimento.getDate();

  const tem14Anos = idade > 14 || (idade === 14 && (mes > 0 || (mes === 0 && dia >= 0)));

  if (!tem14Anos) {
    throw new Error('Você precisa ter no mínimo 14 anos para se cadastrar.');
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

  if(nome_tag.length > 25) {
    throw new Error('O nome da tag não pode ter mais de 25 caracteres');
  }
  // Insere a tag na tabela tags_usuario
  await pool.query(
    `INSERT INTO tags_usuario (nome_tag, id_usuario) VALUES ($1, $2)`,
    [nome_tag, id_usuario]
  )

}

export async function popularTabelaExperiencias(titulo_exp, descricao_exp, img_exp, id_usuario) {

  if(titulo_exp.length > 30) {
    throw new Error('O título da experiência não pode ter mais de 30 caracteres'); 
  }

  if(descricao_exp.length > 1500) {
    throw new Error('A descrição da experiência não pode ter mais de 1500 caracteres');
  }
  if(img_exp!=='imagem padrão'){
    const prefix = 'https://res.cloudinary.com/ddbfifdxd/image/upload/';
    if(img_exp && !img_exp.startsWith(prefix)) {
      throw new Error('A imagem da experiência não pode ser atualizado diretamente. Use o upload de arquivo.');
    }
  }

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
        throw new Error(`A foto de perfil não pode ser atualizado diretamente. Use o upload de arquivo.`);
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

export async function popularTabelaEmpresas(cnpj, nome, telefone, email, senha, razao, cep, complemento, num) {

  if(senha.length < 8) {
    throw new Error('A senha deve ter pelo menos 8 caracteres');
  }

  const senhaCripitografada = await bcrypt.hash(senha, 10);

  const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
  if (cnpjLimpo.length !== 14) {
    throw new Error('CNPJ inválido. Deve conter 14 dígitos numéricos.');
  }

  if (nome.length > 50) {
    throw new Error('O nome da empresa não pode ter mais de 50 caracteres');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('O e-mail não é válido');
  }

  if (razao.length > 100) {
    throw new Error('A razão social não pode ter mais de 100 caracteres');
  }

  const cepLimpo = cep.replace(/[^\d]/g, '');
  if (cepLimpo.length !== 8) {
    throw new Error('CEP inválido. Deve conter 8 dígitos numéricos.');
  }

  if (complemento.length > 100) {
    throw new Error('O complemento não pode ter mais de 100 caracteres');
  }

  if (num.length < 1 || num.length > 10) {
    throw new Error('Número do endereço inválido');
  }

  const telefoneLimpo = telefone.replace(/[^\d]/g, '');
  if (telefoneLimpo.length < 12 || telefoneLimpo.length > 13) {
    throw new Error('Telefone inválido. Deve conter entre 12 e 13 dígitos com DDI.');
  }

  await pool.query(
    `INSERT INTO cadastro_empresa 
     (cnpj, nomeempre, telefoneempre, emailcadas, senhaempre, nomejuridico, cep, complemento, num) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [cnpjLimpo, nome, telefoneLimpo, email, senhaCripitografada, razao, cepLimpo, complemento, num]
  );
  
}

export async function criarEmpresasPerfil(cnpj) {

  // Verifica se a empresa já tem um perfil
  const existente = await pool.query(`SELECT * FROM empresa_perfil WHERE cnpj = $1`, [cnpj]);
  // Se não existir, cria um novo perfil
  if (existente.rows.length === 0) {
    await pool.query(`INSERT INTO empresa_perfil (cnpj) VALUES ($1)`, [cnpj]);
  }

}

/*export async function popularTabelaVagas(titulo_vaga, descricao_vaga, salario, beneficios, requisitos, cnpj) {

  // Insere a vaga na tabela vagas_empresa
  await pool.query(
      `INSERT INTO vagas_empresa (titulo_vaga, descricao_vaga, salario, beneficios, requisitos, cnpj) VALUES ($1, $2, $3, $4, $5, $6)`,
      [titulo_vaga, descricao_vaga, salario, beneficios, requisitos, cnpj]
  );

}*/