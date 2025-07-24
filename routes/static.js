//Importações
const express = require('express');
const path = require('path');
const router = express.Router();

//Página Inicial
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'index.html'))
})

//Página de login e cadastro
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'login.html'));
});

//Página do painel de ADMINS
router.get('/painel', (req, res) =>{
  res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'adminPanel.html'))
})

//Página do sobre
router.get('/sobre', (req, res)=>{
  res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'sobre.html'))
})

//Página do suporte
router.get('/suporte', (req, res)=>{
  res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'suporte.html'))
})

//Páginas dos chats
router.get('/chats', (req, res)=>{
  res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'chat.html'))
})

//Página para vizualizar perfil de um usuário
/*router.get('/perfil', (req, res)=>{
  res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'profileView.html'))
})*/

//Página do perfil do candidato
router.get('/perfil/candidato', (req,res)=>{
  res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'profile.html'))
})

//Página de editar perfil do candidato
router.get('/perfil/candidato/editar', (req,res)=>{
  res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'editarPerfil.html'))
})

//Página do perfil da empresa
router.get('/perfil/empresa', (req, res)=>{
  res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'profileCompany.html'))
})

//Página para vizualizar as experiências dos usuários
/*router.get('/experiencias', (req, res)=>{
  res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'profileView.html'))
})*/

//Página do caixa maker de experiências
router.get('/experiencias/criar', (req, res)=>{
  res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'caixaMaker.html'))
})

//Página de ver as empresas
router.get('/empresas', (req,res)=>{
  res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'vagas.html'))
})

//Página de ver os candidatos
/*router.get('/candidatos', (req,res)=>{
  res.sendFile(path.join(__dirname, '..', 'public', 'pages', '?.html'))
})*/

module.exports = router;