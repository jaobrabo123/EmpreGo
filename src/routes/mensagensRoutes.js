// * Imports
const express = require('express');
const { authenticateToken } = require('../middlewares/auth.js');
const MensagemController = require('../controllers/mensagemController.js');
const { uploadRawFile, uploadChatImage } = require('../utils/cloudinaryUtils.js');
const { limiteEnviarMensagem } = require('../middlewares/rateLimit.js');

// * Router
const router = express.Router();

// * Rotas
router.post('/mensagens', limiteEnviarMensagem, authenticateToken, MensagemController.criar);
router.patch('/mensagens/vizualizar', authenticateToken, MensagemController.vizualizar);
router.delete('/mensagens/:id', authenticateToken, MensagemController.deletar);
router.post('/mensagens/ocultar', authenticateToken, MensagemController.ocultar);
router.delete('/mensagens/limpar/:chat', authenticateToken, MensagemController.limparConversa);
router.get('/mensagens/download', authenticateToken, MensagemController.download);
router.post('/mensagens/upload', authenticateToken, uploadRawFile.single('file'), MensagemController.upload);
router.post('/mensagens/upload/image', authenticateToken, uploadChatImage.single('img'), MensagemController.uploadFoto);

// * Export
module.exports = router;