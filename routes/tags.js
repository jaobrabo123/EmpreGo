//Imports
const express = require('express');
const pool = require('../config/db.js');
const { popularTabelaTags } = require('../services/tagServices.js');
const { authenticateToken, apenasAdmins } = require('../middlewares/auth.js');
const ErroDeValidacao = require('../utils/erroValidacao.js')

//Router
const router = express.Router();

//Rota pra adicionar tag ao usuário
router.post('/tags', authenticateToken, async (req, res) => {
  try {
    const { nome } = req.body;
    const id = req.user.id;

    /*if (!nome_tag || nome_tag.trim().length === 0) {
      return res.status(400).json({ error: 'Nome da tag não pode estar vazio.' });
    }

    if (nome_tag.trim().length > 20) {
      return res.status(400).json({ error: 'O nome da tag deve ter no máximo 20 caracteres.' });
    }

    nome_tag = nome.trim()*/

    await popularTabelaTags(nome, id);
    res.status(201).json({ message: 'Tag cadastrada com sucesso!' });
  } catch (error) {
    if (error instanceof ErroDeValidacao) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro ao cadastrar tag: ' + error.message });
  }
});

//Rota para pegar  as tags
router.get('/tags', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM tags');
    res.json(resultado.rows);
  } catch (error) {
    console.error('Erro no GET /tags:', error);
    res.status(500).json({error: 'Erro ao buscar tags: ' + error.message});
  }
});

router.get('/tags-all', authenticateToken, apenasAdmins, async (req,res)=>{
  try{
    const tags = await pool.query(`select t.id, t.nome, c.email as email_candidato, t.data_criacao from tags t join candidatos c on t.candidato = c.id`)
    res.status(200).json(tags.rows)
  }
  catch(erro){
    res.status(500).json({ error: `Erro ao buscar tags: ${erro?.message||'erro desconhecido'}` });
  }
})

module.exports = router;