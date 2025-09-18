// * Imports
const express = require("express");
const ExperienciaController = require('../controllers/experienciaController.js')
const { authenticateToken, apenasAdmins, apenasCandidatos } = require("../middlewares/auth.js");
const { uploadExperienciaImg } = require("../utils/cloudinaryUtils.js");

// * Router
const router = express.Router();

// * Rotas
router.post('/experiencias', authenticateToken, apenasCandidatos, uploadExperienciaImg.single("imagem"), ExperienciaController.adicionar);
router.get('/experiencias/info', authenticateToken, ExperienciaController.listar);
router.get('/experiencias/all', authenticateToken, apenasAdmins, ExperienciaController.listarTodos);
router.get('/experiencias/public', authenticateToken, ExperienciaController.listarTodosPublic);
router.delete('/experiencias/:xp', authenticateToken, apenasCandidatos, ExperienciaController.remover);

// * Export
module.exports = router;