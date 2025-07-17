//Imports
const express = require("express");
const pool = require("../config/db.js");
const { popularTabelaExperiencias, removerExperiencia } = require("../services/experienciaService.js");
const { authenticateToken, apenasAdmins, apenasCandidatos } = require("../middlewares/auth.js");
const { ErroDeValidacao, ErroDeAutorizacao} = require("../utils/erroClasses.js");

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

router.post('/exps', authenticateToken, apenasCandidatos, uploadExp.single("imagem"), async (req, res) => {
  try {
    const { titulo, descricao } = req.body;
    const id = req.user.id;
    const imagem = req.file?.path || "imagem padrão";

    await popularTabelaExperiencias(titulo, descricao, imagem, id);
    res.status(201).json({ message: "Experiência cadastrada com sucesso!" });
  } catch (error) {
    if (error instanceof ErroDeValidacao) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Erro ao cadastrar experiência: " + error.message });
  }
});

//Rota para pegar as experiências do usuário
router.get("/exps", authenticateToken, async (req, res) => {
  try {
    const id = req.user.id;

    const resultado = await pool.query(
      `SELECT e.titulo, e.descricao, e.imagem
      FROM experiencias e
      JOIN candidatos c ON e.candidato = c.id
      WHERE e.candidato = $1
      ORDER BY e.data_criacao DESC`,
      [id]
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error("Erro no GET /exps:", error);
    res.status(500).json({ error: "Erro ao buscar experiências: " + error.message });
  }
});

router.delete('/exps/:xp', authenticateToken, apenasCandidatos, async (req, res) => {
  try {
    const { xp } = req.params;
    const id = req.user.id;
    const nivel = req.user.nivel;

    await removerExperiencia(xp, id, nivel);

    res.status(200).json({ message: "Experiência removida com sucesso." });

  } catch (erro) {
    if (erro instanceof ErroDeAutorizacao) {
      return res.status(403).json({ error: erro.message });
    }else
    if (erro instanceof ErroDeValidacao){
      return res.status(400).json({ error: erro.message })
    }
    res.status(500).json({ error: "Erro ao remover experiência: " + erro.message })
  }
});

router.get('/exps/all', authenticateToken, apenasAdmins, async (req, res) => {
  try {
    const experiencias = await pool.query(`
      select e.id, e.titulo, e.descricao, c.email as email_candidato, e.data_criacao
      from experiencias e join candidatos c 
      on e.candidato = c.id
    `);
    res.status(200).json(experiencias.rows);
  } catch (erro) {
    res.status(500).json({ error: `Erro ao buscar todas as experiências: ${ erro?.message || "erro desconhecido" }`});
  }
});

module.exports = router;