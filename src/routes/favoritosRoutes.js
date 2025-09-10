const express = require('express');
const { authenticateToken, apenasCandidatos, apenasEmpresa } = require('../middlewares/auth.js');
const FavoritosController = require('../controllers/favoritosController.js')

const router = express.Router();

router.get('/favoritos/empresa', authenticateToken, apenasCandidatos, FavoritosController.listarEmpresasFavoritadas);
router.post('/favoritos/empresa', authenticateToken, apenasCandidatos, FavoritosController.favoritarEmpresa);
router.delete('/favoritos/empresa/:cnpj', authenticateToken, apenasCandidatos, FavoritosController.desfavoritarEmpresa);
router.get('/favoritos/candidato', authenticateToken, apenasEmpresa, FavoritosController.listarCandidatosFavoritados);
router.post('/favoritos/candidato', authenticateToken, apenasEmpresa, FavoritosController.favoritarCandidato);
router.delete('/favoritos/candidato/:cd', authenticateToken, apenasEmpresa, FavoritosController.desfavoritarCandidato);
router.post('/favoritos/chat', authenticateToken, FavoritosController.favoritarChat);
router.delete('/favoritos/chat/:ct', authenticateToken, FavoritosController.desfavoritarChat);

module.exports = router;