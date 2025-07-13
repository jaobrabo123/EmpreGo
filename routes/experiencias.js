//Imports
const express = require('express');
const pool = require('../config/db.js')
const { popularTabelaExperiencias } = require('../services/experienciaService.js')
const { authenticateToken, apenasAdmins } = require('../middlewares/auth.js');
const ErroDeValidacao = require('../utils/erroValidacao.js')

// Cloudinary + Multer
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary.js');

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

router.post('/exps', authenticateToken, uploadExp.single('imagem'), async (req, res) => {
  try {
    const { titulo, descricao } = req.body;
    const id = req.user.id;
    const imagem = req.file?.path || 'imagem padrão';

    await popularTabelaExperiencias(titulo, descricao, imagem, id);
    res.status(201).json({ message: 'Experiência cadastrada com sucesso!' });
  } catch (error) {
    if (error instanceof ErroDeValidacao) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro ao cadastrar experiência: ' + error.message });
  }
});

//Rota para pegar as experiências do usuário
router.get('/exps', authenticateToken, async (req, res) => {
  try {
    const id = req.user.id;

    const resultado = await pool.query(
      `SELECT e.titulo, e.descricao, e.imagem
      FROM experiencias e
      JOIN candidatos c ON e.candidato = c.id
      WHERE e.candidato = $1
      ORDER BY e.add_em DESC`,
      [id]
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error('Erro no GET /exps:', error);
    res.status(500).json({ error: 'Erro ao buscar experiências: ' + error.message });
  }
});

router.get('/exps-all', authenticateToken, apenasAdmins, async (req, res) =>{
  try{
    const experiencias = await pool.query(`
      select e.id, e.titulo, e.descricao, c.email as email_candidato, e.data_criacao
      from experiencias e join candidatos c 
      on e.candidato = c.id
    `)
    res.status(200).json(experiencias.rows)
  }
  catch(erro){
    res.status(500).json({error: `Erro ao buscar todas as experiências: ${erro?.message||'erro desconhecido'}` })
  }
});

module.exports = router;