//Imports
const express = require('express');
const { authenticateToken } = require('../middlewares/auth.js');
const ChatController = require('../controllers/chatController.js');

//Router
const router = express.Router();

//Rotas
router.post('/chats', authenticateToken, ChatController.criar);
router.get('/chats/info', authenticateToken, ChatController.listar);

module.exports = router;