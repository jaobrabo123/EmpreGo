//Conexão com o Cloudinary (nuvem das imagens)
import { v2 as cloudinary } from 'cloudinary';

// Importando dotenv
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;
