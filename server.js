import express from 'express';
import jwt from 'jsonwebtoken';

//metodo pra estabelecer conexao com o banco de dados
import { getDatabase } from './conexaodb.js';

//tabelas
import { criarEPopularTabelaUsuarios } from './app.js';
import { criarTabelaUsuariosPerfil } from './app.js';

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
        const db = await getDatabase();

        const usuario = await db.get('SELECT * FROM cadastro_usuarios WHERE email = ? AND senha = ?', [email, senha]);

        if (usuario) {
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
    const { nome, email, senha, genero, datanasc } = req.body;
    try {
        await criarEPopularTabelaUsuarios(nome, email, senha, genero, datanasc);
        const db = await getDatabase();
        const idusuario = await db.get('SELECT id_usuario FROM cadastro_usuarios WHERE email = ?', [email]);
        await criarTabelaUsuariosPerfil(Number(idusuario.id_usuario));
        res.status(200).send('Usuário inserido com sucesso!');
    } catch (error) {
        res.status(500).send('Erro ao inserir usuário: ' + error.message);
    }
});

app.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));