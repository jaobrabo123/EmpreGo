//Métodos
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import express from 'express';
import pool from './db.js';

// Cloudinary + Multer
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.js';

// Tabelas
import {
  popularTabelaUsuarios,
  criarTabelaUsuariosPerfil,
  popularTabelaTags,
  popularTabelaExperiencias,
  editarPerfil
} from './app.js';

// Importando dotenv
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const SECRET_KEY = process.env.JWT_SECRET;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Autenticação JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}

// Multer + Cloudinary Storage
// storage para as imagens das experiencias
const expStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'experiencias', //pasta no Cloudinary para as experiencias
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
});

// storage para as fotos de perfil
const perfilStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'fotos_perfil', //pasta no Cloudinary para as fotos de perfil
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
});

const uploadExp    = multer({ storage: expStorage });     // upload das experiências
const uploadPerfil = multer({ storage: perfilStorage });  // upload das fotos de perfil

// Rotas

//Rota de login
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const resultado = await pool.query('SELECT * FROM cadastro_usuarios WHERE email = $1', [email]);
    const usuario = resultado.rows[0];

    if (usuario && await bcrypt.compare(senha, usuario.senha)) {
      const token = jwt.sign({ id: usuario.id_usuario }, SECRET_KEY, { expiresIn: '1d' });
      res.json({ token });
    } else {
      res.status(401).send('Email ou senha inválidos.');
    }
  } catch (error) {
    res.status(500).send('Erro ao fazer login: ' + error.message);
  }
});

//Rota de cadastro
app.post('/usuarios', async (req, res) => {
  try {
    const { nome, email, senha, genero, datanasc } = req.body;
    const { rows } = await pool.query('SELECT * FROM cadastro_usuarios WHERE email = $1', [email]);

    if (rows.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado.' });
    }

    await popularTabelaUsuarios(nome, email, senha, genero, datanasc);
    const resultado = await pool.query('SELECT id_usuario FROM cadastro_usuarios WHERE email = $1', [email]);
    const idusuario = resultado.rows[0].id_usuario;
    await criarTabelaUsuariosPerfil(idusuario);

    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar usuário: ' + error.message });
  }
});

//Rota para pegar todos os usuários
app.get('/usuarios', authenticateToken, async (req, res) => {
  try {
    const resultado = await pool.query('SELECT id_usuario, nome, email, genero, datanasc FROM cadastro_usuarios');
    res.json(resultado.rows);
  } catch (error) {
    console.error('Erro no GET /usuarios:', error);
    res.status(500).send('Erro ao buscar usuários: ' + error.message);
  }
});

//Rota pra adicionar tag ao usuário
app.post('/tags', authenticateToken, async (req, res) => {
  try {
    let { nome_tag } = req.body;
    const id_usuario = req.user.id;

    if (!nome_tag || nome_tag.trim().length === 0) {
      return res.status(400).json({ error: 'Nome da tag não pode estar vazio.' });
    }

    if (nome_tag.trim().length > 20) {
      return res.status(400).json({ error: 'O nome da tag deve ter no máximo 20 caracteres.' });
    }

    nome_tag = nome_tag.trim()

    await popularTabelaTags(nome_tag, id_usuario);
    res.status(201).json({ message: 'Tag cadastrada com sucesso!' });
  } catch (error) {
    console.error('Erro ao cadastrar tag:', error);
    res.status(500).json({ error: 'Erro ao cadastrar tag: ' + error.message });
  }
});

//Rota para pegar todas as tags
app.get('/tags', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM tags_usuario');
    res.json(resultado.rows);
  } catch (error) {
    console.error('Erro no GET /tags:', error);
    res.status(500).send('Erro ao buscar tags: ' + error.message);
  }
});

//Rota para adicionar experiência ao usuário
app.post('/exps', authenticateToken, uploadExp.single('img_exp'), async (req, res) => {
  try {
    const { titulo_exp, descricao_exp } = req.body;
    const id_usuario = req.user.id;
    const img_exp = req.file ? req.file.path : null;

    if (!img_exp) return res.status(400).json({ error: 'Imagem não enviada' });

    await popularTabelaExperiencias(titulo_exp, descricao_exp, img_exp, id_usuario);
    res.status(201).json({ message: 'Experiência cadastrada com sucesso!' });
  } catch (error) {
    console.error('Erro ao cadastrar experiência:', error);
    res.status(500).json({ error: 'Erro ao cadastrar experiência: ' + error.message });
  }
});


//Rota para pegar as experiências do usuário
app.get('/exps', authenticateToken, async (req, res) => {
  try {
    const id_usuario = req.user.id;

    const resultado = await pool.query(
      `SELECT e.titulo_exp, e.descricao_exp, e.img_exp
      FROM experiencia_usuario e
      JOIN cadastro_usuarios c ON e.id_usuario = c.id_usuario
      WHERE e.id_usuario = $1
      ORDER BY e.data_exp DESC`,
      [id_usuario]
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error('Erro no GET /exps:', error);
    res.status(500).send('Erro ao buscar experiências: ' + error.message);
  }
});

//Rota para pegar o perfil do usuário
app.get('/perfil', authenticateToken, async (req, res) => {
  try {
    const id_usuario = req.user.id;

    const usuario = await pool.query(
      `SELECT c.nome, c.datanasc, c.email, u.descricao, u.foto_perfil, u.cpf 
       FROM cadastro_usuarios c 
       JOIN usuarios_perfil u ON c.id_usuario = u.id_usuario
       WHERE c.id_usuario = $1`,
      [id_usuario]
    );

    if (usuario.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(usuario.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar perfil: ' + error.message });
  }
});

//Rota para editar o perfil do usuário
app.post('/perfil-edit', authenticateToken, uploadPerfil.single('foto_perfil'), async (req, res) =>{
  try {
    const id_usuario = req.user.id;
    const dados = { ...req.body };
    
    if (req.file) {
      dados.foto_perfil = req.file.path;
    }

    const atributos = Object.keys(dados);
    const valores = Object.values(dados);

    if (atributos.length === 0) {
      return res.status(400).json({ error: 'Nenhum atributo para atualizar.' });
    }

    await editarPerfil(atributos, valores, id_usuario);
    res.status(201).json({ message: `Perfil atualizado com sucesso! (${atributos.join(', ')})` });
  } catch (error) {
    console.error('Erro ao editar perfil:', error);
    res.status(500).json({ error: 'Erro ao editar perfil: ' + error.message });
  }
})


//Porta do servidor
app.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));
