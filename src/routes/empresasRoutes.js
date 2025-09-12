//Imports
const express = require("express");
const { authenticateToken, apenasAdmins, apenasEmpresa, apenasCandidatos } = require("../middlewares/auth.js");
const EmpresaController = require('../controllers/empresaController.js');

//Router
const router = express.Router();

//Rotas
router.post('/empresas', EmpresaController.cadastrar);
router.post('/empresas/alot', authenticateToken, apenasAdmins, EmpresaController.cadastrarVarias);
router.get('/empresas/all', authenticateToken, apenasAdmins, EmpresaController.listarTodas);
router.get('/empresas/public', authenticateToken, apenasCandidatos, EmpresaController.listarTodasPublic);
router.delete('/empresas/:em', authenticateToken, apenasEmpresa, EmpresaController.remover);
router.get('/empresas/search', authenticateToken, apenasCandidatos, EmpresaController.pesquisar);

module.exports = router;