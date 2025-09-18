// * Imports e Configurações
require('module-alias/register');
require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const { limiteGeral } = require('@middlewares/rateLimit.js');
const errorHandler = require('@middlewares/globalErrors.js')
const setupSockets = require('@sockets/connection.js');

// * Inicialização do servidor
const app = express();
const port = process.env.PORT || 3001;
const server = require('http').createServer(app);
const io = require('socket.io')(server);
app.set('trust proxy', 1);

// * Middlewares globais
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(limiteGeral);

// * Sockets
setupSockets(io);

// * Cron Tasks
require('@tasks/cronLimpezaMensagens.js');
require('@tasks/cronLimpezaTokens.js');
require('@tasks/cronLimpezaCandidatosPendentes.js');

// * Rotas
app.use(require('@routes/staticRoutes.js'))
app.use(require('@routes/loginRoutes.js'));
app.use(require('@routes/perfilRoutes.js'));
app.use(require('@routes/candidatosRoutes.js'));
app.use(require('@routes/tagsRoutes.js'));
app.use(require('@routes/experienciasRoutes.js'));
app.use(require('@routes/empresasRoutes.js'));
app.use(require('@routes/tipoRoutes.js'));
app.use(require('@routes/chatsRoutes.js'));
app.use(require('@routes/mensagensRoutes.js'));
app.use(require('@routes/favoritosRoutes.js'));

// * Tratamento de erros
app.use(errorHandler);

// * Porta do servidor
server.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));
