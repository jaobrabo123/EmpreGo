// * Conexão com o Cloudinary para arquivos Raw
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_RAW_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_RAW_API_KEY,
  api_secret: process.env.CLOUDINARY_RAW_API_SECRET
});

module.exports = cloudinary;