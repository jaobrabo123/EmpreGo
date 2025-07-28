//Imports
const express = require('express');
const { authenticateToken } = require('../middlewares/auth.js');
const MensagemController = require('../controllers/mensagemController.js');

//Router
const router = express.Router();

//Rotas
router.post('/mensagens', authenticateToken, MensagemController.criar);

module.exports = router;