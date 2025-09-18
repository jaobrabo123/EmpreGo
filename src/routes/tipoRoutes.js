// * Imports
const express = require('express');
const { authenticateToken } = require('../middlewares/auth.js');
const TipoController = require('../controllers/tipoController.js')

// * Router
const router = express.Router();

router.get('/get-tipo', authenticateToken, TipoController.pegarTipo);

// * Export
module.exports = router;