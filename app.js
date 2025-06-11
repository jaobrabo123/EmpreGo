import { getDatabase } from './conexaodb.js';
import bcrypt from 'bcryptjs';

export async function criarEPopularTabelaUsuarios(nome, email, senha, genero, datanasc) {
    const db = await getDatabase();

    //criptografa a senha
    const senhaCripitografada = await bcrypt.hash(senha, 10);

    await db.run(`
        CREATE TABLE IF NOT EXISTS cadastro_usuarios (
            id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            email TEXT UNIQUE,
            senha TEXT,
            genero TEXT,
            datanasc DATE
        )
    `)

    await db.run(
        `INSERT INTO cadastro_usuarios (nome, email, senha, genero, datanasc) VALUES (?, ?, ?, ?, ?)`,
        [nome, email, senhaCripitografada, genero, datanasc]
    );
}

export async function criarTabelaUsuariosPerfil(idusuario) {
    const db = await getDatabase();

    await db.run(`
        CREATE TABLE IF NOT EXISTS usuarios_perfil (
            id_perfil INTEGER PRIMARY KEY AUTOINCREMENT,
            foto_perfil TEXT DEFAULT 'ajeitardepois',
            descricao TEXT DEFAULT 'sua descricao',
            cpf TEXT,
            estado TEXT,
            cidade TEXT,
            endereco TEXT,
            instagram TEXT,
            github TEXT,
            youtube TEXT,
            twitter TEXT,
            pronomes TEXT,
            id_usuario INTEGER UNIQUE,
            FOREIGN KEY (id_usuario) REFERENCES cadastro_usuarios(id_usuario)
        )
    `)
    const existente = await db.get(`SELECT * FROM usuarios_perfil WHERE id_usuario = ?`, [idusuario]);

    if (!existente) {
        await db.run(`INSERT INTO usuarios_perfil (id_usuario) VALUES (?)`, [idusuario]);
    }
}

export async function criarEPopularTabelaTags(nome_tag, id_usuario) {
    const db = await getDatabase();

    await db.run(`
        CREATE TABLE IF NOT EXISTS tags_usuario (
            id_tag INTEGER PRIMARY KEY AUTOINCREMENT,
            nome_tag TEXT,
            id_usuario INTEGER,
            FOREIGN KEY (id_usuario) REFERENCES cadastro_usuarios(id_usuario)
        )
    `)

    await db.run(
        `INSERT INTO tags_usuario (nome_tag, id_usuario) VALUES (?, ?)`,
        [nome_tag, id_usuario]
    )
}

export async function criarEPopularTabelaExperiencias(titulo, descricao, imagem, id_usuario) {
    const db = await getDatabase();

    await db.run(`
        CREATE TABLE IF NOT EXISTS experiencias_usuario (
            id_experiencia INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT,
            descricao TEXT,
            imagem TEXT DEFAULT 'caminho da imagem',
            id_usuario INTEGER,
            FOREIGN KEY (id_usuario) REFERENCES cadastro_usuarios(id_usuario)
        )
    `)

    await db.run(
        `INSERT INTO experiencias_usuario (titulo, descricao, imagem, id_usuario) VALUES (?, ?, ?, ?)`,
        [titulo, descricao, imagem, id_usuario]
    )
}