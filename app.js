import bcrypt from 'bcryptjs';
import pool from './db.js';

export async function criarEPopularTabelaUsuarios(nome, email, senha, genero, datanasc) {
    //criptografa a senha
    const senhaCripitografada = await bcrypt.hash(senha, 10);

    await pool.query(
        `INSERT INTO cadastro_usuarios (nome, email, senha, genero, datanasc) VALUES ($1, $2, $3, $4, $5)`,
        [nome, email, senhaCripitografada, genero, datanasc]
    );
}

export async function criarTabelaUsuariosPerfil(idusuario) {

    const existente = await pool.query(`SELECT * FROM usuarios_perfil WHERE id_usuario = $1`, [idusuario]);

    if (existente.rows.length === 0) {
        await pool.query(`INSERT INTO usuarios_perfil (id_usuario) VALUES ($1)`, [idusuario]);
    }
}


export async function criarEPopularTabelaTags(nome_tag, id_usuario) {

    await pool.query(
        `INSERT INTO tags_usuario (nome_tag, id_usuario) VALUES ($1, $2)`,
        [nome_tag, id_usuario]
    )
}

/*
export async function criarEPopularTabelaExperiencias(titulo, descricao, imagem, id_usuario) {

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
    */