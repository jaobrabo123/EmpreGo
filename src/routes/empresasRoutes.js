//Imports
const express = require("express");
const { authenticateToken, apenasAdmins, apenasEmpresa } = require("../middlewares/auth.js");
const EmpresaController = require('../controllers/empresaController.js');

//Router
const router = express.Router();

//Rotas
router.post('/empresas', EmpresaController.cadastrar);
router.post('/empresas/alot', authenticateToken, apenasAdmins, EmpresaController.cadastrarVarias);
router.get('/empresas/all', authenticateToken, apenasAdmins, EmpresaController.listarTodas);
router.get('/empresas/public', authenticateToken, EmpresaController.listarTodasPublic);
router.delete('/empresas/:em', authenticateToken, apenasEmpresa, EmpresaController.remover);

module.exports = router;