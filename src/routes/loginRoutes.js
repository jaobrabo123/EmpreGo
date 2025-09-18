// * Imports
const express = require('express');
const LoginController = require('../controllers/loginController.js')
const { limiteLogin } = require('../middlewares/rateLimit.js');

// * Router
const router = express.Router();

// * Rotas
router.post('/login', limiteLogin, LoginController.logarCandidato);
router.post('/login-empresa', limiteLogin, LoginController.logarEmpresa)
router.post('/logout', LoginController.deslogar);

// * Export
module.exports = router;