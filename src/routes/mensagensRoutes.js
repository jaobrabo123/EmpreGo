// * Imports
const express = require('express');
const { authenticateToken } = require('../middlewares/auth.js');
const MensagemController = require('../controllers/mensagemController.js');

// * Router
const router = express.Router();

// * Rotas
router.post('/mensagens', authenticateToken, MensagemController.criar);
router.patch('/mensagens/vizualizar', authenticateToken, MensagemController.vizualizar);
router.delete('/mensagens/limpar/:chat', authenticateToken, MensagemController.limparConversa);
router.get('/mensagens/download', authenticateToken, MensagemController.download);

// * Export
module.exports = router;