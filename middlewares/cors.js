import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config()

const render = process.env.CORS_ORIGINS

const corsConfig = {
  origin: render,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}

export default cors(corsConfig);