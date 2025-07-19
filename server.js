//Imports
const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
//Reativar depois dos testes
//const { limiteGeral } = require('./middlewares/rateLimit.js');

//Routes
const loginRoutes = require('./routes/logins.js');
const perfilRoutes = require('./routes/perfil.js');
const usuarioRoutes = require('./routes/usuarios.js');
const tagRoutes = require('./routes/tags.js');
const experienciaRoutes = require('./routes/experiencias.js');
const empresaRoutes = require('./routes/empresas.js');
const tiposRoutes = require('./routes/tipos.js');
const chatRoutes = require('./routes/chats.js');

//Dotenv
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const server = require('http').createServer(app);
const io = require('socket.io')(server);

let roomMessages = {};
io.on('connection', socket =>{
    console.log(`Socket conectado: ${socket.id}`)

    socket.on('joinRoom', (roomId) =>{
        socket.join(roomId)
        console.log(`Socket ${socket.id} entrou na sala ${roomId}`)

        if (!roomMessages[roomId]) {
            roomMessages[roomId] = [];
        }
        socket.emit('previousMessages', roomMessages[roomId]);
    });


    socket.on('sendMessage', data =>{
        const roomId = data.room;

        if (!roomMessages[roomId]) {
            roomMessages[roomId] = [];
        }

        roomMessages[roomId].push(data);
        
        io.to(roomId).emit('receivedMessage', data)
    });

    socket.on('leaveRoom', (roomId) => {
        socket.leave(roomId);
    });
})

app.set('trust proxy', 1);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
//Reativar depois dos testes
//app.use(limiteGeral);

//tasks
require('./tasks/cronLimpezaMensagens.js')
require('./tasks/cronLimpezaTokens.js')

//Rotas
app.use(loginRoutes);
app.use(perfilRoutes);
app.use(usuarioRoutes);
app.use(tagRoutes);
app.use(experienciaRoutes);
app.use(empresaRoutes);
app.use(tiposRoutes);
app.use(chatRoutes);

//Porta do servidor
server.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));
