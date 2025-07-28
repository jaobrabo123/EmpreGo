//Imports
const express = require('express');
const { authenticateToken, apenasAdmins, apenasCandidatos } = require('../middlewares/auth.js');
const TagController = require('../controllers/tagController.js')

//Router
const router = express.Router();

router.post('/tags', authenticateToken, TagController.adicionar);
router.get('/tags', authenticateToken, TagController.listar);
router.get('/tags/all', authenticateToken, apenasAdmins, TagController.listarTodas);
router.delete('/tags/:tg', authenticateToken, apenasCandidatos, TagController.remover);

module.exports = router;