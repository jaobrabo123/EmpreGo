const express = require('express');
const { authenticateToken } = require('../middlewares/auth.js');
const FavoritosController = require('../controllers/favoritosController.js')

const router = express.Router();

router.get('/favoritos/empresa', authenticateToken, FavoritosController.listarEmpresasFavoritadas);
router.post('/favoritos/empresa', authenticateToken, FavoritosController.favoritarEmpresa);
router.delete('/favoritos/empresa/:cnpj', authenticateToken, FavoritosController.desfavoritarEmpresa);

module.exports = router;