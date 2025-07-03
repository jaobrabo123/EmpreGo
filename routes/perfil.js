//Imports
const express = require('express');
const pool = require('../db.js');
const { editarPerfil, editarPerfilEmpresa } = require('../app.js');
const { authenticateToken, apenasEmpresa, apenasCandidatos } = require('../middlewares/auth.js');
// Cloudinary + Multer
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinary.js');

// storage para as fotos de perfil
const perfilStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'fotos_perfil', //pasta no Cloudinary para as fotos de perfil
    allowed_formats: ['jpg', 'jpeg', 'png']/*,
    transformation: [
      { width: 400, height: 400, crop: 'limit', quality: 'auto:best'} // colocar com uma qualidade melhor depois
    ]*/
  }
});
const uploadPerfil = multer({ storage: perfilStorage });  // upload das fotos de perfil

// storage para as fotos de perfil de empresa
const empresaPerfilStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'fotos_perfil_empresa', //pasta no Cloudinary para as fotos de perfil de empresa
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
});
const uploadEmpresaPerfil = multer({ storage: empresaPerfilStorage });  // upload das fotos de perfil de empresa

//Router
const router = express.Router();

//Rota para pegar o perfil do usuário
router.get('/perfil', authenticateToken, apenasCandidatos, async (req, res) => {
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
router.post('/perfil-edit', authenticateToken, apenasCandidatos, uploadPerfil.single('foto_perfil'), async (req, res) =>{
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

//Rota para editar o perfil da empresa
router.post('/perfil-edit-empresa', authenticateToken, apenasEmpresa , uploadEmpresaPerfil.single('fotoempresa'), async (req, res) => {
  try {
    const cnpj = req.user.id;
    const dados = { ...req.body };
    if (req.file) {
      dados.fotoempresa = req.file.path;
    }
    const atributos = Object.keys(dados);
    const valores = Object.values(dados);
    if (atributos.length === 0) {
      return res.status(400).json({ error: 'Nenhum atributo para atualizar.' });
    }
    await editarPerfilEmpresa(atributos, valores, cnpj);
    res.status(201).json({ message: `Perfil atualizado com sucesso! (${atributos.join(', ')})` });
  } catch (error) {
    console.error('Erro ao editar perfil da empresa:', error);
    res.status(500).json({ error: 'Erro ao editar perfil da empresa: ' + error.message });
  }
});

router.get('/perfil-empresa', authenticateToken, apenasEmpresa, async (req, res) => {
  try{
    const cnpj = req.user.id;

    const empresa = await pool.query(
      `SELECT c.nomeempre, c.telefoneempre,c.cep, c.complemento, c.num, e.descricaoempre, e.setor, e.porte, e.dataempresa, e.emailcontato, e.siteempresa, e.instagramempre, e.githubempre, e.youtubeempre, e.twitterempre, e.fotoempresa
       FROM cadastro_empresa c 
       JOIN empresa_perfil e ON c.cnpj = e.cnpj
       WHERE c.cnpj = $1`,
      [cnpj]
    );

    if (empresa.rows.length === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    res.json(empresa.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar perfil da empresa: ' + error.message });
  }
})

module.exports = router;