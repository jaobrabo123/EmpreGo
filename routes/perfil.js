//Imports
import express from 'express';
import pool from '../db.js';
import { editarPerfil } from '../app.js';
import authenticateToken from '../token.js';
// Cloudinary + Multer
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../cloudinary.js';

// storage para as fotos de perfil
const perfilStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'fotos_perfil', //pasta no Cloudinary para as fotos de perfil
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
});
const uploadPerfil = multer({ storage: perfilStorage });  // upload das fotos de perfil

//Router
const router = express.Router();

//Rota para pegar o perfil do usuário
router.get('/perfil', authenticateToken, async (req, res) => {
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
router.post('/perfil-edit', authenticateToken, uploadPerfil.single('foto_perfil'), async (req, res) =>{
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

export default router;