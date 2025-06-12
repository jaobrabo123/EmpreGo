import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import express from 'express';
import pool from './db.js';

//tabelas
import { criarEPopularTabelaUsuarios, criarTabelaUsuariosPerfil, criarEPopularTabelaTags, criarEPopularTabelaExperiencias} from './app.js';

const app = express();
const port = process.env.PORT || 3001;
const SECRET_KEY = 'seu-segredo-super-seguro';

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token não fornecido' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token inválido' });
        req.user = user; // Adiciona o usuário decodificado à requisição
        next();
    });
}

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

app.post('/usuarios', async (req, res) => {
  try {
    const { nome, email, senha, genero, datanasc } = req.body;

    // Verificar se o email já existe
    const { rows } = await pool.query('SELECT * FROM cadastro_usuarios WHERE email = $1', [email]);
    if (rows.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado.' });
    }

    // Criar usuário no banco
    await criarEPopularTabelaUsuarios(nome, email, senha, genero, datanasc);
    const resultado = await pool.query('SELECT id_usuario FROM cadastro_usuarios WHERE email = $1', [email]);
    const idusuario = resultado.rows[0].id_usuario;
    await criarTabelaUsuariosPerfil(idusuario);

    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar usuário: ' + error.message });
  }
});

app.get('/usuarios', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT id_usuario, nome, email, genero, datanasc FROM cadastro_usuarios');
        res.json(resultado.rows);
    } catch (error) {
        console.error('Erro no GET /usuarios:', error);  // 👈 log detalhado
        res.status(500).send('Erro ao buscar usuários: ' + error.message);
    }
});

app.post('/tags', authenticateToken, async (req, res) => {
  try {
    const { nome_tag } = req.body;
    const id_usuario = req.user.id;

    await criarEPopularTabelaTags(nome_tag, id_usuario);
    res.status(201).json({ message: 'Tag cadastrada com sucesso!' });
  } catch (error) {
    console.error('Erro ao cadastrar tag:', error);
    res.status(500).json({ error: 'Erro ao cadastrar tag: ' + error.message });
  }
});

app.get('/tags', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM tags_usuario');
        res.json(resultado.rows);
    } catch (error) {
        console.error('Erro no GET /tags:', error);  // 👈 log detalhado
        res.status(500).send('Erro ao buscar tags: ' + error.message);
    }
});

app.post('/exps', authenticateToken, async (req, res) => {
  try {
    const { titulo_exp, descricao_exp, img_exp } = req.body;
    const id_usuario = req.user.id;

    await criarEPopularTabelaExperiencias(titulo_exp, descricao_exp, img_exp, id_usuario);
    res.status(201).json({ message: 'Experiência cadastrada com sucesso!' });
  } catch (error) {
    console.error('Erro ao cadastrar experiência:', error);
    res.status(500).json({ error: 'Erro ao cadastrar experiência: ' + error.message });
  }
});


app.get('/exps', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM experiencia_usuario');
        res.json(resultado.rows);
    } catch (error) {
        console.error('Erro no GET /exps:', error);  // 👈 log detalhado
        res.status(500).send('Erro ao buscar experiências: ' + error.message);
    }
});


app.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));