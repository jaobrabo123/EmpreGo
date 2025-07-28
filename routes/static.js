//Importações
const express = require('express');
const path = require('path');
const router = express.Router();

const pages = path.join(__dirname, '..', 'public', 'pages');

//Página Inicial
router.get('/', (req, res) => {
  res.sendFile(path.join(pages, 'index.html'))
})

//Página de login e cadastro
router.get('/login', (req, res) => {
  res.sendFile(path.join(pages, 'login.html'));
});

//Página do painel de ADMINS
router.get('/painel', (req, res) =>{
  res.sendFile(path.join(pages, 'adminPanel.html'))
})

//Página do sobre
router.get('/sobre', (req, res)=>{
  res.sendFile(path.join(pages, 'sobre.html'))
})

//Página do suporte
router.get('/suporte', (req, res)=>{
  res.sendFile(path.join(pages, 'suporte.html'))
})

//Páginas dos chats
router.get('/chats', (req, res)=>{
  res.sendFile(path.join(pages, 'chat.html'))
})

//Página para vizualizar perfil de um usuário
/*router.get('/perfil', (req, res)=>{
  res.sendFile(path.join(pages, 'profileView.html'))
})*/

//Página do perfil do candidato
router.get('/perfil/candidato', (req,res)=>{
  res.sendFile(path.join(pages, 'profile.html'))
})

//Página de editar perfil do candidato
router.get('/perfil/candidato/editar', (req,res)=>{
  res.sendFile(path.join(pages, 'editarPerfil.html'))
})

//Página do perfil da empresa
router.get('/perfil/empresa', (req, res)=>{
  res.sendFile(path.join(pages, 'profileCompany.html'))
})

//Página para vizualizar as experiências dos usuários
/*router.get('/experiencias', (req, res)=>{
  res.sendFile(path.join(pages, 'profileView.html'))
})*/

//Página do caixa maker de experiências
router.get('/experiencias/criar', (req, res)=>{
  res.sendFile(path.join(pages, 'caixaMaker.html'))
})

//Página de ver as empresas
router.get('/empresas', (req,res)=>{
  res.sendFile(path.join(pages, 'vagas.html'))
})

//Página de ver os candidatos
/*router.get('/candidatos', (req,res)=>{
  res.sendFile(path.join(pages, '?.html'))
})*/

module.exports = router;