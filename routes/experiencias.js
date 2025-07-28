//Imports
const express = require("express");
const ExperienciaController = require('../controllers/experienciaController.js')
const { authenticateToken, apenasAdmins, apenasCandidatos } = require("../middlewares/auth.js");
// Cloudinary + Multer
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary.js");

// storage para as imagens das experiencias
const expStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "experiencias", //pasta no Cloudinary para as experiencias
    allowed_formats: ["jpg", "jpeg", "png", 'webp'],
    format: "webp",
    transformation: [
      {  
        quality: 'auto',
        fetch_format: 'webp'
      }
    ],
  },
});
const uploadExp = multer({ storage: expStorage });

//Router
const router = express.Router();

//Rotas
router.post('/experiencias', authenticateToken, apenasCandidatos, uploadExp.single("imagem"), ExperienciaController.adicionar);
router.get('/experiencias/info', authenticateToken, ExperienciaController.listar);
router.get('/experiencias/all', authenticateToken, apenasAdmins, ExperienciaController.listarTodos);
router.delete('/experiencias/:xp', authenticateToken, apenasCandidatos, ExperienciaController.remover);

module.exports = router;