//Imports
const express = require("express");
const CandidatoController = require('../controllers/candidatoController.js');
const { authenticateToken, apenasAdmins, apenasCandidatos, apenasEmpresa } = require("../middlewares/auth.js");
const { limiteNodemailer, limiteValidarCodigo } = require('../middlewares/rateLimit.js');

//router
const router = express.Router();

//Rotas
router.post('/candidatos', CandidatoController.cadastrar);
router.post('/candidatos/confirmar', limiteValidarCodigo, CandidatoController.confirmarCadastro);
router.post('/candidatos/reenviar', limiteNodemailer, CandidatoController.enviarNovoCodigo);
router.get('/candidatos/all', authenticateToken, apenasAdmins, CandidatoController.listarTodos);
router.get('/candidatos/public', authenticateToken, apenasEmpresa, CandidatoController.listarTodosPublic);
router.delete('/candidatos/:cd', authenticateToken, apenasCandidatos, CandidatoController.remover);

module.exports = router;