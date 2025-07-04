const bcrypt = require('bcryptjs');
const pool = require('./db.js');

async function popularTabelaCandidatos(nome, email, senha, genero, data_nasc) {

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
  const nascimento = new Date(data_nasc);
  const idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  const dia = hoje.getDate() - nascimento.getDate();

  const tem14Anos = idade > 14 || (idade === 14 && (mes > 0 || (mes === 0 && dia >= 0)));

  if (!tem14Anos) {
    throw new Error('Você precisa ter no mínimo 14 anos para se cadastrar.');
  }

  //insere os dados na tabela cadastro_usuarios
  await pool.query(
      `INSERT INTO candidatos (nome, email, senha, genero, data_nasc) VALUES ($1, $2, $3, $4, $5)`,
      [nome, email, senhaCripitografada, genero, data_nasc]
  );

}

async function popularTabelaTags(nome, id) {

  if(nome.length > 25) {
    throw new Error('O nome da tag não pode ter mais de 25 caracteres');
  }

  // Insere a tag na tabela tags_usuario
  await pool.query(
    `INSERT INTO tags (nome, candidato) VALUES ($1, $2)`,
    [nome, id]
  )

}

async function popularTabelaExperiencias(titulo, descricao, imagem, id) {

  if(titulo.length > 30) {
    throw new Error('O título da experiência não pode ter mais de 30 caracteres'); 
  }

  if(descricao.length > 1500) {
    throw new Error('A descrição da experiência não pode ter mais de 1500 caracteres');
  }
  if(imagem!=='imagem padrão'){
    const prefix = 'https://res.cloudinary.com/ddbfifdxd/image/upload/';
    if(imagem && !imagem.startsWith(prefix)) {
      throw new Error('A imagem da experiência não pode ser atualizado diretamente. Use o upload de arquivo.');
    }
  }

  // Insere a experiência na tabela experiencia_usuario
  await pool.query(
    `INSERT INTO experiencias (titulo, descricao, imagem, candidato) VALUES ($1, $2, $3, $4)`,
    [titulo, descricao, imagem, id]
  )

}

async function editarPerfil(atributos, valores, id) {

  const colunasPermitidas = ['foto','descricao','cpf','estado','cidade','endereco','instagram','github','youtube','twitter','pronomes'];

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

    if (atri === 'foto') {
      const prefix = 'https://res.cloudinary.com/ddbfifdxd/image/upload/';
      if (!valor.startsWith(prefix)) {
        throw new Error(`A foto de perfil não pode ser atualizado diretamente. Use o upload de arquivo.`);
      }
    } else
    if (atri === 'cpf' && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(valor)) {
      throw new Error(`CPF inválido. Formato correto: 123.456.789-10`);
    } else
    if (atri === 'estado' && valor !== 'NM') {
      const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
      const estados = await response.json();
      const siglas = estados.map(e => e.sigla.toUpperCase());
      if (!siglas.includes(valor.toUpperCase())) {
        throw new Error(`Estado inválido. Use uma sigla válida.`);
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
        throw new Error(`Você deve fornecer o estado antes de atualizar a cidade.`);
      }
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`);
      const cidades = await response.json();
      const nomesCidades = cidades.map(c => c.nome.toLowerCase());
      if (!nomesCidades.includes(valor.toLowerCase())) {
        throw new Error(`Cidade inválida para o estado ${estado}.`);
      }
    } else
    if (atri === 'endereco' && valor.length > 200) {
      throw new Error(`Endereço não pode exceder 200 caracteres.`);
    } else
    if (atri === 'descricao' && valor.length > 2000) {
      throw new Error(`Descrição não pode exceder 2000 caracteres.`);
    } else
    if (atri === 'instagram' && !/^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._-]+\/?$/.test(valor)) {
      throw new Error(`URL do Instagram inválida.`);
    } else
    if (atri === 'github' && !/^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9._-]+\/?$/.test(valor)) {
      throw new Error(`URL do GitHub inválida.`);
    } else
    if (atri === 'youtube' && !/^https?:\/\/(www\.)?youtube\.com\/(@[a-zA-Z0-9._-]+)(\/)?(\?.*)?$/) {
      throw new Error(`URL do YouTube inválida.`);
    } else
    if (atri === 'twitter' && !/^https?:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9._-]+\/?$/.test(valor)) {
      throw new Error(`URL do Twitter inválida.`);
    } else
    if (atri === 'pronomes' && valor.length > 20) {
      throw new Error(`Pronomes não podem exceder 20 caracteres.`);
    }
  }

  const pedido = atributos.map((coluna, index) => `${coluna} = $${index + 1}`);
  const pedidoForm = pedido.join(', ');

  const query = `UPDATE candidatos SET ${pedidoForm} WHERE id = $${atributos.length + 1}`;

  const valoresComId = [...valores, id];

  await pool.query(query, valoresComId);

}

async function popularTabelaEmpresas(cnpj, nome_fant, telefone, email, senha, razao_soci, cep, complemento, num) {

  if(senha.length < 8) {
    throw new Error('A senha deve ter pelo menos 8 caracteres');
  }

  const senhaCripitografada = await bcrypt.hash(senha, 10);

  if (!/^\d{14}$/.test(cnpj)) {
    throw new Error('CNPJ inválido. Deve conter 14 dígitos numéricos.');
  }

  if (nome_fant.length > 50) {
    throw new Error('O nome da empresa não pode ter mais de 50 caracteres');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('O e-mail não é válido');
  }

  if (razao_soci.length > 100) {
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
    `INSERT INTO empresas 
     (cnpj, nome_fant, telefone, email, senha, razao_soci, cep, complemento, numero) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [cnpj, nome_fant, telefoneLimpo, email, senhaCripitografada, razao_soci, cepLimpo, complemento, num]
  );
  
}

async function editarPerfilEmpresa(atributos, valores, cnpj) {
  
  const colunasPermitidas = ['descricao', 'setor','porte','data_fund','contato','site','instagram','github','youtube','twitter','foto'];

  const atributosInvalidos = atributos.filter(col => !colunasPermitidas.includes(col));
  if (atributosInvalidos.length > 0) {
    throw new Error(`Atributos inválidos detectados: ${atributosInvalidos.join(', ')}`);
  }

  if(atributos.length !== valores.length) {
    throw new Error('Números de atributos e valores não coincidem.');
  }

  for(let i = 0; i < atributos.length; i++){
    const atributo = atributos[i]
    const valor = valores[i]

    if(atributo==='descricao'&&valor.length>2000){
      throw new Error("A descrição da empresa não pode conter mais de 2000 caracteres.");
    }else
    if(atributo==='setor'&&valor.length>70){
      throw new Error("O setor da empresa não pode conter mais de 70 caracteres.");
    }else
    if(atributo==='porte'&&valor.length>30){
      throw new Error("O porte da empresa não pode conter mais de 30 caracteres.");
    }else
    if (atributo === 'contato' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
      throw new Error("E-mail de contato inválido.");
    }else
    if (atributo === 'site' && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(valor)) {
      throw new Error("URL do site da empresa inválida.");
    }else
    if (atributo === 'instagram' && !/^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._-]+\/?$/.test(valor)) {
      throw new Error("URL do Instagram da empresa inválida.");
    }else
    if (atributo === 'github' && !/^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9._-]+\/?$/.test(valor)) {
      throw new Error("URL do GitHub da empresa inválida.");
    }else
    if (atributo === 'youtube' && !/^https?:\/\/(www\.)?youtube\.com\/(@[a-zA-Z0-9._-]+)(\/)?(\?.*)?$/.test(valor)) {
      throw new Error("URL do YouTube da empresa inválida.");
    }else
    if (atributo === 'twitter' && !/^https?:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9._-]+\/?$/.test(valor)) {
      throw new Error("URL do Twitter da empresa inválida.");
    }else
    if (atributo === 'foto') {
      const prefix = 'https://res.cloudinary.com/ddbfifdxd/image/upload/';
      if (!valor.startsWith(prefix)) {
        throw new Error("A foto da empresa não pode ser atualizada diretamente. Use o upload de arquivo.");
      }
    }else
    if (atributo === 'data_fund') {
      const data = new Date(valor);
      if (isNaN(data.getTime())) {
        throw new Error("Data de fundação da empresa inválida.");
      }
      const hoje = new Date();
      if (data > hoje) {
        throw new Error("A data de fundação da empresa não pode ser no futuro.");
      }
    }

  }

  const inserts = atributos.map((atri,index)=> `${atri} = $${index+1}`).join(', ')

  await pool.query(
    `update empresas set ${inserts} where cnpj = $${atributos.length+1}`,
    [...valores, cnpj]
  )

}

module.exports = {
  popularTabelaCandidatos,
  popularTabelaTags,
  popularTabelaExperiencias,
  editarPerfil,
  popularTabelaEmpresas,
  editarPerfilEmpresa
}

/*async function popularTabelaVagas(titulo_vaga, descricao_vaga, salario, beneficios, requisitos, cnpj) {

  // Insere a vaga na tabela vagas_empresa
  await pool.query(
      `INSERT INTO vagas_empresa (titulo_vaga, descricao_vaga, salario, beneficios, requisitos, cnpj) VALUES ($1, $2, $3, $4, $5, $6)`,
      [titulo_vaga, descricao_vaga, salario, beneficios, requisitos, cnpj]
  );

}*/