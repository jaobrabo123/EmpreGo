//Imports
const express = require('express');
const { authenticateToken, apenasCandidatos } = require('../middlewares/auth.js');
const ChatController = require('../controllers/chatController.js');

//Router
const router = express.Router();

//Rotas
router.post('/chats', authenticateToken, ChatController.criar);
router.get('/chats/candidato', authenticateToken, apenasCandidatos, ChatController.listarCand);

module.exports = router;