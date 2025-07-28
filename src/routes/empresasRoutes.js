//Imports
const express = require("express");
const { authenticateToken, apenasAdmins, apenasEmpresa } = require("../middlewares/auth.js");
const EmpresaController = require('../controllers/empresaController.js')

//Router
const router = express.Router();

//Rotas
router.post('/empresas', EmpresaController.cadastrar);
router.get('/empresas/all', authenticateToken, apenasAdmins, EmpresaController.listarTodas);
router.delete('/empresas/:em', authenticateToken, apenasEmpresa, EmpresaController.remover);

module.exports = router;