const express = require('express');
const { authenticateToken } = require('../middlewares/auth.js');
const FavoritosController = require('../controllers/favoritosController.js')

const router = express.Router();

router.post('/favoritos/empresa', authenticateToken, FavoritosController.favoritarEmpresa);

module.exports = router;