// Imports
const express = require('express');
const { authenticateToken, apenasEmpresa, apenasCandidatos } = require('../middlewares/auth.js');
const PerfilController = require('../controllers/perfilController.js');

// Cloudinary + Multer
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('@config/cloudinary.js');

// storage para as fotos de perfil
const perfilStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'fotos_perfil', //pasta no Cloudinary para as fotos de perfil
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] ,
    format: 'webp',
    transformation: [
      {  
        quality: 'auto',
        fetch_format: 'webp'
      }
    ],
  }
});
const uploadPerfil = multer({ storage: perfilStorage });  // upload das fotos de perfil

// storage para as fotos de perfil de empresa
const empresaPerfilStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'fotos_perfil_empresa', //pasta no Cloudinary para as fotos de perfil de empresa
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] ,
    format: 'webp',
    transformation: [
      {  
        quality: 'auto',
        fetch_format: 'webp'
      }
    ],
  }
});
const uploadEmpresaPerfil = multer({ storage: empresaPerfilStorage });  // upload das fotos de perfil de empresa

//Router
const router = express.Router();

//Rotas
router.get('/perfil/candidato/info', authenticateToken, apenasCandidatos, PerfilController.buscarCandidato);
router.get('/perfil/candidato/foto', authenticateToken, apenasCandidatos, PerfilController.buscarFotoCandidato);
router.post('/perfil/candidato', authenticateToken, apenasCandidatos, uploadPerfil.single('foto'), PerfilController.editarCandidato);
router.get('/perfil/empresa/info', authenticateToken, apenasEmpresa, PerfilController.buscarEmpresa);
router.get('/perfil/empresa/foto', authenticateToken, apenasEmpresa, PerfilController.buscarFotoEmpresa);
router.post('/perfil/empresa', authenticateToken, apenasEmpresa , uploadEmpresaPerfil.single('foto'), PerfilController.editarEmpresa);

module.exports = router;