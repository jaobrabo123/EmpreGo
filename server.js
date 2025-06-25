//Imports
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import corsMiddleware  from './middlewares/cors.js';

//Routes
import loginRoutes from './routes/logins.js'
import perfilRoutes from './routes/perfil.js'
import usuarioRoutes from './routes/usuarios.js'
import tagRoutes from './routes/tags.js'
import experienciaRoutes from './routes/experiencias.js'
import empresaRoutes from './routes/empresas.js'
import tiposRoutes from './routes/tipos.js';

//Dotenv
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(corsMiddleware);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

//Rotas
app.use(loginRoutes);
app.use(perfilRoutes);
app.use(usuarioRoutes);
app.use(tagRoutes);
app.use(experienciaRoutes);
app.use(empresaRoutes);
app.use(tiposRoutes);

//Porta do servidor
app.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));
