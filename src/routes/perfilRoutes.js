// * Imports
const express = require('express');
const { authenticateToken, apenasEmpresa, apenasCandidatos } = require('../middlewares/auth.js');
const PerfilController = require('../controllers/perfilController.js');
const { uploadCandidatoImg, uploadEmpresaImg } = require('../utils/cloudinaryUtils.js');

// * Router
const router = express.Router();

// * Rotas
router.get('/perfil/candidato/info', authenticateToken, apenasCandidatos, PerfilController.buscarCandidato);
router.get('/perfil/candidato/foto', authenticateToken, apenasCandidatos, PerfilController.buscarFotoCandidato);
router.post('/perfil/candidato', authenticateToken, apenasCandidatos, uploadCandidatoImg.single('foto'), PerfilController.editarCandidato);
router.get('/perfil/empresa/info', authenticateToken, apenasEmpresa, PerfilController.buscarEmpresa);
router.get('/perfil/empresa/foto', authenticateToken, apenasEmpresa, PerfilController.buscarFotoEmpresa);
router.post('/perfil/empresa', authenticateToken, apenasEmpresa , uploadEmpresaImg.single('foto'), PerfilController.editarEmpresa);
router.get('/perfil/link', authenticateToken, PerfilController.buscarInfoLinks);

// * Export
module.exports = router;