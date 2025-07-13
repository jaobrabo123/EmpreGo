//Imports
const express = require('express');
const pool = require('../config/db.js');
const { editarPerfil } = require('../services/candidatoServices.js');
const { editarPerfilEmpresa } = require('../services/empresaServices.js')
const { authenticateToken, apenasEmpresa, apenasCandidatos } = require('../middlewares/auth.js');
const ErroDeValidacao = require('../utils/erroValidacao.js')

// Cloudinary + Multer
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary.js');

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
    const id = req.user.id;

    const usuario = await pool.query(
      `SELECT nome, data_nasc, email, descricao, foto, cpf 
       FROM candidatos where id = $1`,
      [id]
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
router.post('/perfil-edit', authenticateToken, apenasCandidatos, uploadPerfil.single('foto'), async (req, res) =>{
  try {
    const id = req.user.id;
    const dados = { ...req.body };
    
    if (req.file) {
      dados.foto = req.file.path;
    }

    const atributos = Object.keys(dados);
    const valores = Object.values(dados);

    await editarPerfil(atributos, valores, id);
    res.status(201).json({ message: `Perfil atualizado com sucesso! (${atributos.join(', ')})` });
  } catch (error) {
    if (error instanceof ErroDeValidacao) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro ao editar perfil: ' + error.message });
  }
})

//Rota para editar o perfil da empresa
router.post('/perfil-edit-empresa', authenticateToken, apenasEmpresa , uploadEmpresaPerfil.single('foto'), async (req, res) => {
  try {
    const cnpj = req.user.id;
    const dados = { ...req.body };
    if (req.file) {
      dados.foto = req.file.path;
    }
    const atributos = Object.keys(dados);
    const valores = Object.values(dados);
    
    await editarPerfilEmpresa(atributos, valores, cnpj);
    res.status(201).json({ message: `Perfil atualizado com sucesso! (${atributos.join(', ')})` });
  } catch (error) {
    if (error instanceof ErroDeValidacao) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro ao editar perfil da empresa: ' + error.message });
  }
});

router.get('/perfil-empresa', authenticateToken, apenasEmpresa, async (req, res) => {
  try{
    const cnpj = req.user.id;

    const empresa = await pool.query(
      `SELECT nome_fant, telefone, cep, complemento, numero, descricao, setor, porte, data_fund, contato, site, instagram, github, youtube, twitter, foto
       FROM empresas where cnpj = $1`,
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