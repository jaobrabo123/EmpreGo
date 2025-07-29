//Imports
require('module-alias/register');
const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');

dotenv.config();

//Limites de requisições HTTP
const { limiteGeral } = require('@middlewares/rateLimit.js');

//Routes
const staticRoutes = require('@routes/staticRoutes.js')
const loginRoutes = require('@routes/loginRoutes.js');
const perfilRoutes = require('@routes/perfilRoutes.js');
const candidatosRoutes = require('@routes/candidatosRoutes.js');
const tagsRoutes = require('@routes/tagsRoutes.js');
const experienciasRoutes = require('@routes/experienciasRoutes.js');
const empresasRoutes = require('@routes/empresasRoutes.js');
const tipoRoutes = require('@routes/tipoRoutes.js');
const chatsRoutes = require('@routes/chatsRoutes.js');
const mensagensRoutes = require('@routes/mensagensRoutes.js');

//Sockets
const setupChat = require('@sockets/chatSocket.js');

const app = express();
const port = process.env.PORT || 3001;
const server = require('http').createServer(app);
const io = require('socket.io')(server);

setupChat(io)

app.set('trust proxy', 1);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(limiteGeral);


//tasks
require('@tasks/cronLimpezaMensagens.js')
require('@tasks/cronLimpezaTokens.js')
require('@tasks/cronLimpezaCandidatosPendentes.js')

//Rotas
app.use(staticRoutes)
app.use(loginRoutes);
app.use(perfilRoutes);
app.use(candidatosRoutes);
app.use(tagsRoutes);
app.use(experienciasRoutes);
app.use(empresasRoutes);
app.use(tipoRoutes);
app.use(chatsRoutes);
app.use(mensagensRoutes);

//Porta do servidor
server.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));
