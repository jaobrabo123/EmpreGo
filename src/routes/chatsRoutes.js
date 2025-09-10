//Imports
const express = require('express');
const { authenticateToken, apenasCandidatos, apenasEmpresa } = require('../middlewares/auth.js');
const ChatController = require('../controllers/chatController.js');

//Router
const router = express.Router();

//Rotas
router.post('/chats', authenticateToken, ChatController.criar);
router.get('/chats/candidato', authenticateToken, apenasCandidatos, ChatController.listarCand);
router.get('/chats/empresa', authenticateToken, apenasEmpresa, ChatController.listarEmp);

module.exports = router;