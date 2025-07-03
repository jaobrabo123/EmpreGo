//Imports
const express = require('express');
const pool = require('../db.js')
const { popularTabelaExperiencias } = require('../app.js')
const {authenticateToken} = require('../middlewares/auth.js');
// Cloudinary + Multer
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinary.js');

// storage para as imagens das experiencias
const expStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'experiencias', //pasta no Cloudinary para as experiencias
    allowed_formats: ['jpg', 'jpeg', 'png']/*,
    transformation: [
      { width: 300, height: 275, crop: 'limit', quality: 'auto:best'} // colocar com uma qualidade melhor depois
    ]*/
  }
});
const uploadExp = multer({ storage: expStorage }); 

//Router
const router = express.Router();

router.post('/exps', authenticateToken, uploadExp.single('img_exp'), async (req, res) => {
  try {
    const { titulo_exp, descricao_exp } = req.body;
    const id_usuario = req.user.id;
    const img_exp = req.file?.path || 'imagem padrão';

    await popularTabelaExperiencias(titulo_exp, descricao_exp, img_exp, id_usuario);
    res.status(201).json({ message: 'Experiência cadastrada com sucesso!' });
  } catch (error) {
    console.error('Erro ao cadastrar experiência:', error);
    res.status(500).json({ error: 'Erro ao cadastrar experiência: ' + error.message });
  }
});

//Rota para pegar as experiências do usuário
router.get('/exps', authenticateToken, async (req, res) => {
  try {
    const id_usuario = req.user.id;

    const resultado = await pool.query(
      `SELECT e.titulo_exp, e.descricao_exp, e.img_exp
      FROM experiencia_usuario e
      JOIN cadastro_usuarios c ON e.id_usuario = c.id_usuario
      WHERE e.id_usuario = $1
      ORDER BY e.data_exp DESC`,
      [id_usuario]
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error('Erro no GET /exps:', error);
    res.status(500).send('Erro ao buscar experiências: ' + error.message);
  }
});

module.exports = router;